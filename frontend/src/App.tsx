import { useEffect, useState } from 'react'
import './App.css'

import ChatWindow from './components/ChatWindow'
import MessagePrompt from './components/MessagePrompt'
import { Card } from 'react-bootstrap'

type Message = {
  type: string;
  data: any;
}






function App() {

  const [messages, setMessages] = useState<UserMessage[]>([])

  const [user, setUser] = useState<UserData | null>(null)

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
      name: "some username"
    }

    sendSocketMessage(new_user_message,"user_message")
  }

  useEffect(()=>{
      sendSocketMessage({},"get_user")
  },[ws])
  
  useEffect(()=>{

    const hostname:string = document.location.hostname

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
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md">
          <Card className="p-4">
            <ChatWindow user={user} messages={messages}/>
            <MessagePrompt sendUserMessage={sendUserMessage}/>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App