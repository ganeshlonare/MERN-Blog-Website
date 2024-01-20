import InputBox from '../components/Input.component'
import { FaGoogle } from 'react-icons/fa'
import { Link, Navigate } from 'react-router-dom'
import AnimationWrapper from '../common/Page-animation'
import { Toaster ,toast } from 'react-hot-toast'
import axios from 'axios'
import {storeInSession} from '../common/Session'
import { useContext } from 'react'
import { UserContext } from '../App'

export default function UserAuthForm({type}) {

  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

  let {userAuth:{access_token} , setUserAuth} =useContext(UserContext)

  const userAuthThroughServer=async (serverRoute,formData)=>{
    axios.post(`/api/auth/${serverRoute}`,formData)
    .then(({data})=>{
      storeInSession("user",JSON.stringify(data))
      setUserAuth(data)
      {
        serverRoute=='signin' 
        ? toast.success("logged in successfully") 
        : toast.success("user created successfully")
      }
    })
    .catch(({response})=>{
      toast.error(response.data.error)
    })
    
  }

   const handleSubmit=async (e)=>{
    e.preventDefault();
    let serverRoute=type== "sign-in" ?"signin":"signup";
    let form=new FormData(formElement);
    let formData={};

    for(let [key , value] of form.entries()){
      formData[key]=value;
    }

    let {fullname , email , password}=formData;

  if(fullname){

    if(fullname.length<3) {
      return toast.error('fullname must be more than 3 characters')
    }

  }

  if(!email.length) {
      return toast.error('Enter your email')
  }

  if(!emailRegex.test(email)) {
      return toast.error('Email is invalid')
  }

  if(!passwordRegex.test(password)){
      return toast.error('Password should be 6 to 20 characters long with a Numeric , 1 lowercase and 1 uppercase letter')
  }

  userAuthThroughServer(serverRoute , formData);

  }

  return (
    access_token ?
    <Navigate to='/'/>
    :
    <AnimationWrapper keyValue={type}>
    <section className='h-cover flex items-center justify-center'>
      <Toaster />
        <form id='formElement' className='w-[80%] max-w-[400px]'>

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
                name='email' 
              />
              <InputBox
                type="password" 
                placeholder="Enter password" 
                name='password' 
              />

              <button onClick={handleSubmit} className='center btn-dark mt-14'>
                {type.replace("-" , " ")}
              </button>

              <div className="flex items-center my-10 relative w-full gap-2 uppercase text-black font-bold opacity-60">
                <hr className='w-1/2' />
                or
                <hr className='w-1/2' />
              </div>
              
              <button type='button' className='center btn-dark bg-google flex items-center gap-2'>
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
    </AnimationWrapper>
  )
}
