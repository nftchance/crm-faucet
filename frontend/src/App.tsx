import { useState } from 'react'

import Form from "./components/Form/Form";

import drop from "./assets/drop.svg";

import './App.css'

interface Tweet {
  avatar: string;
  handle: string;
  tweet: string;
}

function App() {
  const placeholderTweet = {
    avatar: 'https://pbs.twimg.com/profile_images/1601309352618594304/hEYGqZoZ_400x400.jpg',
    handle: 'nftchance',
    tweet: 'I finally have contacts in my CRM that I can start work through thanks to web3 faucet from @usecogsxyz!',
  }
  const tweets = Array(12).fill(placeholderTweet) as Tweet[];

  const staticContact = {
    email: 'hello@usecogs.xyz',
    twitter: 'usecogsxyz',
    address: '0x0000000000000000000000000000000000000000',
  }
  const contacts = Array(10).fill(staticContact);

  const bucketOptions = [{
    value: 'NFT',
  }, {
    value: 'DeFi',
  }, {
    value: 'DAOs',
    out: true,
  }, {
    value: 'Social',
  }, {
    value: 'Governance',
  }, {
    value: 'Developer',
    out: true,
  }]

  return (
    <div className="App">
      <nav>
        <div className="container">
          <a href="/" className="logo">
            <img src={drop} alt="logo" />
            <h4>Drop</h4>
          </a>
        </div>
      </nav>

      <div className="hero">
        <div className="container">
          <div className="content">
            <h1>Grow faster with instant access to contact information and user behavior of ideal users for your Web3 product.</h1>
            <p className="lead">Access tens of thousands of individuals and supercharge how you target, contact, and nurture relationships with prospective customers.</p>
          </div>

          <Form />
        </div>
      </div>

      <div className="jumbo">
        <div className="container">
          <h2>Ready to grow beyond your personal network and seed your CRM with thousands of data-enriched contacts?</h2>
        </div>
      </div>

      <div className="container">
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

      <div className="twitter">
        <div className="container">
          <div className="tweets">
            {tweets.map((tweet) => (
              <div className="tweet">
                <div className="tweet-header">
                  <img src={tweet.avatar} alt="avatar" />
                  <h4>{tweet.handle}</h4>
                </div>

                <div className="tweet-content">
                  <p>{tweet.tweet}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="container twitter-cta">
            <h4>Tweet your experience using the Faucet to see your tweet appear here in real-time!</h4>
            <div>
              <button className="secondary">Tweet now</button>
            </div>
          </div>
        </div>
      </div>

      <div className="buckets container">
        <div>
          <h3>Increase growth rates with the help of highly targeted web3 behavior buckets.</h3>
          <p>Unlock the power to target specific members of the Web3 ecosystem so that you can identify your future customers.</p>
        </div>
        <div className="bucket-options">
          {bucketOptions.map((option) => (
            <div className={option.out ? 'bucket-option out' : 'bucket-option'}>
              <p>
                {option.value}
                {option.out && <small> (out of stock)</small>}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="jumbo">
        <div className="container">
          <h2>“According to studies, account-based closed-won opportunities have, on average, a 33% higher average contract value.”</h2>
        </div>
      </div>

      <div className="jumbo bottom">
        <div className="container">
          <div className="content">
            <h2>Your next 10,000 crypto native leads are a slider away.</h2>
            {/* big slider */}
            <button className="primary" onClick={() => window.scrollTo(0, 0)}>Get audience</button>
          </div>
        </div>
      </div>

      <div className="footer container">
        <p>Copyright © 2022 <a href="https://www.usecogs.xyz">Cogs</a>. All rights reserved.</p>
        <a href="https://www.usecogs.xyz/terms-of-service/">Terms of Service</a>
        <a href="https://www.usecogs.xyz/privacy-policy/">Privacy Policy</a>
      </div>
    </div >
  )
}

export default App
