package connection

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"jmhart.dev/super-chat/utils"
)

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

type Listener struct {
	Callback func(*ConnectionContext, *json.RawMessage)
}

type SocketServer struct {
	Connections  *[]*ConnectionContext
	listeners    map[string]Listener
	OnConnection func(*ConnectionContext)
	OnDisconnect func(*ConnectionContext)
}

type ConnectionContext struct {
	Client    *websocket.Conn
	SessionID string
}

type Message struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

func (ss *SocketServer) LogConnections() {
	for _, client := range *ss.Connections {
		log.Printf("Client %v", client.SessionID)
	}
}

func (ss *SocketServer) New() {
	ss.OnConnection = func(ctx *ConnectionContext) {}
	ss.OnDisconnect = func(ctx *ConnectionContext) {}
	ss.listeners = map[string]Listener{}
	ss.Connections = &[]*ConnectionContext{}
}

func (ss *SocketServer) Start(mux *http.ServeMux, endpoint string) {
	mux.Handle(endpoint, http.HandlerFunc(ss.handleNewConnection))
}

func (ss *SocketServer) handleCloseConnection(ctx *ConnectionContext) func(int, string) error {

	return func(code int, text string) error {
		ss.OnDisconnect(ctx)
		var index int

		for c_index, conn := range *ss.Connections {
			if conn.SessionID == ctx.SessionID {
				index = c_index
			}
		}

		*ss.Connections = append((*ss.Connections)[:index], (*ss.Connections)[index+1:]...)

		return nil
	}
}
func (ss *SocketServer) handleNewConnection(w http.ResponseWriter, r *http.Request) {
	log.Print("Attempting to connect new client")

	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Printf("Could not upgrade connection: %v", err)
	}

	new_ctx := ss.newConnection(conn)

	conn.SetCloseHandler(ss.handleCloseConnection(&new_ctx))

	ss.OnConnection(&new_ctx)

	ss.newMessageListener(&new_ctx)
}

func (ss *SocketServer) newMessageListener(ctx *ConnectionContext) {
	go func(ctx *ConnectionContext) {
		for {
			message := Message{}
			err := ctx.Client.ReadJSON(&message)

			if err != nil {

				log.Printf("Error reading json message: %v", err)
				break
			}

			err = ss.messageHandler(ctx, &message)

			if err != nil {
				log.Printf("Error handling message: %v ", err)
				continue
			}
		}
		defer ctx.Client.Close()
	}(ctx)
}

func (ss *SocketServer) messageHandler(ctx *ConnectionContext, message *Message) error {
	for event, listener := range ss.listeners {
		if message.Type == event {

			listener.Callback(ctx, &message.Data)
		} else {

		}
	}
	return nil
}

func (ss *SocketServer) newConnection(conn *websocket.Conn) ConnectionContext {
	new_ctx := ConnectionContext{
		SessionID: utils.GenB64(32),
		Client:    conn,
	}

	*ss.Connections = append(*ss.Connections, &new_ctx)

	return new_ctx
}

func (ss *SocketServer) Broadcast(event string, message any) error {
	for _, conn := range *ss.Connections {
		err := conn.Send(event, message)

		if err != nil {
			log.Printf("Error broadcasting: %v", err)
		}

		log.Printf("Broadcasting message: %v to: %v", message, conn.SessionID)
	}
	return nil
}

func (ss *SocketServer) Listen(event string, listener func(*ConnectionContext, *json.RawMessage)) {
	ss.listeners[event] = Listener{Callback: listener}
}

func (ctx *ConnectionContext) Send(event string, message any) error {

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

func (ss *SocketServer) SendFilter(event string, message any, check func(*ConnectionContext) bool) {
	for _, conn := range *ss.Connections {
		if check(conn) {
			err := conn.Send(event, message)

			if err != nil {
				log.Printf("Error broadcasting: %v", err)
			}

			log.Printf("Sending filtered message: %v to: %v", message, conn.SessionID)
		}
	}
}
