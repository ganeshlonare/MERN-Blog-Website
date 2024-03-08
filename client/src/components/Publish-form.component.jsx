import { useContext } from 'react';
import AnimationWrapper from '../common/Page-animation';
import {Toaster ,toast} from 'react-hot-toast'
import { AiOutlineClose } from "react-icons/ai";
import { EditorContext } from '../pages/Editor.pages';
import Tags from './Tags.component';
import logo from '../imgs/logo.png'
import { Link } from 'react-router-dom';


export default function PublishForm() {

  let characterLimit=200;
  let tagLimit=10;

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
  
  const handleKeyDown=(e)=>{
    if(e.keyCode==188 || e.keyCode==13){
      e.preventDefault();

      let tag=e.target.value;

      if(tags.length < tagLimit){
        if(!tags.includes(tag) && tag.length){
          setBlog({...blog , tags:[...tags , tag]})
        }
      }else{
        toast.error("You can only add up to "+tagLimit+" tags");
      }
      e.target.value="";
    }
  }

  return (
    <AnimationWrapper>

     <Link to='/'>
        <img src={logo} alt="logo" className='absolute w-10 h-10 ml-24 mt-6' />
     </Link>
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
        
        <Toaster/>

        <button 
        className='w-14 h-14 lg:w-16 lg:h-[20px] absolute right-[5vh] z-0 top-[7%] lg:top-[10%]'
        onClick={handleCloseEvent}
        >
          <AiOutlineClose className='lg:w-full lg:h-full'/>
        
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
            placeholder='Topics'
            onKeyDown={handleKeyDown}
            />

            {
              tags.map((tag , i)=>{
                return <Tags tag={tag} tagIndex={i} key={i} />
              })
            }

          </div>

          <p className='mt-1 text-dark-grey text-sm text-right'>
            {tagLimit-tags.length} tags left 
          </p>
        
        <button className='btn-dark px-8'>
          Publish
        </button>
        </div>

      </section>
    </AnimationWrapper>
  )
}
