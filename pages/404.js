import Link from 'next/link'

const Custom404 = () => {
  return (
    <main>
      <h1 className='el-center'>404 - That page does not seem to exist...</h1>
      <iframe
        src='https://giphy.com/embed/9J7tdYltWyXIY'
        width='480'
        height='404'
        frameBorder='0'
        className='giphy-embed'
        allowFullScreen
      ></iframe>
      <Link href='/'>
        <button className='btn-blue el-center'>Go home</button>
      </Link>
    </main>
  )
}
export default Custom404
