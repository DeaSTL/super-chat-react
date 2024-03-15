import { faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { useMemo, useState } from "react"
import { $user, $user_list } from "../store/Server"
import { useStore } from "@nanostores/react"

// type Props = {
//   users?:UserData[],
//   current_user?:UserData,
// }

export default function UsersDropdown() {

  const current_user = useStore($user)
  const users = useStore($user_list)

  const [show, setShow] = useState(false)




  function filterUser(user:UserData){
    return user.username != undefined && user.room_id == current_user?.room_id
  }

  const filtered_users = useMemo(
    ()=>{
      return users?.filter(filterUser)
    },[users])

  return (
    <div className="flex flex-col">
      <button
        onClick={()=>{setShow(!show)}}
        className="font-bold text-gray-300 mr-auto duration-75 hover:bg-gray-500">
        <FontAwesomeIcon icon={faCaretDown} className={show ? '-rotate-90' : ''}/>
        <span className="ml-2">
          Username: 
        </span>
        <strong>{current_user?.username}</strong>
        <span className="rounded-full bg-blue-500 ml-4 px-2">
          {filtered_users?.length}
        </span>
      </button>
      <div className=''>
        <div className={show ? 'w-1/2 visible absolute bg-gray-700 p-4 rounded-b text-gray-200' : 'hidden'}>
          <ul className="grid grid-cols-2">
            {
            filtered_users?.map((user,key)=>{
              return (<li key={key} style={{color:user.color}}>{user.username}</li>)
            })
            }
          </ul>
        </div>
      </div>
    </div>
  )
}
