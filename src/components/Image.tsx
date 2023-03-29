import { useState } from "react"
import { s3 } from "../App"
import { IPicture } from "../pages/Gallery"
import '../styles/Images.css'

type IPictureData = {
    image: IPicture
}

const Image: React.FC<IPictureData> = (props) => {
    const [title, setTitle] = useState<string>(props.image.key || '')

    const deleteImg = (key: string | undefined) => {
        if (key) {
          s3.deleteObject({ Bucket:'image-manager-s3', Key: key }, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
            }
          })
        }
      }

    const renameKey = (newKey: string, oldKey: string | undefined) => {
        setTitle(newKey)
        if (newKey !== oldKey) {
            s3.copyObject({ Bucket:'image-manager-s3', CopySource: `${'image-manager-s3'}/${oldKey}`, Key: newKey })
            .promise()
            .then((res) => {
              deleteImg(oldKey)
            })
            .catch((e) => console.error(e))
        }
      }
    
      const handleChange = (title: string) => {
        setTitle(title)
      }


    return (
        <div className="card-image">
            <img className="image" alt='' src={props.image.url}/>
            <input className="img-title" type={'text'} value={title} onChange={(e) => handleChange(e.target.value)} onBlur={(e) => renameKey(title, props.image.key)}/>
            <button className="default-button delete-btn" onClick={() => deleteImg(props.image.key)}>
                <img src="/delete.svg" alt=""/>
            </button>
        </div> 
    )
}

export default Image