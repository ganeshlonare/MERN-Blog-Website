import React, { useContext } from 'react'
import AnimationWrapper from '../common/Page-animation'
import { Link, useNavigate } from 'react-router-dom'
import { FaFile } from 'react-icons/fa'
import { UserContext } from '../App'
import { removeFromSession } from '../common/Session'

export default function UserNavigationPanel() {

    const navigate=useNavigate();

    const {userAuth : {username} , setUserAuth} =useContext(UserContext);

    const signOutUser=()=>{
        removeFromSession("user");
        setUserAuth({access_token : null});
        navigate("/sign-in")
    }

  return (
   <AnimationWrapper
   transition={{duration:0.2}}
   className='absolute right-0 z-50'
   >

    <div className="bg-white absolute w-60 right-0 border border-grey duration-200">
        <Link to='/editor' className='flex gap-2 link pl-8 py-4 md:hidden'>
        <FaFile />
        <p>Write</p>
        </Link>

        <Link to={`/user/${username}`} className='link pl-8 py-4'>
            Profile
        </Link>
        
        <Link to='/dashboard/blogs' className='link pl-8 py-4'>
            Dashboard
        </Link>

        <Link to='/settings/edit-profile' className='link pl-8 py-4'>
            Settings
        </Link>

        <span className='absolute w-[100%] border-t border-grey'>
        </span>

        <button 
        onClick={signOutUser}
        className='text-left p-4 hover:bg-grey w-full pl-8 py-4'>
            <h1 className='font-bold text-xl mb-1'>Sign Out</h1>
            <p className='text-dark-grey'>@{username}</p>
        </button>
    </div>

   </AnimationWrapper>
  )
}