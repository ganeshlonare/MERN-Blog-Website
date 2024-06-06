import React, { useEffect, useState } from 'react'
import AnimationWrapper from '../common/Page-animation'
import InPageNavigation from '../components/Inpage-navigation.component'
import axios from 'axios'
import Loader from '../components/Loader.component'
import BlogPostCard from '../components/Blog-post.component'

export default function HomePage() {

  const [blogs , setBlogs]=useState(null)

  const fetchLatestBlog=()=>{
    axios.get(`/api/blog/latest-blogs`)
    .then(({data})=>{
      setBlogs(data.blogs)
      console.log(data.blogs)
    })
  }

  useEffect(()=>{
    fetchLatestBlog()
  },[])
  



  return (
    <AnimationWrapper>
        <section className='h-cover flex justify-center gap-10 '>
            
            {/* Latest Blog */}

            <div className="w-full">

                <InPageNavigation routes={["Home" , "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>

                  <>
                  {
                    blogs ==null ? <Loader/>: 
                    blogs.map((blog,i)=>{
                        return <AnimationWrapper transition={{duration:1 , delay:i*.1}} key={i}><BlogPostCard content={blog} author={blog.author.personal_info}/></AnimationWrapper>
                    })

                  }
                  </>
                  
                  <h1>Trending BLogs Here</h1>
                </InPageNavigation>

            </div>

            {/* Trending Blogs */}

            <div className="">

            </div>

        </section>
    </AnimationWrapper>
  )
}
