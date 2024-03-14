import { useEffect, useReducer, useState } from 'react'
import './App.css'
import './index.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
//import './styles/custom.scss'
import ChatWindow from './components/ChatWindow'
import MessagePrompt from './components/MessagePrompt'
import GreetingCard from './components/GreetingCard'
import UsersDropdown from './components/UsersDropdown'
import RoomsList from './components/RoomsList'

type Message = {
  type: string;
  data: any;
}



function App() {

  const [messages, setMessages] = useState<UserMessage[]>([])

  const [user, setUser] = useState<UserData | null>(null)
    
  const [username, setUsername] = useState("")

  const [users, setUsers] = useState<UserData[]>([])

  const [rooms, setRooms] = useState<Room[]>([])
  const [ws,setWs] = useState<WebSocket | null>(null)



  const sendSocketMessage = (data:any,type:string) => {
    console.log("Sending new socket message of type: ",type)
    let new_message:Message = {
      type: type,
      data: data
    }
    if(!ws) {
      console.log("Web socket null")
      return
    } 
    ws.send(JSON.stringify(new_message))
  }

  const sendUserMessage = (message:string) => {

    let new_user_message:UserMessage = {
      content: message,
      name: username ?? "anon"
    }

    sendSocketMessage(new_user_message,"user_message")
  }

  const newRoom = (name:string) => {
    let new_room:Room = {
      name:name
    }
    sendSocketMessage(new_room,"new_room")
  }

  const setRoom = (room_id:string) =>{ 
    sendSocketMessage(room_id,"set_room")
    setMessages([])
  }
  

  useEffect(()=>{
      sendSocketMessage({},"init")
  },[ws])

  useEffect(() => {
    <div>UsersDropdown</div>
    sendSocketMessage(username,"set_username")
  }, [username])
  
  useEffect(()=>{

    const hostname:string = "localhost"

    const connection_string:string = `ws://${hostname}:8080/ws`
    const socket = new WebSocket(connection_string)

    socket.onopen = () => {
      console.log("Connected to websocket!")
      setWs(socket);

    }

    socket.onmessage = (event) => {
      const socket_message: Message = JSON.parse(event.data)
      console.log("New socket message: ",socket_message)
      switch(socket_message.type){
        case "user_message":
          let user_message: UserMessage = socket_message.data
          console.log("New message: ",user_message)
          setMessages((prev) => [...prev,user_message]);
          return
        case "user_data":
          let user_data: UserData = socket_message.data
          setUser(user_data)
          return
        case "update_user_list": 
          let users: UserData[] = socket_message.data
          setUsers(users)
          return
        case "room_list":
          let rooms_list: Room[] = socket_message.data

          console.log("room list",rooms_list,socket_message.data)
          setRooms(rooms_list)
          return
        default:
          return
      }
    };
    
    socket.onerror = (error) => {
      console.log(`websocket error: `, error)
    };

    socket.onclose = () => { 
      console.log('web socket closed')
    }

    return () => {
        socket.close()

      }
  },[])

  return (
    <div className="flex flex-wrap">
      <GreetingCard setUsername={setUsername} show={username == ""}/>
        <div className="w-2/12 p-2">
          <RoomsList rooms={rooms} current_user={user} setRoom={setRoom} newRoom={newRoom}/>
        </div>
        <div className="w-10/12 p-2">
          <div className="card-dark">
            <UsersDropdown current_user={user} users={users}/>
            <ChatWindow user={user} messages={messages}/>
            <MessagePrompt sendUserMessage={sendUserMessage}/>
          </div>
        </div>
      </div>
  )
}

export default App
