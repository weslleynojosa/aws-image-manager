import { useState } from "react"
import { s3 } from "../App"
import { IPicture } from "../pages/Gallery"
import '../styles/Images.css'

type IPictureData = {
    image: IPicture,
    bucketName: string,
    getImages: Function,
}

const Image: React.FC<IPictureData> = (props) => {
  const { url, key } = props.image
  const [title, setTitle] = useState<string>(key || '')

  const deleteImg = (key: string | undefined) => {
      if (key) {
        s3.deleteObject({ Bucket: props.bucketName, Key: key }, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log('DELETE',data);
            props.getImages()
          }
        })
      }
  }

  const renameKey = (oldKey: string | undefined) => {
    if (title !== oldKey) {
        s3.copyObject({ Bucket: props.bucketName, CopySource: `${props.bucketName}/${oldKey}`, Key: title }, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            deleteImg(oldKey)
          }
        })
    }
  }
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }


  return (
      <div className="card-image">
          <img className="image" alt='' src={url}/>
          <input className="img-title" type={'text'} value={title} onChange={handleChange} onBlur={(e) => renameKey(key)}/>
          <button className="default-button delete-btn" onClick={() => deleteImg(props.image.key)}>
              <img src="/delete.svg" alt=""/>
          </button>
      </div> 
  )
}

export default Image