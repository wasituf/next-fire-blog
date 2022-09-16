import Link from 'next/link'
import Image from 'next/image'
import { useContext } from 'react'
import { UserContext } from '../lib/context'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

// Top navbar
const Navbar = () => {
  const { user, username } = useContext(UserContext)

  const handleSignOut = () => {
    signOut(auth)
  }

  return (
    <nav className='navbar'>
      <ul>
        <li>
          <Link href='/'>
            <button className='btn-logo'>FEED</button>
          </Link>
        </li>

        {/* user is signed-in and has username */}
        {username && (
          <>
            <li className='push-left'>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
            <li>
              <Link href='/admin'>
                <button className='btn-blue'>Write Posts</button>
              </Link>
            </li>
            <li>
              <Link href={`/${username}`}>
                <a>
                  <Image
                    className='nav-img'
                    src={user?.photoURL || '/hacker.png'}
                    alt='profile photo'
                    width='50px'
                    height='50px'
                  />
                </a>
              </Link>
            </li>
          </>
        )}

        {/* user is not signed OR has not created username */}
        {!username && (
          <li>
            <Link href='/enter'>
              <button className='btn-blue'>Log in</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
export default Navbar
