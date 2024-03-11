import { useEffect, useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'


interface IMessagePrompt {
  sendUserMessage: (text:string) => void
}

export default function MessagePrompt(props:IMessagePrompt) {

  const [input, setInput] = useState("")
  

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
      <InputGroup className="mt-4">
        <FormControl
        value={input}
        onChange={e => {setInput(e.target.value)}}
        type="text" onKeyDown={keyPressed}/>
        <Button onClick={submitInput}>Send</Button>
      </InputGroup>
    </>
  )
}
