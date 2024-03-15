import {atom, onMount} from 'nanostores'


const hostname:string = document.location.hostname
const connection_string:string = `ws://${hostname}:8080/ws`

export const $messages = atom<UserMessage[]>([])
export const $user_list = atom<UserData[]>([])
export const $rooms = atom<Room[]>([])
export const $user = atom<UserData>({user_id:""})
export const $new_room_modal = atom<boolean>(false)
export const $set_username_modal = atom<boolean>(true)
export const $ws = atom<WebSocket>(new WebSocket(connection_string))

onMount($new_room_modal,()=>{
  $new_room_modal.set(false)
})

onMount($ws,()=>{
  console.log("web socket mounted")
  $ws.get().onopen = () => {
    console.log("Connected to websocket!")
    sendSocketMessage("init",{})
  }

  $ws.get().onmessage = (event) => {
    const socket_message: SocketMessage = JSON.parse(event.data)
    console.log("New socket message: ",socket_message)
    switch(socket_message.type){
      case "user_message":
        let user_message: UserMessage = socket_message.data
        console.log("New message: ",user_message)
        addMessage(user_message)
        return
      case "user_data":
        let user_data: UserData = socket_message.data
        $user.set(user_data)
        return
      case "update_user_list": 
        let users: UserData[] = socket_message.data
        $user_list.set(users)
        return
      case "room_list":
        let rooms_list: Room[] = socket_message.data
        console.log("room list",rooms_list,socket_message.data)
        $rooms.set(rooms_list)
        return
      case "messages":
        let messages: UserMessage[] = socket_message.data
        $messages.set(messages)
        return
      default:
        return
    }
  };
  
  $ws.get().onerror = (error) => {
    console.log(`websocket error: `, error)
  };

  $ws.get().onclose = () => { 
    console.log('web socket closed')
  }
})


export const closeNewUserModal = ()=>{
  $set_username_modal.set(false)
}

export const closeNewRoomModal = ()=>{
  $new_room_modal.set(false)
}

export const showNewRoomModal = () => {
  $new_room_modal.set(true)
}

export const sendSocketMessage = (event:string,data:any) => {
    let new_message:SocketMessage = {
      type: event,
      data: data
    }
    console.log("Sending new socket message: ",new_message)
    if(!$ws.get()) {
      console.log("Web socket null")
      return
    } 
    $ws.get().send(JSON.stringify(new_message))
}


export const addMessage = (new_message:UserMessage) => {
  $messages.set([...$messages.get(),new_message])
}

export const newRoom = (new_room:Room) => {
  sendSocketMessage("new_room",new_room)
}

export const setRoom = (room_id:string) => {
  sendSocketMessage("set_room",room_id)
  $messages.set([])
}

export const setUsername = (username:string) => {
  sendSocketMessage("set_username",username)
}
