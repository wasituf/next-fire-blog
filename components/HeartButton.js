import { db, auth } from '../lib/firebase'
import { increment, writeBatch, doc } from 'firebase/firestore'
import { useDocument } from 'react-firebase-hooks/firestore'

// Allows user to heart or like a post
const HeartButton = ({ postRef, path }) => {
  // Litsen to heart cocument for currently logged in user
  const heartRef = doc(db, `${path}/hearts/${auth.currentUser.uid}`)
  const [heartDoc] = useDocument(heartRef)

  console.log(heartDoc?.data())

  // Create a user-to-pot relationship
  const addHeart = async () => {
    const uid = auth.currentUser.uid
    const batch = writeBatch(db)

    batch.update(postRef, { heartCount: increment(1) })
    batch.set(heartRef, { uid })

    await batch.commit()
  }

  // Remove a user-to-post relationship
  const removeHeart = async () => {
    const batch = writeBatch(db)

    batch.update(postRef, { heartCount: increment(-1) })
    batch.delete(heartRef)

    await batch.commit()
  }

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>💗 Heart</button>
  )
}
export default HeartButton
