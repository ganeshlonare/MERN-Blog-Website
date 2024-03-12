import { Link, useNavigate } from 'react-router-dom'
import logo from '../imgs/logo.png'
import AnimationWrapper from '../common/Page-animation'
import defaultBanner from '../imgs/blog banner.png'
import { useContext, useEffect, useState } from 'react'
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from '../common/Firebase'
import {Toaster , toast } from 'react-hot-toast'
import { EditorContext } from '../pages/Editor.pages'
import Editorjs from '@editorjs/editorjs'
import { tools } from './Tools.component'
import axios from 'axios'
import { UserContext } from '../App'


export default function BlogEditor() {

    let { blog ,blog : {title , banner , content , tags , des } , setBlog , textEditor ,setTextEditor , setEditorState} =useContext(EditorContext);

    let { userAuth : {access_token} } = useContext(UserContext);

    const navigate=useNavigate();

    const [file , setfile]=useState(undefined);
    const [fileper,setFilePerc]=useState(0);
    const [fileUploadError , setFileUploadError]=useState(false);
    const [formData , setFormData]=useState({});

    let loadingToast=0;

    useEffect(()=>{
        if(file){
            handleBannerUpload(file);
            loadingToast=toast.loading("Uploading...");
        }
    },[file]);

    const handleBannerUpload=(file)=>{
        const storage=getStorage(app);
        const filename=new Date().getTime()+file.name;
        const storageRef=ref(storage,filename);
        const uploadTask=uploadBytesResumable(storageRef,file);

        uploadTask.on('state_changed',
    (snapshot)=>{
      const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
      setFilePerc(Math.round(progress));
    },
    (error)=>{
      setFileUploadError(true);
    },
    ()=>{
      getDownloadURL(uploadTask.snapshot.ref)
      .then((downloadURL)=>{
        setFormData({...formData,profile_img:downloadURL});
            toast.success("Image uploaded successfully 👍");
            toast.dismiss(loadingToast);
            setBlog({...blog , banner : downloadURL})
      })  
    })
    }


    const handleTittleKeyDown=(e)=>{
        if(e.keyCode==13) {
            e.preventDefault();
        }
    }

    const handleTittleChange=(e)=>{
        let input=e.target;
        input.style.height="auto";
        input.style.height=input.scrollHeight + "px";

        setBlog({...blog , title : input.value})
    }

    useEffect(()=>{
        if(!textEditor.isReady){
            setTextEditor(new Editorjs({
                holder : "textEditor",
                data : content,
                tools : tools,
                placeholder: "lets write an awesome story"
            }))
        }
    },[])

    const handlePublishEvent=()=>{
        if(!banner.length){
            return toast.error("Upload a Banner image to publish it");
        }
        if(!title.length){
            return toast.error("Write Blog title to publish it");
        }

        if(textEditor.isReady){
            textEditor.save().then(data=>{
                if(data.blocks.length){
                    setBlog({...blog , content:data});
                    setEditorState("publish");
                }else{
                    return toast.error("Write something in your blog to publish it");
                }
            })
            .catch((err)=>{
                console.log(err);
            })
        }
    }


    const handleSaveDraft = (e)=>{
        if(e.target.className.includes('disable')){
            return;
          }

          if(!banner.length){
            return toast.error("Upload a Banner image to save it");
        }
      
          if(!title.length){
            return toast.error("Title taak re ");
          }
      
          let loadingToast=toast.loading("Saving Draft...");
      
          e.target.classList.add('disable');

          if(textEditor.isReady){
            textEditor.save().then(content =>{

                let blogObj={
                    title,des,tags,content,banner , draft : true
                }

                axios.post("/api/user/create-blog" , blogObj , 
          {
            headers :{
              'Authorization':`Bearer ${access_token}`
            }
          })
          .then(()=>{
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.success("Saved");
      
            setTimeout(() => {
              navigate("/");
            }, 500);
          })
          .catch(({response})=>{
            e.target.classList.add('disable');
            toast.dismiss(loadingToast);
      
            return toast.error(response.data.error)
          })
            })
        }
    }
    
  return (
    <>
    <nav className='navbar'>
        <Link to='/' className='flex-none w-10'>
            <img src={logo} alt="Logo" />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full '>
            {title.length ? title : "New blog"}
        </p>
        <div className="flex gap-4 ml-auto">
            <button
            onClick={handlePublishEvent}
            className='btn-dark py-2'>
                Publish
            </button>

            <button 
            onClick={handleSaveDraft}
            className='btn-light py-2'>
                Save draft
            </button>
        </div>
    </nav>
    <Toaster />
    <AnimationWrapper>
        <section>
            <div className="mx-auto max-w-[900px] w-full">

                <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
                    <label htmlFor='uploadBanner'>
                        <img src={banner || defaultBanner} 
                        className='z-20'
                        alt="defaultBanner" />
                        <input
                         type="file" id="uploadBanner" 
                         accept='.pnj , .jpg , .jpeg'
                         hidden 
                         onChange={(e)=>setfile(e.target.files[0])}
                         />
                    </label>
                </div>

                <textarea 
                defaultValue={title}
                placeholder='Blog Title'
                className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40'
                onKeyDown={handleTittleKeyDown}
                onChange={handleTittleChange}
                 >
                 </textarea>

                 <hr className='w-full opacity-20 my-5' />

                 <div id='textEditor' className="font-gelasio">

                 </div>
            </div>
        </section>
    </AnimationWrapper>
    </>
  )
}
