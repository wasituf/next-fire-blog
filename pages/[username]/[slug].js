import styles from '../../styles/Post.module.css'
import PostContent from '../../components/PostContent'
import AuthCheck from '../../components/AuthCheck'
import HeartButton from '../../components/HeartButton'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { getUserWithUsername, db, postToJSON } from '../../lib/firebase'
import { doc, getDoc, getDocs, collectionGroup } from 'firebase/firestore'
import Metatags from '../../components/Metatags'

const Post = props => {
  const postRef = doc(db, props.path)
  const [realtimePost] = useDocumentData(postRef)

  const post = realtimePost || props.post

  return (
    <main className={styles.container}>
      <Metatags title={post.title} description={`post by ${post.username}`} />
      <section>
        <PostContent post={post} />
      </section>

      <aside className='card'>
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck>
          <HeartButton postRef={postRef} path={props.path} />
        </AuthCheck>
      </aside>
    </main>
  )
}
export default Post

export async function getStaticProps({ params }) {
  const { username, slug } = params
  const userDoc = await getUserWithUsername(username)

  let post
  let path

  if (userDoc) {
    const postRef = doc(db, `users/${userDoc.id}/posts/${slug}`)
    post = await getDoc(postRef)
    post = postToJSON(post)

    path = postRef.path
  }

  return {
    props: { post, path },
    revalidate: 5000,
  }
}

export async function getStaticPaths() {
  // Improve by using Admin SDK to select empty docs
  const snapshot = await getDocs(collectionGroup(db, 'posts'))

  const paths = snapshot.docs.map(doc => {
    const { slug, username } = doc.data()
    return {
      params: { username, slug },
    }
  })

  return {
    // must be in this format:
    // paths: [
    // { params: { username, slug }}
    // ]
    paths,
    fallback: 'blocking',
  }
}
