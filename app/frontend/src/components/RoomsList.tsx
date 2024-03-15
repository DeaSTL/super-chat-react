import NewRoomModal from "./NewRoomModal"
import {$rooms, $user,  setRoom, showNewRoomModal } from "../store/Server"
import { useStore } from "@nanostores/react"

type Props = {
}

export default function RoomsList({}: Props) {

  const rooms = useStore($rooms)
  const user = useStore($user)


  const submit = (room_id:string)=>{
    setRoom(room_id)
  }
  

  return (
    <div className="card-dark flex flex-col">
      <ul>
        {
          rooms.map((room:Room)=>{
            return (
              <li 
              onClick={()=>{submit(room.id??"")}}
              className={`
              text-white
              cursor-pointer 
              hover:bg-gray-500 
              rounded 
              duration-75 
              font-bold p-2 mb-1 ${user.room_id == room.id ? 'bg-gray-500' : ''}`}>
                {room.name}
              </li>
            )
          })
        }
      </ul>
      <button className="m-0" onClick={()=>{showNewRoomModal()}}>New</button>
      <NewRoomModal/>
    </div>
  )
}
