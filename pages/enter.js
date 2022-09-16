import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { doc, getDoc, writeBatch } from 'firebase/firestore'
import Image from 'next/image'
import { useContext, useState, useCallback, useEffect } from 'react'
import { UserContext } from '../lib/context'
import debounce from 'lodash.debounce'

const provider = new GoogleAuthProvider()

const EnterPage = ({}) => {
  const { user, username } = useContext(UserContext)

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  )
}
export default EnterPage

// Sign in with Google button
function SignInButton() {
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider)
  }

  return (
    <button className='btn-google' onClick={signInWithGoogle}>
      <div className='btn-img'>
        <Image
          src={'/google.png'}
          alt='google logo'
          width='100%'
          height='100%'
        />
      </div>
      Sign in with Google
    </button>
  )
}

// Sign out button
function SignOutButton() {
  return <button onClick={() => signOut(auth)}>Sign Out</button>
}

// Username form
function UsernameForm() {
  const [formValue, setFormValue] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user, username } = useContext(UserContext)

  useEffect(() => {
    checkUsername(formValue)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValue])

  const onChange = e => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase()
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/

    // Only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setFormValue(val)
      setLoading(false)
      setIsValid(false)
    }

    if (re.test(val)) {
      setFormValue(val)
      setLoading(true)
      setIsValid(false)
    }
  }

  // Hit the database for username match after each debounced change
  // useCallback is require for debounce to work
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkUsername = useCallback(
    debounce(async username => {
      if (username.length >= 3) {
        const ref = doc(db, 'usernames', username)
        const docSnap = await getDoc(ref)
        let exists
        if (docSnap.exists()) {
          exists = true
        }
        setIsValid(!exists)
        console.log('Firestore read executed!')
        setLoading(false)
      }
    }, 500),
    [],
  )

  const onSubmit = async e => {
    e.preventDefault()

    // Create refs for both documents
    const userDoc = doc(db, 'users', user.uid)
    const usernameDoc = doc(db, 'usernames', formValue)

    // Commit both docs togther as a batch write
    const batch = writeBatch(db)
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    })
    batch.set(usernameDoc, { uid: user.uid })

    await batch.commit()
  }

  function UsernameMessage({ username, isValid, loading }) {
    if (loading) {
      return <p>Checking...</p>
    } else if (isValid) {
      return <p className='text-sucess'>{username} is available!</p>
    } else if (username && username.length < 3) {
      return <p className='text-danger'>Username is too short!</p>
    } else if (username && !isValid) {
      return <p className='text-danger'>Username is taken!</p>
    } else {
      return <p></p>
    }
  }

  return (
    !username && (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input
            name='username'
            placeholder='username'
            value={formValue}
            onChange={onChange}
          />

          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />

          <button type='submit' className='btn-green' disabled={!isValid}>
            Choose
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  )
}
