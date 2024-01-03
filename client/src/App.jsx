import { Routes , Route } from "react-router-dom";
import Navbar from "./components/Navbar.component";
import UserAuthForm from "./pages/UserAuthForm.page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />} >
      <Route path="sign-in" element={<UserAuthForm type={"sign-in"}/>} />
      <Route path="sign-up" element={<UserAuthForm type={"sign-up"}/>} />
      </Route>
    </Routes>
  )
}
