import { Card, CardBody } from "react-bootstrap";
import ChatBubble from "./ChatBubble";


interface IChatWindow{
  messages:UserMessage[]
  user:UserData 
}

export default function ChatWindow(props:IChatWindow) {
  return (
    <>
      <div
      className="card-light"
      style={
          {
          height:"80vh",
          overflowX:"scroll",
          scrollBehavior:"smooth",
          scrollMarginTop:"80vh",
          flexDirection:"column-reverse"
          }
        } > 
        <CardBody>
          {
            props.messages.map((message:UserMessage,key:number)=>{
              return (<ChatBubble message_data={message} key={key} current_user={props.user}/>)
            })
          }
        </CardBody>
      </div>
    </>
  )
}
