import { useState } from "react"

import TagInput from "../Input/TagInput";

import "./Form.css"

const Form = () => {
    const [ 
        bucket, setBucket 
    ] = useState<string>("nft")
    const [ 
        requiredContactField, setRequiredContactField 
    ] = useState<string>("")
    const [ 
        niceToHaveContactField, setNiceToHaveContactField 
    ] = useState<string>("")
    const [ 
        numberOfContacts, setNumberOfContacts 
    ] = useState<number>(1)
    const [ 
        requiredContactTags, setRequiredContactTags 
    ] = useState<string[]>([])
    const [ 
        niceToHaveContactTags, setNiceToHaveContactTags 
    ] = useState<string[]>([])

    const numberFormat = Intl.NumberFormat('en-US');
    
    // const [ niceToHaveContacts, setNiceToHaveContacts ] = useState([])
    // const [ requiredContacts, setRequiredContacts ] = useState([])

    const onBucketChange = (e: any) => {
        setBucket(e.target.value)
    }

    const onRequiredContactChange = (e: any) => {
        setRequiredContactField(e.target.value)
    }

    const onNiceContactChange = (e: any) => {
        setRequiredContactField(e.target.value)
    }

    const onExport = () => {
        return;
    }

    return (
        <div className="form">
            <div className="form-left">
                <div className="form-panel">
                    <p>
                        <strong>Notice: </strong> 
                        The Cogs Faucet is a constant work in progress with new datasets being added on a regular basis. 
                        Make sure to check back in the future so that are always targeting your audience with the best information and assistance possible.
                    </p>
                </div>

                <div className="form-panel form-inputs">
                    <div className="form-input">
                        <p>Behavior Segment</p>
                        <select 
                            name="bucket" 
                            value={bucket}
                            onChange={(e) => onBucketChange(e)}
                        >
                            <option value="nft">NFT</option>
                            <option value="defi">DeFi</option>
                            <option value="daos">DAOs</option>
                            <option value="social">Social</option>
                            <option value="governance">Governance</option>
                            <option value="developer">Developer</option>
                        </select>
                    </div>

                    <div className="form-input">
                        <p>Required Contact Fields</p>
                        <TagInput
                            tags={requiredContactTags}
                            setTags={setRequiredContactTags}
                            placeholder="Search..."
                            value={requiredContactField}
                            setValue={setRequiredContactField}
                        />
                    </div>

                    <div className="form-input">
                        <p>Nice to Have Contact Fields</p>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={niceToHaveContactField}
                            onChange={(e) => onNiceContactChange(e)}
                        />
                    </div>
                    <div className="form-input">
                        <p>Number of Contacts</p>
                        <div className="slider-container">
                            <span>
                                {numberFormat.format(numberOfContacts)}
                            </span>
                            <span className="slider">
                                
                            </span>
                            <span>
                                {numberFormat.format(5000)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="form-panel form-summary-panel">
                <div className="form-summary">
                    <p className="form-summary-title">
                        Buckets
                    </p>
                    <p>NFT</p>
                    <p>151</p>
                </div>
                <div className="form-summary">
                    <p className="form-summary-title">
                        Required Contacts
                    </p>
                    <div className="form-summary-contacts">
                        <div>
                            <p>Reddit</p>
                            <p>151</p>
                        </div>
                        <div>
                            <p>Twitter</p>
                            <p>151</p>
                        </div>
                        <div>
                            <p>Discord</p>
                            <p>151</p>
                        </div>
                    </div>
                </div>

                <div className="form-summary">
                    <p className="form-summary-title">
                        Nice to Have Contacts
                    </p>
                    <div className="form-summary-contacts">
                        <div>
                            <p>Reddit</p>
                            <p>151</p>
                        </div>
                        <div>
                            <p>Twitter</p>
                            <p>151</p>
                        </div>
                    </div>
                </div>

                <div className="form-summary checkout-cta">
                    <div className="checkout-price">
                        <span className="form-summary-title">
                            12.1
                        </span>
                        <span> ETH</span>
                    </div>
                    <button className="primary">
                        Export contacts
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Form;