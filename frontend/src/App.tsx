import { useEffect, useState } from 'react'
import './App.css'
import './index.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
//import './styles/custom.scss'
import ChatWindow from './components/ChatWindow'
import MessagePrompt from './components/MessagePrompt'
import { Card } from 'react-bootstrap'
import GreetingCard from './components/GreetingCard'
import OnlineUsersPanel from './components/OnlineUsersPanel'
import UsersDropdown from './components/UsersDropdown'

type Message = {
  type: string;
  data: any;
}






function App() {

  const [messages, setMessages] = useState<UserMessage[]>([])

  const [user, setUser] = useState<UserData | null>(null)
    
  const [username, setUsername] = useState("")

  const [users, setUsers] = useState<UserData[]>([])
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

  useEffect(()=>{
      sendSocketMessage({},"get_user")
  },[ws])

  useEffect(() => {
    <div>UsersDropdown</div>
    sendSocketMessage(username,"set_username")
  }, [username])
  
  useEffect(()=>{

    //const hostname:string = "a634903d1a4b94f9cbae1ca502b27bf5-1875044850.us-east-2.elb.amazonaws.com"

    const hostname:string = "localhost"


    const socket = new WebSocket(`ws://${hostname}:8080`)

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
        default:
          return
      }
    };
    
    socket.onerror = (error) => {
      console.log(`websocket error: `, error)
    };

    return () => {
        socket.close()

      }
  },[])

  return (
    <div className="flex flex-wrap">
      <GreetingCard setUsername={setUsername} show={username == ""}/>
        <div className="w-2/12 p-2">
          <OnlineUsersPanel users={users}/>
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
