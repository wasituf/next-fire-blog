import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { getStorage, TaskEvent } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyA183CfYpDgF5lXZF5p5wnxFisvKcqNNEU',
  authDomain: 'nextfire-507c0.firebaseapp.com',
  projectId: 'nextfire-507c0',
  storageBucket: 'nextfire-507c0.appspot.com',
  messagingSenderId: '109417710485',
  appId: '1:109417710485:web:ff95f83ce3eb30fdf92c9c',
}

export const app = initializeApp(firebaseConfig)

export const auth = getAuth()

export const db = getFirestore(app)
export const fromMillis = Timestamp.fromMillis
export const serverTS = serverTimestamp

export const storage = getStorage(app)

/// Helper functions

/**`
 * Gets a users/{uid} document with username
 * @param {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('username', '==', username), limit(1))
  const querySnapshot = await getDocs(q)
  const userDoc = querySnapshot.docs[0]

  return userDoc
}

/**`
 * Converts a firestore document to JSON
 * @param {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data()
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  }
}
