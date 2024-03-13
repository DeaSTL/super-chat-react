package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"

	"github.com/gorilla/websocket"
	"jmhart.dev/super-chat/utils"
)

func GenB64(length int) string {
	dembytes := make([]byte, length)
	_, err := rand.Read(dembytes)
	if err != nil {
		return ""
	}
	encoded := base64.URLEncoding.EncodeToString(dembytes)
	return encoded
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	Error: func(w http.ResponseWriter, r *http.Request, status int, reason error) {
		log.Printf("Error status: %d", status)
	},
}

type Message struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

type UserMessage struct {
	Content string `json:"content"`
	Name    string `json:"name"`
	Color   string `json:"color"`
	UserID  string `json:"user_id"`
}

// type UserData struct {
// 	UserID string `json:"user_id"`
// }

type PublicUserData struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Color    string `json:"color"`
}

type ConnectionContext struct {
	AllClients *[]*ConnectionContext
	Client     *websocket.Conn
	RoomID     string
	Username   string
	Color      string
	SessionID  string
	Closed     bool
}

func (ctx *ConnectionContext) LogConnections() {
	for _, client := range *ctx.AllClients {
		log.Printf("Client %v Room: %v", client.SessionID, client.RoomID)
	}
}

func (ctx *ConnectionContext) GetAllPublicUsers() []PublicUserData {
	user_data := []PublicUserData{}

	for _, conn := range *ctx.AllClients {
		user_data = append(user_data, conn.GetPublicData())
	}

	return user_data
}

func (ctx *ConnectionContext) GetPublicData() PublicUserData {
	return PublicUserData{
		Username: ctx.Username,
		Color:    ctx.Color,
	}
}

func (ctx *ConnectionContext) New(connections *[]*ConnectionContext, client *websocket.Conn) {
	ctx.AllClients = connections
	ctx.Client = client
	ctx.RoomID = ""
	ctx.SessionID = GenB64(32)
	ctx.Color = utils.GenerateRandomHexColor()
}

func (ctx *ConnectionContext) broadcastMessage(message any, event string) error {
	for _, conn := range *ctx.AllClients {
		err := conn.sendMessage(message, event)

		if err != nil {
			log.Printf("Error broadcasting: %v", err)
		}

		log.Printf("Broadcasting message: %v to: %v", message, ctx.SessionID)
	}
	return nil
}

func (ctx *ConnectionContext) sendMessage(message any, event string) error {

	new_message := Message{
		Type: event,
	}
	json_data, err := json.Marshal(message)

	new_message.Data = json_data

	if err != nil {
		return fmt.Errorf("Could not marshall json in broadcasst err: %v ", err)
	}

	err = ctx.Client.WriteJSON(new_message)

	if err != nil {
		return fmt.Errorf("Could not send json in broadcasst err: %v ", err)
	}

	log.Printf("Broadcasting message: %v to: %v", message, ctx.SessionID)
	return nil
}

func (ctx *ConnectionContext) messageHandler(message *Message) error {
	switch message.Type {
	// echos message to all connected users
	case "user_message":

		new_message := UserMessage{}

		err := json.Unmarshal(message.Data, &new_message)

		new_message.UserID = ctx.SessionID
		new_message.Color = ctx.Color

		if err != nil {
			return fmt.Errorf("Couldn't unmarshall message: %v", err)
		}

		ctx.broadcastMessage(new_message, "user_message")
		break
	case "get_user":
		user_data := PublicUserData{
			UserID: ctx.SessionID,
		}
		ctx.sendMessage(user_data, "user_data")
		break
	case "set_username":
		new_username := ""
		err := json.Unmarshal(message.Data, &new_username)
		if err != nil {
			return fmt.Errorf("Error setting username: %v", err)
		}
		ctx.Username = new_username

		log.Printf("Username: %v", ctx.Username)

		public_users := ctx.GetAllPublicUsers()

		err = ctx.broadcastMessage(public_users, "update_user_list")

		user_data := PublicUserData{
			UserID:   ctx.SessionID,
			Username: ctx.Username,
		}
		ctx.sendMessage(user_data, "user_data")

		if err != nil {
			return err
		}
		break
	}
	return nil
}

func newMessageListener(ctx *ConnectionContext) {
	go func(ctx *ConnectionContext) {
		for {
			message := Message{}
			err := ctx.Client.ReadJSON(&message)

			if err != nil {

				log.Printf("Error reading json message: %v", reflect.TypeOf(err).Name())
				break
			}

			err = ctx.messageHandler(&message)

			if err != nil {
				log.Printf("Error handling message: %v ", err)
				continue
			}
		}
		defer ctx.Client.Close()
	}(ctx)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func newCloseHandler(ctx *ConnectionContext) func(int, string) error {
	return func(code int, text string) error {
		log.Printf("Client disconnected: %v", ctx.SessionID)
		ctx.Closed = true
		var index int

		for c_index, conn := range *ctx.AllClients {
			if conn.SessionID == ctx.SessionID {
				index = c_index
			}
		}

		*ctx.AllClients = append((*ctx.AllClients)[:index], (*ctx.AllClients)[index+1:]...)
		log.Printf("New Connection List")
		ctx.LogConnections()

		all_public_data := ctx.GetAllPublicUsers()

		err := ctx.broadcastMessage(all_public_data, "update_user_list")

		if err != nil {
			return err
		}

		return nil
	}
}

func handleNewConnection(connections *[]*ConnectionContext) func(http.ResponseWriter, *http.Request) {

	return func(w http.ResponseWriter, r *http.Request) {
		log.Print("Attempting to connect new client")

		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Printf("Could not upgrade connection: %v", err)
		}

		new_ctx := ConnectionContext{}
		*connections = append(*connections, &new_ctx)

		new_ctx.New(connections, conn)

		conn.SetCloseHandler(newCloseHandler(&new_ctx))

		log.Printf("New connection: %v", new_ctx)
		new_ctx.LogConnections()

		all_public_data := new_ctx.GetAllPublicUsers()

		log.Printf("Public data: %+v", all_public_data)

		err = new_ctx.broadcastMessage(all_public_data, "update_user_list")

		if err != nil {
			log.Printf("Could not send update: %v", err)
		}
		newMessageListener(&new_ctx)
	}
}

func main() {

	connections := []*ConnectionContext{}
	log.Printf("Starting chat server")

	mux := http.NewServeMux()

	mux.Handle("/", corsMiddleware(http.HandlerFunc(handleNewConnection(&connections))))
	mux.Handle("/health", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("good"))
	}))
	http.ListenAndServe("0.0.0.0:8080", mux)
}
