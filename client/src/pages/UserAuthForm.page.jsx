import React from 'react'
import InputBox from '../components/Input.component'
import { FaGoogle } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function UserAuthForm({type}) {
  return (
    <section className='h-cover flex items-center justify-center'>
        <form className='w-[80%] max-w-[400px]'>

            <h1 className='text-4xl capitalize font-gelasio text-center mb-24'>
                {type=="sign-in" ? "welcome Back" : "Join us Today"}
            </h1>

            {
                type!== 'sign-in' ?
                <InputBox
                type="text" 
                placeholder="Enter your name" 
                name='fullname' 
                />
                : ""
            }
              <InputBox
                type="mail" 
                placeholder="Enter your mail" 
                name='mail' 
              />
              <InputBox
                type="password" 
                placeholder="Enter password" 
                name='password' 
              />

              <button className='center btn-dark mt-14'>
                {type.replace("-" , " ")}
              </button>

              <div className="flex items-center my-10 relative w-full gap-2 uppercase text-black font-bold opacity-60">
                <hr className='w-1/2' />
                or
                <hr className='w-1/2' />
              </div>
              
              <button className='center btn-dark bg-google flex items-center gap-2'>
                <FaGoogle />
                continue with google
              </button>

              {
                type=='sign-in' 
                ? <p className='text-xl text-center mt-3 text-dark-grey'>
                  Don't have an account ?
                  <Link to='/sign-up' className='underline mx-1 text-xl text-black'>
                    Sign Up
                  </Link>
                  
                  </p> 
                :<p className='text-xl text-center mt-3 text-dark-grey' >
                  Already have an account ?
                  <Link to='/sign-in' className='underline mx-1 text-xl text-black'>
                    Sign In
                  </Link>
                  </p>
              }

        </form>
    </section>
  )
}
