

type UserMessage = { 
  content: string,
  name: string,
  user_id?: string,
  color?: string
}

type UserData = {
  user_id: string,
  username?: string,
  color?: string
  room_id?: string,
}

type Room = {
  id?: string,
  name: string,
}



type SocketMessage = {
  type: string;
  data: any;
}
