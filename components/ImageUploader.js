import { useState } from 'react'
import { auth, storage } from '../lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import Loader from './Loader'

// Uploads images to Firebase Storage
const ImageUploader = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState(null)

  // Creates a Firebase Upload Task
  const uploadFile = async e => {
    // Get the file
    const file = Array.from(e.target.files)[0]
    const extension = file.type.split('/')[1]

    // Makes reference to the storage bucket location
    const imageRef = ref(
      storage,
      `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`,
    )
    setUploading(true)

    // Stars the upload
    const uploadTask = uploadBytesResumable(imageRef, file)

    // Listen to updates to upload task
    uploadTask.on(
      'state_changed',
      snapshot => {
        const pct = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0)
        setProgress(pct)
      },
      error => {},
      () => {
        // Get downloadURL AFTER promise resolves
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          setDownloadURL(url)
          navigator.clipboard.writeText(`![alt](${url})`)
          setUploading(false)
        })
      },
    )
  }

  return (
    <div className='box'>
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label className='btn'>
            📸 Upload Img
            <input
              type='file'
              onChange={uploadFile}
              accept='image/x-png,image/gif,image/jpeg'
            />
          </label>
        </>
      )}

      {downloadURL && (
        <code className='upload-snippet'>{`![alt](${downloadURL})`}</code>
      )}
    </div>
  )
}
export default ImageUploader
