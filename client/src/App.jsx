import { Routes , Route } from "react-router-dom";
import Navbar from "./components/Navbar.component";
import UserAuthForm from "./pages/UserAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/Session";

export const UserContext=createContext({})

export default function App() {

  const [userAuth,setUserAuth]=useState({})

  useEffect(()=>{
    let userInSession=lookInSession("user");

    {
      userInSession 
      ? setUserAuth(JSON.parse(userInSession)) 
      : setUserAuth({access_token : null})
    }

  },[])

  return (
    <UserContext.Provider value={{userAuth , setUserAuth }}>
    <Routes>
      <Route path="/" element={<Navbar />} >
      <Route path="sign-in" element={<UserAuthForm type={"sign-in"}/>} />
      <Route path="sign-up" element={<UserAuthForm type={"sign-up"}/>} />
      </Route>
    </Routes>
    </UserContext.Provider>
  )
}
