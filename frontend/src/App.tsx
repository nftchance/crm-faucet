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

      {/* <div className="container">
        <div className="import">
          <div className="content">
            <h3>Import your new audience contacts into your favorite CRM.</h3>
            <p>We provide the leads, you turn them into evangelists. Exports from the Cogs Faucet are immediately interoperable with all major contact relationship managers.</p>
          </div>

          <div className="contacts">
            <div className="contact">
              <strong><p>Email</p></strong>
              <strong><p>Twitter</p></strong>
              <strong><p>Address</p></strong>
            </div>
            {contacts.map((contact) => (
              <div className="contact">
                <p>{contact.email}</p>
                <p>{contact.twitter}</p>
                <p>{contact.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div> 
      
      <div className="footer container">
        <p>Copyright © 2022 <a href="https://www.usecogs.xyz">Cogs</a>. All rights reserved.</p>
        <a href="https://www.usecogs.xyz/terms-of-service/">Terms of Service</a>
        <a href="https://www.usecogs.xyz/privacy-policy/">Privacy Policy</a>
      </div> */}
    </div>
  )
}

export default App
