
import './App.css'
import './index.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
//import './styles/custom.scss'
import ChatWindow from './components/ChatWindow'
import MessagePrompt from './components/MessagePrompt'
import GreetingCard from './components/GreetingCard'
import UsersDropdown from './components/UsersDropdown'
import RoomsList from './components/RoomsList'
import { useStore } from '@nanostores/react'
import { $ws } from './store/Server'





function App() {
  useStore($ws)
  return (
    <div className="flex flex-wrap">
      <GreetingCard/>
        <div className="w-2/12 p-2">
          <RoomsList/>
        </div>
        <div className="w-10/12 p-2">
          <div className="card-dark">
            <UsersDropdown/>
            <ChatWindow/>
            <MessagePrompt/>
          </div>
        </div>
      </div>
  )
}

export default App

