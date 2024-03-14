import { useState } from "react"
import NewRoomModal from "./NewRoomModal"

type Props = {
  rooms:Room[]
  current_user:UserData
  setRoom:(room_id:string)=>void
  newRoom:(name:string)=>void
}

export default function RoomsList({rooms,current_user,setRoom,newRoom}: Props) {

  const [showNewRoom, setShowNewRoom] = useState(false)

  const submit = (name:String)=>{
    setShowNewRoom(false)
    newRoom(name)
  }
  

  return (
    <div className="card-dark flex flex-col">
      <ul>
        {
          rooms.map((room:Room)=>{
            return (
              <li 
              onClick={()=>{setRoom(room.id)}}
              className={`
              text-white
              cursor-pointer 
              hover:bg-gray-500 
              rounded 
              duration-75 
              font-bold p-2 mb-1 ${current_user.room_id == room.id ? 'bg-gray-500' : ''}`}>
                {room.name}
              </li>
            )
          })
        }
      </ul>
      <button className="m-0" onClick={()=>{setShowNewRoom(true)}}>New</button>
      <NewRoomModal show={showNewRoom} newRoom={submit}/>
    </div>
  )
}
