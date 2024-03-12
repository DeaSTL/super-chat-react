import React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap'

type Props = {
  users:UserData[]  
}

export default function OnlineUsersPanel({users}: Props) {
  return (
    <div className="mt-4">
      <ListGroup>
        {
          users.map((user)=>{
            if(user.username != ""){
              return (
                <ListGroupItem>{user.username}</ListGroupItem>
              )
            }
          })
        }
      </ListGroup>
    </div>
  )
}
