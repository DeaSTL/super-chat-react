package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strconv"

	"jmhart.dev/super-chat/connection"
	"jmhart.dev/super-chat/utils"
)

type UserMessage struct {
	Content string `json:"content"`
	Name    string `json:"name"`
	Color   string `json:"color"`
	UserID  string `json:"user_id"`
}

type UserData struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Color    string `json:"color"`
}

var Users map[string]*UserData
var Server connection.SocketServer

func pushUpdateUserList() error {

	user_list := []UserData{}

	for _, user := range Users {
		user_list = append(user_list, *user)
	}

	return Server.BroadcastMessage("update_user_list", user_list)
}

func main() {

	log.Printf("Starting chat server")

	mux := http.NewServeMux()

	Users = map[string]*UserData{}

	Server = connection.SocketServer{}
	Server.New()

	Server.OnConnection = func(ctx *connection.ConnectionContext) {
		random_id := "user_"
		random_id += strconv.FormatInt(int64(rand.Int()), 10)

		Users[ctx.SessionID] = &UserData{
			Username: random_id,
			Color:    utils.GenerateRandomHexColor(),
			UserID:   utils.GenB64(32),
		}
	}

	Server.OnDisconnect = func(ctx *connection.ConnectionContext) {
		delete(Users, ctx.SessionID)
		pushUpdateUserList()
	}

	Server.Listen("echo",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {

			ctx.SendMessage("echo", message)
		})

	Server.Listen("get_user",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			err := ctx.SendMessage("user_data", Users[ctx.SessionID])
			if err != nil {
				log.Println(err)
				return
			}
		})

	Server.Listen("user_message",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			new_message := UserMessage{}
			err := json.Unmarshal(*message, &new_message)
			if err != nil {
				log.Print(err)
				return
			}

			new_message.UserID = Users[ctx.SessionID].UserID
			new_message.Color = Users[ctx.SessionID].Color

			Server.BroadcastMessage("user_message", new_message)
		})
	Server.Listen("set_username",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			new_username := ""
			json.Unmarshal(*message, &new_username)

			Users[ctx.SessionID].Username = new_username
			err := pushUpdateUserList()

			if err != nil {
				log.Println(err)
				return
			}

			err = ctx.SendMessage("user_data", Users[ctx.SessionID])

			if err != nil {
				log.Println(err)
				return
			}
		})

	Server.Start(mux, "/ws")

	mux.Handle("/health", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("good"))
	}))
	http.ListenAndServe("0.0.0.0:8080", mux)
}
