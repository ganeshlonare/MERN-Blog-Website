import { Link } from 'react-router-dom'
import logo from '../imgs/logo.png'
import AnimationWrapper from '../common/Page-animation'
import defaultBanner from '../imgs/blog banner.png'
import { useEffect, useState } from 'react'
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from '../common/Firebase'
import {Toaster , toast } from 'react-hot-toast'

export default function BlogEditor() {

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
      })  
    })

    }
    
  return (
    <>
    <nav className='navbar'>
        <Link to='/' className='flex-none w-10'>
            <img src={logo} alt="Logo" />
        </Link>
        <p className='max-md:hidden text-black line-clamp-1 w-full '>
            New Blog
        </p>
        <div className="flex gap-4 ml-auto">
            <button className='btn-dark py-2'>
                Publish
            </button>

            <button className='btn-light py-2'>
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
                        <img src={formData.profile_img || defaultBanner} 
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

            </div>
        </section>
    </AnimationWrapper>
    </>
  )
}
