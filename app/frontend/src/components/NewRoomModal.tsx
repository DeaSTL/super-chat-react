import { useState } from 'react'
import Modal from './Modal'
import { $new_room_modal, closeNewRoomModal, newRoom} from '../store/Server'
import { useStore } from '@nanostores/react'

type Props = {
}

export default function NewRoomModal({}: Props) {
  const show = useStore($new_room_modal)
  const [input, setInput] = useState<string>()

  const submit = ()=>{
    newRoom({name:input??""});
    closeNewRoomModal()
  }

  return (
    <Modal show={show}>
      <div className="label">
        <label htmlFor="room-name">Room Name:</label>
      </div>
      <input onChange={(e)=>{setInput(e.target.value)}} id="room-name" type="text"/>
      <button onClick={submit}>Submit</button>
    </Modal>
  )
}
