import { useEffect, useState } from "react"
import { s3 } from "../App";
import Image from "../components/Image";
import '../styles/Gallery.css'

export interface IPicture {
    url: string,
    key: string | undefined,
    id: number
}


const Gallery = () => {
    const [imgs, setImgs] = useState<IPicture[]>([])
    const [imgFile, setImgFile] = useState<HTMLImageElement>()
    const [ratio, setRatio] = useState<number>(0)
    const [bucketName, setBucketName] = useState<string>(() => {
        let bucket = JSON.parse(localStorage.getItem('ENV_PARAMS') || '{}')
        return bucket.bucket_name
    })
    const [uploadWarn, setUploadWarn] = useState<string>('')
    const [uploadSucc, setUploadSucc] = useState<boolean>(false)


    useEffect(() => {
        getImages()
    },[])

    const getImages = () => {
        const params = {
          Bucket: bucketName,
        };
        setTimeout(() => {
            s3.listObjectsV2(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack)
                } else {
                    const dataImg = data.Contents
            
                    if (dataImg) {
                        let imgArray: IPicture[] = []
                        dataImg.map((img, index) => {
                            imgArray.push({ url: getImgUrl(img), key: img.Key, id: index })       
                        })
                        if (imgArray != imgs) {
                            setImgs(imgArray)
                        }
                    }
                }
            })
        }, 1000)
    }

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadWarn('')     
        const { files } = e.target
        const uploadedImg = files as FileList
        let img: HTMLImageElement = document.createElement("img");
        var blob = URL.createObjectURL(uploadedImg?.[0]);
        img.src = blob
        img.onload = () => {
            console.log(img.height + " " + img.width);
            if (uploadedImg && uploadedImg?.[0].type === 'image/png') {
                if ((img.height / img.width) <= 2) {
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
                        showMessage()
                        getImages()
                    } else {
                        setUploadWarn('Max size 5MB')
                    }
                } else {
                    setUploadWarn('Ratio between height and width exceed 2');
                }
            } else {
              setUploadWarn('Send only .PNG pictures');
            }
        }     
    }

    const showMessage = () => {
        setUploadSucc(true)
        setTimeout(() => {
            setUploadSucc(false)
        }, 2000)
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
            { uploadSucc ? <span className="success">Image sent successfully</span> : '' }
            <div className="images-container">
                {imgs.map((img, index) => {
                    return <Image image={img} key={index} bucketName={bucketName} getImages={getImages}/>
                })}
            </div>
        </div>
    )
}

export default Gallery