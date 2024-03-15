import {useState } from 'react'
import { $user, sendSocketMessage } from '../store/Server'
import { useStore } from '@nanostores/react'


export default function MessagePrompt() {

  const [input, setInput] = useState("")
  const user = useStore($user)

  const maxlength = 500
  

  const submitInput = () => {
    if(input != "" && input.length < 500 + 1){
      sendSocketMessage("user_message",{name:user.username,content:input.valueOf()})
      setInput("")
    }
  }


  const keyPressed = (e:any)=> {
    if(e.key == "Enter"){
      submitInput()
    }
  }

  return (
    <>
      <p className="text-gray-300 pl-2">
      {input.length} / {maxlength}
      </p>
      <div className="flex">
        <input
        className="w-full"
        value={input}
        maxLength={maxlength}
        onChange={
          e => { 
            setInput(e.target.value)
          }
        }
        type="text" onKeyDown={keyPressed}/>
        <button className="m-2 bg-dark border-light" onClick={submitInput}>Send</button>
      </div>
    </>
  )
}
