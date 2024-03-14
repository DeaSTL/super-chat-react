import { useEffect, useState } from 'react'


interface IMessagePrompt {
  sendUserMessage: (text:string) => void
}

export default function MessagePrompt(props:IMessagePrompt) {

  const [input, setInput] = useState("")

  const maxlength = 500
  

  const submitInput = () => {
    props.sendUserMessage(input.valueOf())
    setInput("")
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
        onChange={
          e => { 
            if(e.target.value.length - 1 < maxlength){
              setInput(e.target.value)
            }
          }
        }
        type="text" onKeyDown={keyPressed}/>
        <button className="m-2 bg-dark border-light" onClick={submitInput}>Send</button>
      </div>
    </>
  )
}
