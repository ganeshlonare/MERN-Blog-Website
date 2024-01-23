import { useContext } from "react"
import {UserContext} from "../App"
import { Navigate } from "react-router-dom"


export default function Editor() {

    let {userAuth: {access_token}}=useContext(UserContext)

  return (
    access_token===null 
    ?<Navigate to='/sign-in'/>
    :
    <div>
      hi
    </div>
  )
}
