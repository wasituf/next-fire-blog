import styles from '../../styles/Admin.module.css'
import AuthCheck from '../../components/AuthCheck'
import { db, auth, serverTS } from '../../lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import ImageUploader from '../../components/ImageUploader'

import { useState } from 'react'
import { useRouter } from 'next/router'

import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import toast from 'react-hot-toast'

const AdminPostEdit = () => {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  )
}
export default AdminPostEdit

function PostManager() {
  const [preview, setPreview] = useState(false)

  const router = useRouter()
  const { slug } = router.query

  console.log(slug)

  const postRef = doc(db, 'users', auth.currentUser.uid, 'posts', slug)
  const [post] = useDocumentData(postRef)

  return (
    <main className={styles.container}>
      {post ? (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className='btn-blue'>Live view</button>
            </Link>
          </aside>
        </>
      ) : (
        <h1>No posts</h1>
      )}
    </main>
  )
}

function PostForm({ defaultValues, postRef, preview }) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: 'onChange',
  })

  const { isValid, isDirty, errors } = formState

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTS(),
    })

    reset({ content, published })

    toast.success('Post updated successfully')
  }

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className='card'>
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea
          {...register('content', {
            maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
          })}
        />

        {errors.content && (
          <p className='text-danger'>{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            {...register('published')}
            type='checkbox'
          />
          <label>Published</label>
        </fieldset>

        <button
          className='btn-green'
          type='submit'
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
