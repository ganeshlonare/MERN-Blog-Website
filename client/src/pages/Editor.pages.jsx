import { createContext, useContext, useState } from "react"
import {UserContext} from "../App"
import { Navigate } from "react-router-dom"
import BlogEditor from "../components/Blog-editor.component";
import PublishForm from "../components/Publish-form.component";

const blogStructure = {
  title : '',
  banner : '',
  content : [],
  tags : [],
  des : '',
  author : {personal_info : {}}
}

export const EditorContext=createContext({})

export default function Editor() {

    const [blog , setBlog]=useState(blogStructure)
    let {userAuth: {access_token}}=useContext(UserContext)
    const [editorState , setEditorState]=useState("editor");

  return (
    <EditorContext.Provider value={{blog , setBlog , editorState ,setEditorState}}>
     {
      access_token===null 
      ?<Navigate to='/sign-in'/>
      : editorState=="editor" ? <BlogEditor /> : <PublishForm />
      }
    </EditorContext.Provider>
  )
}
