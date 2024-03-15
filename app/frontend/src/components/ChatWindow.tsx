import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import { $messages} from "../store/Server";
import { useStore } from "@nanostores/react";



export default function ChatWindow() {
  
  const messages = useStore($messages)


  const endOfMessage = useRef(null);

  useEffect(()=>{
    if(endOfMessage.current){
      (endOfMessage.current as HTMLElement).scrollIntoView({behavior: "smooth"}); 
    }
  },[messages])
  return (
    <div className="card-light m-2 p-2" 
      style={
        {
        height: "80vh",
        overflowY:"scroll",
        }
      } >
      {
        messages.map((message:UserMessage,key:number)=>{
          return (<ChatBubble message_data={message} key={key}/>)
        })
      }
      <div ref={endOfMessage}/>
    </div>
  )
}
