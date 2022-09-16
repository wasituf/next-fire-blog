import Image from 'next/image'

// UI component for user profile
const UserProfile = ({ user }) => {
  return (
    <div className='box-center'>
      <div className='card-img-center'>
        <Image
          src={user.photoURL}
          alt='profile photo'
          width='100%'
          height='100%'
        />
      </div>
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  )
}
export default UserProfile
