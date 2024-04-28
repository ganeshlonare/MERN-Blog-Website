import React from 'react'
import AnimationWrapper from '../common/Page-animation'
import InPageNavigation from '../components/Inpage-navigation.component'

export default function HomePage() {
  return (
    <AnimationWrapper>
        <section className='h-cover flex justify-center gap-10 '>
            
            {/* Latest Blog */}

            <div className="w-full">

                <InPageNavigation routes={["Home" , "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>
                  <h1>Latest BLogs Here</h1>
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
