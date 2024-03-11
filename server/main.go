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
	UserID  string `json:"user_id"`
}

type UserData struct {
	UserID string `json:"user_id"`
}

type ConnectionContext struct {
	AllClients *[]*ConnectionContext
	Client     *websocket.Conn
	RoomID     string
	SessionID  string
	Closed     bool
}

func (ctx *ConnectionContext) LogConnections() {
	for _, client := range *ctx.AllClients {
		log.Printf("Client %v Room: %v", client.SessionID, client.RoomID)
	}
}

func (ctx *ConnectionContext) New(connections *[]*ConnectionContext, client *websocket.Conn) {
	ctx.AllClients = connections
	ctx.Client = client
	ctx.RoomID = ""
	ctx.SessionID = GenB64(32)
}

func (ctx *ConnectionContext) broadcastMessage(message *Message) {
	for _, conn := range *ctx.AllClients {
		err := conn.Client.WriteJSON(message)

		log.Printf("Broadcasting message: %v to: %v", message, ctx.SessionID)

		if err != nil {
			log.Printf("Error broadcasting message : %v", err)
		}
	}
}

func (ctx *ConnectionContext) sendMessage(message *Message) error {
	log.Printf("Sending new socket message : %+v ", message)
	message_str, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("Error marshalling message: %v", err)
	}
	err = ctx.Client.WriteMessage(1, message_str)
	if err != nil {
		return fmt.Errorf("Error sending message: %v ", err)
	}
	return nil
}

func (ctx *ConnectionContext) messageHandler(message *Message) error {
	switch message.Type {
	// echos message to all connected users
	case "user_message":
		message_data := UserMessage{}
		err := json.Unmarshal(message.Data, &message_data)
		if err != nil {
			return err
		}

		new_message := message_data
		new_message.UserID = ctx.SessionID

		message.Data, err = json.Marshal(new_message)

		ctx.broadcastMessage(message)
		log.Printf("Recieved message: %+v from session:%+v", message_data, ctx)
	case "get_user":
		user_data := UserData{
			UserID: ctx.SessionID,
		}
		json_data, err := json.Marshal(user_data)

		message.Data = json_data

		message.Type = "user_data"

		log.Printf("%+v", user_data)

		if err != nil {
			return err
		}

		ctx.sendMessage(message)
	}
	return nil
}

func newMessageListener(ctx ConnectionContext) {
	go func(ctx ConnectionContext) {
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

		newMessageListener(new_ctx)
	}
}

func main() {

	connections := []*ConnectionContext{}
	log.Printf("Starting chat server")

	mux := http.NewServeMux()

	mux.Handle("/", corsMiddleware(http.HandlerFunc(handleNewConnection(&connections))))
	http.ListenAndServe("0.0.0.0:8080", mux)
}
