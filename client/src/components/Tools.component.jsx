import Embed from '@editorjs/embed'
import List from '@editorjs/list'
import Image from '@editorjs/image'
import Header from '@editorjs/header'
import Quote from '@editorjs/Quote'
import Marker from '@editorjs/Marker'
import InlineCode from '@editorjs/inline-code'

const uploadImageByUrl=(e)=>{
    let link =new Promise((resolve , reject)=>{
        try {
            resolve(e)
        } catch (error) {
            reject(error)
        }
    })

    return link.then(url=>{
        return {
            success:1,
            file:{ url }
        }
    })
}

export const tools={
    embed:Embed,
    list:{
        class:List,
        inlineToolbar:true
    },
    image:{
        class:Image,
        config:{
            uploader:{
                uploadByUrl:uploadImageByUrl
            }
        }
    },
    header:{
        class:Header,
        config:{
            placeholder:"Type heading...",
            levels:[2,3],
            defaultLevel:2
        }
    },
    quote:{
            class:Quote,
            inlineToolbar:true
        },
    marker:Marker,
    inlineCode: InlineCode
}