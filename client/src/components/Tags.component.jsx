import { useContext } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { EditorContext } from "../pages/Editor.pages";

export default function Tags({tag}) {

  let {blog , blog:{tags} , setBlog ,tagIndex}=useContext(EditorContext);

  const handleTagDelete=()=>{
    tags=tags.filter(t=>t!=tag);
    setBlog({...blog , tags})
  };

  const handleTagEdit=(e)=>{
    if(e.keyCode ==13 || e.keyCode==188){
      e.preventDefault();
      let currentTag = e.target.innerText;

      tags.push(currentTag);

      tags.splice(tagIndex,1);
      
      setBlog({...blog , tags});
      e.target.setAttribute('contentEditable' , false);
    }
  }

  const addEditable=(e)=>{
    e.target.setAttribute('contentEditable' , true);
  }

  return (
     <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-8 ">
      <p 
      onKeyDown={handleTagEdit}
      className='outline-none' 
      onClick={addEditable}>
        {tag}
      </p>
      <button 
      onClick={handleTagDelete}
      className=" rounded-full absolute right-3 top-1/2 -translate-y-1/2">
        <AiOutlineClose className="text-sm pointer-events-none" />
      </button>
     </div>
  )
}

