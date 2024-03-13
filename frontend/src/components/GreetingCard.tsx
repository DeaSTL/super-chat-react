import { useState } from 'react'

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
    <div className={show ? 'modal' : 'modal invisible'}>
      <div className="modal-body">
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
      </div>
    </div>
  )
}
