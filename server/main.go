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

type Room struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (r *Room) New() {
	r.ID = utils.GenB64(32)
}

type UserData struct {
	SessionID string `json:"-"`
	UserID    string `json:"user_id"`
	Username  string `json:"username"`
	RoomID    string `json:"room_id"`
	Color     string `json:"color"`
}

var Users map[string]*UserData
var Server connection.SocketServer
var Rooms map[string]*Room

func pushUpdateUserList(ctx *connection.ConnectionContext) error {

	user_list := []UserData{}

	for _, user := range Users {
		user_list = append(user_list, *user)
	}
	// if ctx != nil {
	//   Server.SendFilter("update_user_list", user_list, func(check_ctx *connection.ConnectionContext) bool {
	//     return Users[check_ctx.SessionID].RoomID == Users[ctx.SessionID].RoomID
	//   })
	// }else{
	// }
	Server.Broadcast("update_user_list", user_list)

	return nil
}

func main() {

	log.Printf("Starting chat server")

	mux := http.NewServeMux()

	Users = map[string]*UserData{}
	Rooms = map[string]*Room{}

	Server = connection.SocketServer{}
	Server.New()

	default_room := Room{
		Name: "general",
	}
	default_room.New()
	Rooms[default_room.ID] = &default_room

	Server.OnConnection = func(ctx *connection.ConnectionContext) {
		random_id := "user_"
		random_id += strconv.FormatInt(int64(rand.Int()), 10)

		Users[ctx.SessionID] = &UserData{
			Username:  random_id,
			Color:     utils.GenerateRandomHexColor(),
			UserID:    utils.GenB64(32),
			SessionID: ctx.SessionID,
			RoomID:    default_room.ID,
		}

	}

	Server.OnDisconnect = func(ctx *connection.ConnectionContext) {
		delete(Users, ctx.SessionID)
		//pushUpdateUserList(ctx)
	}

	Server.Listen("echo",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {

			ctx.Send("echo", message)
		})

	Server.Listen("init",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			err := ctx.Send("user_data", Users[ctx.SessionID])
			if err != nil {
				log.Println(err)
				return
			}

			room_list := []Room{}

			for _, room := range Rooms {
				room_list = append(room_list, *room)
			}

			err = ctx.Send("room_list", room_list)

			if err != nil {
				log.Println(err)
				return
			}
			for i := 0; i < 150; i++ {
				ctx.Send("user_message", UserMessage{
					Content: "Some content",
					Name:    "deez",
					Color:   utils.GenerateRandomHexColor(),
				})
			}

		})
	Server.Listen("set_room",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			room_id := ""
			err := json.Unmarshal(*message, &room_id)
			if err != nil {
				log.Println(err)
				return
			}
			Users[ctx.SessionID].RoomID = room_id

			ctx.Send("user_data", Users[ctx.SessionID])
			pushUpdateUserList(ctx)
		})
	Server.Listen("new_room",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			new_room := Room{}

			err := json.Unmarshal(*message, &new_room)

			if err != nil {
				log.Println(err)
				return
			}

			new_room.New()

			Rooms[new_room.ID] = &new_room

			room_list := []Room{}

			for _, room := range Rooms {
				room_list = append(room_list, *room)
			}

			err = ctx.Send("room_list", room_list)

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
			// sends message to user with matching room id
			Server.SendFilter("user_message", new_message, func(check_ctx *connection.ConnectionContext) bool {
				return Users[check_ctx.SessionID].RoomID == Users[ctx.SessionID].RoomID
			})
		})
	Server.Listen("set_username",
		func(ctx *connection.ConnectionContext, message *json.RawMessage) {
			new_username := ""
			json.Unmarshal(*message, &new_username)

			Users[ctx.SessionID].Username = new_username
			err := pushUpdateUserList(ctx)

			if err != nil {
				log.Println(err)
				return
			}

			err = ctx.Send("user_data", Users[ctx.SessionID])

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
