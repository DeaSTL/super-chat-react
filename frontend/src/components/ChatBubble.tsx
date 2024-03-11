import { Card } from "react-bootstrap"

interface IMessage {
  message_data: UserMessage
  current_user: UserData
}

export default function ChatBubble({message_data,current_user}:IMessage) {

  let style:string = message_data.user_id == current_user.user_id ? 'ms-auto bg-primary text-white' : 'bg-info text-white'
  return (
    <div className="w-100">
      <Card style={{maxWidth:"55%",width:"fit-content"}} className={`p-2 mb-2 ${style}`}>
        <span style={{fontWeight: "bold"}}>{message_data.name}</span> {message_data.content}
      </Card>
    </div>
  )
}
