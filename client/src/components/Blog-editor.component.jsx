import { Link } from 'react-router-dom'
import logo from '../imgs/logo.png'
import AnimationWrapper from '../common/Page-animation'
import defaultBanner from '../imgs/blog banner.png'

export default function BlogEditor() {
    const handleBannerUpload=(e)=>{
        console.log(e.target.files[0]);
        const img=e.target.files[0];
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

    <AnimationWrapper>
        <section>
            <div className="mx-auto max-w-[900px] w-full">

                <div className="relative aspect-video bg-white border-4 border-grey hover:opacity-80">
                    <label htmlFor='uploadBanner'>
                        <img src={defaultBanner} 
                        className='z-20'
                        alt="defaultBanner" />
                        <input
                         type="file" id="uploadBanner" 
                         accept='.pnj , .jpg , .jpeg'
                         hidden 
                         onChange={handleBannerUpload}
                         />
                    </label>
                </div>

            </div>
        </section>
    </AnimationWrapper>
    </>
  )
}
