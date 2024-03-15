import { useState } from 'react'
import Modal from './Modal'
import { $set_username_modal,closeNewUserModal, setUsername} from '../store/Server'
import { useStore } from '@nanostores/react'


export default function GreetingCard() {

  const show = useStore($set_username_modal)
  
  const [input, setInput] = useState("")

  const max_len = 24
  const min_len = 1

  const submit = () => {
    if(input.length < max_len + 1 && input.length > min_len){
      setUsername(input)
      closeNewUserModal()
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
      <p className="pl-2">
        Choose your username!
      </p>
      <input minLength={min_len} maxLength={max_len} placeholder="Username" type="text" onKeyDown={onKeydown} onChange={onChange}/>
      <button onClick={submit}>Save</button>
      <div className="label">
        {input.length} / {max_len}
      </div>
    </Modal>
  )
}
