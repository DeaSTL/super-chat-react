
type Props = {
  message_data: UserMessage
}

export default function ChatBubble({message_data}:Props) {

  return (
    <div className="w-75">
        <p className="text-gray-200">
        <span
        style={{fontWeight: "bold",color:message_data.color}}>{message_data.name}
        </span> {message_data.content}
        </p>
    </div>
  )
}

