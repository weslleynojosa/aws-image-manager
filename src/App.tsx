import './App.css';
import AWS from 'aws-sdk'
import Gallery from './pages/Gallery';
import Main from './pages/Main';
import { useState, useEffect } from 'react';

const getCred = JSON.parse(localStorage.getItem('ENV_PARAMS') || '{}')

export const s3 = new AWS.S3({
  params: { Bucket: getCred.bucket_name },
  region: getCred.region,
  accessKeyId: getCred.access_key,
  secretAccessKey: getCred.secret_access_key,
})


function App() {
  const [defParams, setDefParams] = useState<boolean>(false)

  useEffect(() => {
    if (localStorage.getItem('ENV_PARAMS') != null) {
      setDefParams(true)
    }
  },[])
  
  return (
    <>
      {!defParams ? <Main/> : <Gallery/>}
    </>
  );
}

export default App;
