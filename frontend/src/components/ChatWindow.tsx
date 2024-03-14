import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";


interface IChatWindow{
  messages:UserMessage[]
  user:UserData 
}

export default function ChatWindow(props:IChatWindow) {
  
  const endOfMessage = useRef(null);

  useEffect(() => {
    endOfMessage.current?.scrollIntoView({behavior: "smooth"}); 
  }, [props.messages])

  return (
    <div className="card-light m-2 p-2" 
      style={
        {
        height: "80vh",
        overflowY:"scroll",
        }
      } >
      {
        props.messages.map((message:UserMessage,key:number)=>{
          return (<ChatBubble message_data={message} key={key} current_user={props.user}/>)
        })
      }
      <div ref={endOfMessage}/>
    </div>
  )
}
