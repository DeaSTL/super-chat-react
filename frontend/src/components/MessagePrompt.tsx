import { useEffect, useState } from 'react'
import { Button, FormControl, FormText, InputGroup } from 'react-bootstrap'


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
      <FormText>
      {input.length} / {maxlength}
      </FormText>
      <InputGroup>
        <FormControl
        value={input}
        onChange={
          e => { 
            if(e.target.value.length - 1 < maxlength){
              setInput(e.target.value)
            }
          }
        }
        type="text" onKeyDown={keyPressed}/>
        <Button onClick={submitInput}>Send</Button>
      </InputGroup>
    </>
  )
}
