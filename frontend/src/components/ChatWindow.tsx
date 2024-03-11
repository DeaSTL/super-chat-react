import { Card, CardBody } from "react-bootstrap";
import ChatBubble from "./ChatBubble";


interface IChatWindow{
  messages:UserMessage[]
  user:UserData
}

export default function ChatWindow(props:IChatWindow) {
  return (
    <>
      <Card style={{height:"80vh",overflow:"scroll"}} > 
        <CardBody>
          {
            props.messages.map((message:UserMessage,key:number)=>{
              return (<ChatBubble message_data={message} key={key} current_user={props.user}/>)
            })
          }
        </CardBody>
      </Card>
    </>
  )
}
