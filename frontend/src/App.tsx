import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home"
import Buckets from "./pages/Buckets/Buckets"
import NotFound from "./pages/NotFound"

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import './App.css'

library.add(fas, fab)

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buckets" element={<Buckets />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="container">
        <p>Copyright © 2022 <a target="_blank" rel="noreferrer" href="https://www.usecogs.xyz">Cogs</a>. All rights reserved.</p>
        
        <a target="_blank" rel="noreferrer" href="https://www.usecogs.xyz/terms-of-service/">Terms of Service</a>
        <a target="_blank" rel="noreferrer" href="https://www.usecogs.xyz/privacy-policy/">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default App
