import React, { useState } from 'react'
import { FaUser , FaAt , FaKey , FaEye ,FaEyeSlash } from 'react-icons/fa'

export default function InputBox({name , type , placeholder , id , value }) {

  const [passwordVisibility , setPasswordVisibility] =useState(false)
  

  return (
    <div className='relative w-full mb-4'>
      <input 
      type={type=="password" ? passwordVisibility ? "text" : "password" : type}
      placeholder={placeholder}
      name={name}
      defaultValue={value}
      id={id}
      className='input-box'
      />
      {
      type=='text'
       ? <FaUser className='input-icon'/> 
       :""
       }

      {
      type=='mail'
       ?<FaAt className='input-icon'/>
       :""
       }
      {
      type=='password'
       ?<FaKey className='input-icon'/>
       :""
       }
      {
      type=='password'
       ?passwordVisibility?<FaEye
       onClick={()=>setPasswordVisibility((currentValue)=>!currentValue)}
        className='input-icon left-auto right-4 cursor-pointer'/>
       :<FaEyeSlash
       onClick={()=>setPasswordVisibility((currentValue)=>!currentValue)}
        className='input-icon left-auto right-4 cursor-pointer'
        />: ""
       }
    </div>
  )
}
