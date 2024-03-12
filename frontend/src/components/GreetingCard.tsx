import { useState } from 'react'
import { Button, FormControl, FormText, InputGroup, Modal, ModalBody, ModalTitle } from 'react-bootstrap'

interface IGreetingCard {
  show:boolean,
  setUsername:(username:string) => void
}

export default function GreetingCard({setUsername,show}:IGreetingCard) {
  
  const [input, setInput] = useState("")
  const save = () => {
    setUsername(input) 
  }

  const onKey = (e:any) => {
    if(e.key == "Enter"){
      save()
    }
  }

  return (
    <Modal show={show}>
      <ModalTitle  className="px-4">
        Choose your username!
      </ModalTitle>
      <ModalBody className="px-4">
      <FormText>Username</FormText>
      <InputGroup>
        <FormControl type="text" onKeyDown={onKey} onChange={(e)=>{setInput(e.target.value)}}/>
        <Button onClick={save}>Save</Button>
      </InputGroup>
      </ModalBody>
    </Modal>
  )
}
