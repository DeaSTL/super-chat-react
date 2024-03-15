import { useState } from 'react'
import Modal from './Modal'
import { $set_username_modal,closeNewUserModal, setUsername} from '../store/Server'
import { useStore } from '@nanostores/react'


export default function GreetingCard() {

  const show = useStore($set_username_modal)
  
  const [input, setInput] = useState("")
  const save = () => {
    setUsername(input)
    closeNewUserModal()
  }

  const onKey = (e:any) => {
    if(e.key == "Enter"){
      save()
    }
  }
  
  
  return (
    <Modal show={show}>
      <p className="pl-2">
        Choose your username!
      </p>
      <div>
        <div className="pl-2">Username</div>
        <div className="flex">
          <input type="text" onKeyDown={onKey} onChange={(e)=>{setInput(e.target.value)}}/>
          <button onClick={save}>Save</button>
        </div>
      </div>
    </Modal>
  )
}
