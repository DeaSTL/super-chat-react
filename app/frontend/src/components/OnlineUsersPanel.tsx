import { ListGroup, ListGroupItem } from 'react-bootstrap'

type Props = {
  users:UserData[]  
}

export default function OnlineUsersPanel({users}: Props) {
  return (
    <div className="card-dark">
      <ListGroup>
        {
          users.map((user)=>{
            if(user.username != ""){
              return (
                <ListGroupItem className="border-light" style={{color:user.color}}>{user.username}</ListGroupItem>
              )
            }
          })
        }
      </ListGroup>
    </div>
  )
}
