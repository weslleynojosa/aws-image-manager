import { useState } from "react"
import '../styles/Main.css'
import '../styles/Gallery.css'

type Values = {
    bucket_name : string,
    region : string,
    access_key : string,
    secret_access_key : string,
}

const Main = () => {
    const [values, setValues] = useState<Values>({
        bucket_name : '',
        region : '',
        access_key : '',
        secret_access_key : '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues({...values, [e.target.name] : e.target.value})
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        localStorage.setItem('ENV_PARAMS', JSON.stringify(values))
        let bucket = JSON.parse(localStorage.getItem('ENV_PARAMS') || '{}')
        console.log(bucket)
    }

    return (
        <div className="main">
            <header>
                <h1>AWS S3 Image Manager</h1>
            </header>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Bucket Name</label>
                    <input required name="bucket_name" onChange={handleChange} type='text'/>
                </div>
                <div>
                    <label>Region</label>
                    <input required name="region" onChange={handleChange} type='text'/>
                </div>
                <div>
                    <label>Access Key</label>
                    <input required name="access_key" onChange={handleChange} type='text'/>
                </div>
                <div>
                    <label>Secret Access Key</label>
                    <input required name="secret_access_key" onChange={handleChange} type='text'/>
                </div>
                <button type="submit">SUBMIT</button>
            </form>
        </div>
    )

}

export default Main