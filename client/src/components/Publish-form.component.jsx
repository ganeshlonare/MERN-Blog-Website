import { useContext } from 'react';
import AnimationWrapper from '../common/Page-animation';
import {Toaster ,toast} from 'react-hot-toast'
import { AiOutlineClose } from "react-icons/ai";
import { EditorContext } from '../pages/Editor.pages';
import Tags from './Tags.component';


export default function PublishForm() {

  let characterLimit=200;

  let {blog ,blog:{banner , title ,tags , des} ,setEditorState , setBlog} = useContext(EditorContext);

  const handleCloseEvent=()=>{
    setEditorState('editor');
  }

  const handleBlogTitleChange=(e)=>{
    let input = e.target;
    setBlog({...blog,title:input.value});
  }

  const handleBlogDesChange=(e)=>{
    let input=e.target;
    setBlog({...blog , des:input.value});
  }

  return (
    <AnimationWrapper>
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
        <Toaster/>

        <button 
        className='w-14 h-14 absolute right-[5vh] z-0 top-[7%] lg:top-[10%]'
        onClick={handleCloseEvent}
        >
          <AiOutlineClose/>
        
        </button>

        <div className="max-w-[550px] center ">
          <p className='text-dark-grey mb-1'>Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} alt="banner" />
          </div>

          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2 '>{title}</h1>

          <p className='font-gelasio line-clamp-2 text-xl leading-7 mt-4'>
            {des}
          </p>
        </div>

        <div className="border-grey lg:border-1 lg:pl-8">
          <p  className='text-dark-grey mb-2 mt-9'
          >Blog Title</p>
          <input 
          type="text" 
          placeholder='Blog Title' 
          defaultValue={title}
          className='input-box pl-4'
          onChange={handleBlogTitleChange}
          />

          <p  className='text-dark-grey mb-2 mt-9'
          >Short description about the blog post.</p>

          <textarea 
          name="" 
          maxLength={characterLimit}
          defaultValue={des}
          className='h-40 resize-none leading-7 input-box'
          onChange={handleBlogDesChange}
          ></textarea>

          <p className='mt-1 text-dark-grey text-sm text-right'>
            {characterLimit-des.length} characters left 
          </p>

          <p className='text-dark-grey mb-2 mt-9'>
            Topics-(Help in searching and ranking your blog post)
          </p>
          
          <div className="relative input-box pl-2 py-2 pb-4 ">
            <input
            className='sticky input-box bg-white left-0 top-0 pl-4 mb-3 focus:bg-white' 
            type="text" 
            placeholder='Topics'/>
            <Tags tag='' />
          </div>
          
        </div>

      </section>
    </AnimationWrapper>
  )
}
