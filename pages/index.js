import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import { useState } from 'react'
import { db, postToJSON, fromMillis } from '../lib/firebase'
import {
  getDocs,
  query,
  collectionGroup,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import PostFeed from '../components/PostFeed'
import Metatags from '../components/Metatags'

// Max post to query per page
const LIMIT = 1

export async function getServerSideProps(context) {
  const postsQuery = query(
    collectionGroup(db, 'posts'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT),
  )

  const posts = (await getDocs(postsQuery)).docs.map(doc => postToJSON(doc))

  return {
    props: { posts }, // will be passed to the page component as props
  }
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts)
  const [loading, setLoading] = useState(false)

  const [postsEnd, setPostsEnd] = useState(false)

  const getMorePosts = async () => {
    setLoading(true)
    const last = posts[posts.length - 1]

    const cursor =
      typeof last.createdAt === 'number'
        ? fromMillis(last.createdAt)
        : last.createdAt

    const q = query(
      collectionGroup(db, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT),
    )

    const newPosts = (await getDocs(q)).docs.map(doc => doc.data())

    setPosts(posts.concat(newPosts))
    setLoading(false)

    if (newPosts.length < LIMIT) {
      setPostsEnd(true)
    }
  }

  return (
    <main>
      <Metatags
        title='NextFire Blog | Get your voice out there'
        description='NextFire Blog is the go to social platform to address public concerns and indulge in constructive debates.'
        image='https://firebasestorage.googleapis.com/v0/b/nextfire-507c0.appspot.com/o/metatag-img.png?alt=media&token=76f249b6-3b9d-4366-82cb-8ff2923528c9'
      />
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end'}
    </main>
  )
}
