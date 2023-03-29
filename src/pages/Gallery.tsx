import { useEffect, useState } from "react"
import { s3 } from "../App";
import Image from "../components/Image";
import '../styles/Gallery.css'

export interface IPicture {
    url: string,
    key: string | undefined
}


const Gallery = () => {
    const [imgs, setImgs] = useState<IPicture[]>([])
    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)
    const [ratio, setRatio] = useState<number>(0)
    const [bucketName, setBUcketName] = useState<string>(() => {
        let bucket = JSON.parse(localStorage.getItem('ENV_PARAMS') || '{}')
        return bucket.bucket_name
    })
    const [uploadWarn, setUploadWarn] = useState<string>('')
    const [uploadSucc, setUploadSucc] = useState<boolean>(false)


    useEffect(() => {
        getImages()
    },[bucketName])

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadWarn('')     
        const { files } = e.target
        const uploadedImg = files as FileList
        let img: HTMLImageElement;
        img = document.createElement("img");
        img.onload = () => {
            setWidth(img.width)
            setHeight(img.height) 
        };

        setRatio(height / width)
    
        if (uploadedImg?.[0].type === 'image/png') {
            if (ratio <= 2) {
                if (uploadedImg[0].size / 1000 < 5000) {
                    const params = {
                        ACL: 'public-read',
                        Body: uploadedImg?.[0],
                        Bucket: bucketName,
                        Key: uploadedImg?.[0].name,
                        ContentType: 'image/png',
                    };

                    s3.putObject(params)
                    .send((err) => { if (err) console.log(err)})
                    getImages()
                } else {
                    setUploadWarn('max size 5MB')
                }
            } else {
                setUploadWarn('ratio between height and width does not exceed 2');
            }
        } else {
          setUploadWarn('send only .PNG pictures');
        }
        showMessage()
    }

    const showMessage = () => {
        setUploadSucc(true)
        setTimeout(() => {
            setUploadSucc(false)
        }, 2000)
    }

    const getImages = () => {
        const params = {
          Bucket: bucketName,
          Delimiter: ''
        };
        s3.listObjectsV2(params, (err, data) => {
          if (err) {
            console.log(err, err.stack)
          } else {
            const dataImg = data.Contents
    
            if (dataImg) {
                let imgArray: IPicture[] = []
                dataImg.map((img) => {
                    imgArray.push({ url: getImgUrl(img), key: img.Key })       
                })
                setImgs(imgArray)  
            }
          }
        })
    }

    const getImgUrl = (img: AWS.S3.Object) => {
        return s3.getSignedUrl('getObject', { Bucket: bucketName, Key: img.Key })
    }

    return (
        <div className="main">
            <header>
                <h1>AWS S3 Image Manager</h1>
                <label className="upload-button" htmlFor='uploadImages'>UPLOAD</label>
                <input id='uploadImages' type={'file'} hidden onChange={handleUpload}/>
            </header>
            { uploadWarn !== '' ? <span className="warning">{uploadWarn}</span> : '' }
            { uploadSucc ? <span className="warning">Image sent successfully</span> : '' }
            <div className="images-container">
                {imgs.length > 0 && imgs.map((img, index) => {
                    return <Image image={img} key={index}/>
                })}
            </div>
        </div>
    )
}

export default Gallery