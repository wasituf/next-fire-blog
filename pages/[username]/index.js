import UserProfile from '../../components/UserProfile'
import PostFeed from '../../components/PostFeed'
import { db, getUserWithUsername, postToJSON } from '../../lib/firebase'
import {
  getDocs,
  collectionGroup,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { query as fireQuery } from 'firebase/firestore'

export async function getServerSideProps(context) {
  const { username } = context.params

  const userDoc = await getUserWithUsername(username)

  // If no user, short circuit to 404 page
  if (!userDoc) {
    return { notFound: true }
  }

  // JSON serializable data
  let user = null
  let posts = null

  if (userDoc) {
    user = userDoc.data()
    const postsQuery = fireQuery(
      collectionGroup(db, 'posts'),
      where('username', '==', user.username),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5),
    )

    posts = (await getDocs(postsQuery)).docs.map(doc => postToJSON(doc))
  }

  return {
    props: {
      user,
      posts,
    }, // will be passed to the page component as props
  }
}

const UserProfilePage = ({ user, posts }) => {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  )
}
export default UserProfilePage
