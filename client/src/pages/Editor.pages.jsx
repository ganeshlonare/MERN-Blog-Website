import { useContext, useState } from "react"
import {UserContext} from "../App"
import { Navigate } from "react-router-dom"
import BlogEditor from "../components/Blog-editor.component";
import PublishForm from "../components/Publish-form.component";


export default function Editor() {

    let {userAuth: {access_token}}=useContext(UserContext)
    const [editorState , setEditorState]=useState("editor");

  return (
    access_token===null 
    ?<Navigate to='/sign-in'/>
    : editorState=="editor" ? <BlogEditor /> : <PublishForm />
  )
}
