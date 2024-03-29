import {Route, Link, Routes} from 'react-router-dom';
function Home() {
    return (
        <>
            <h1 id='title'>Rhythm Game :)</h1>
            <Link className='link' to='/Game'>Alphabet Test</Link>
        </>
    );
}

export default Home;