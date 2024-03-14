import { useState } from 'react'
import Modal from './Modal'

type Props = {
  show:boolean
  newRoom:(name:string)=>void
}

export default function NewRoomModal({show,newRoom}: Props) {
  const [input, setInput] = useState<string>()

  return (
    <Modal show={show}>
      <div className="label">
        <label htmlFor="room-name">Room Name:</label>
      </div>
      <input onChange={(e)=>{setInput(e.target.value)}} id="room-name" type="text"/>
      <button onClick={()=>{newRoom(input??"");}}>Submit</button>
    </Modal>
  )
}
