import { useState } from 'react'
import reactLogo from './assets/leetcode.svg'
import viteLogo from './assets/code-forces.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const handleRedirect = () => {
    window.location.href = '/leetcode-comparator/index.html';
  };
  const handleRedirect1 = () => {
    window.location.href = '/CFcomparator/index.html';
  };
  return (
    <>
      <div>
        <a href="https://codeforces.com" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://leetcode.com" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Codeforces + Leetcode</h1>
      <div className="button-container">
  <button onClick={handleRedirect1}>Codeforces</button>
  <button onClick={handleRedirect}>LeetCode</button>
</div>

      <p className="read-the-docs">
        Choose the platform where you wanna Analyse yourself
      </p>
    </>
  )
}

export default App
