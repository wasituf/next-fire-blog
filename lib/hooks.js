import { auth, db } from './firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

// Custom hook to read auth record and user profile doc
export const useUserData = () => {
  const [user] = useAuthState(auth)
  const [username, setUsername] = useState(null)

  useEffect(() => {
    // turn of realtime subscription
    let unsubscribe

    if (user) {
      unsubscribe = onSnapshot(doc(db, 'users', user.uid), doc => {
        setUsername(doc.data()?.username)
      })
    } else {
      setUsername(null)
    }

    return unsubscribe
  }, [user])

  return { user, username }
}
