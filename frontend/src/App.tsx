import Navbar from "./components/Navbar/Navbar";
import Form from "./components/Form/Form";

import './App.css'

function App() {
  return (
    <div className="App">
      <div className="hero blue">
        <div className="content">
          <div className="container">
            <Navbar />

            <h1>Grow faster with instant access to contact information and user behavior of ideal users for your Web3 product.</h1>

            <Form />
          </div>
        </div>
      </div>
      <div className="import">
        <div className="container">
          <div className="content">
            <div>
              <h2>Import your new audience contacts into your favorite CRM.</h2>
              <p>We provide the leads, you turn them into evangelists. Export all the contacts in a single click and take them with you.</p>
              <button className="cta" onClick={() => window.scrollTo(0, 0)}>+ Export Contacts</button>
            </div>
          </div>
        </div>
      </div>

      <footer className="container">
        <p>Copyright © 2022 <a target="_blank" rel="noreferrer" href="https://www.usecogs.xyz">Cogs</a>. All rights reserved.</p>
        <a target="_blank" rel="noreferrer" href="https://www.usecogs.xyz/terms-of-service/">Terms of Service</a>
        <a target="_blank" rel="noreferrer" href="https://www.usecogs.xyz/privacy-policy/">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default App
