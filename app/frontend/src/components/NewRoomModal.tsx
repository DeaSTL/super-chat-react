import { useState } from 'react'
import Modal from './Modal'
import { $new_room_modal, closeNewRoomModal, newRoom} from '../store/Server'
import { useStore } from '@nanostores/react'

type Props = {
}

export default function NewRoomModal({}: Props) {
  const show = useStore($new_room_modal)
  const [input, setInput] = useState<string>("")
  const max_len = 24
  const min_len = 1

  const submit = ()=>{
    if(input.length < max_len + 1 && input.length > min_len){
      newRoom({name:input??""});
      closeNewRoomModal()
      setInput("")
    }
  }

  const onChange = (e:any) => {
    setInput(e.target.value)
  }

  const onKeydown = (e:any) => {
    if(e.key == "Enter"){
      submit()
    }
  }

  return (
    <Modal show={show}>
      <input maxLength={max_len} minLength={min_len} placeholder="Room name" onKeyDown={onKeydown} onChange={onChange} value={input} id="room-name" type="text"/>
      <button onClick={submit}>Submit</button>
      <div className="label">
        {input.length} / {max_len}
      </div>
    </Modal>
  )
}
