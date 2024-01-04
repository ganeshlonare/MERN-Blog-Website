import {Link, Outlet} from 'react-router-dom';
import logo from '../imgs/logo.png';
import { FaSearch , FaFile , FaEbay } from "react-icons/fa";
import { useState } from 'react';

export default function Navbar() {
  const [searchBoxVisibility , setSearchBoxVisibility] =useState(false);
  
  return (
   <>
    <nav className='navbar'>

<Link to='/' className='flex-none w-10'>
  <img src={logo} alt="logo" className='w-full'/>
</Link>

<div className={"absolute bg-white w-full top-full left-0 mt-0.5 border-b border-grey py-4 px-[5vh] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}>
  <input
  type="text" 
  placeholder='search...'
  className='w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12'
  />

  <FaSearch className='text-dark-grey text-xl absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2' />
</div>

<div className="flex items-center gap-3 md:gap-6 ml-auto">
  <button
   onClick={()=>setSearchBoxVisibility(currentValue=>
    !currentValue)}
    className='md:hidden w-12 h-12 bg-grey flex items-center justify-center rounded-full'>
    <FaSearch className='text-xl' />
  </button>

  <Link 
  className='md:flex gap-2 link hidden'
  to='/editor'>
  <FaFile />
  <p>Write</p>
  </Link>

  <Link to='/sign-in' className='btn-dark py-2'>
   Sign In
  </Link>

  <Link to='/sign-up' className='btn-light py-2 hidden md:inline'>
   Sign Up
  </Link>
  
</div>
</nav>
<Outlet />
   </>
  )
}
