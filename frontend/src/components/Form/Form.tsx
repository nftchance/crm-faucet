import { useState } from "react"

import { Select, MenuItem, Slider } from "@mui/material"

import "./Form.css"

type FormState = {
    bucket: string,
    requiredContactField: string,
    niceToHaveContactField: string,
    numberOfContacts: number,
    requiredContactTags: string[],
    niceToHaveContactTags: string[],
}

const InitialState: FormState = {
    bucket: "nft",
    requiredContactField: "",
    niceToHaveContactField: "",
    numberOfContacts: 500,
    requiredContactTags: ["Reddit", "Twitter", "Discord"],
    niceToHaveContactTags: ["Telegram"]
}

const Form = () => {
    const [ formState, setFormState ] = useState(InitialState);

    const numberFormat = Intl.NumberFormat('en-US');

    const onFormChange = (event: any, field: string) => {
        console.log('form change', event.target.value, field)
        setFormState({
            ...formState,
            [field]: event.target.value
        })
    }

    const onRemoveTag = (tag: any, field: string) => {
        if(field !== "requiredContactTags" && field !== "niceToHaveContactTags") return;

        setFormState((prevState) => ({
            ...prevState,
            [field]: (prevState[field] as string[]).filter((t: any) => t !== tag)
        }))
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
                        <Select 
                            name="bucket" 
                            value={formState.bucket}
                            onChange={(e) => onFormChange(e, "bucket")}
                            style={{width: "100%"}}
                        >
                            <MenuItem value="nft">NFT</MenuItem>
                            <MenuItem value="defi">DeFi</MenuItem>
                            <MenuItem value="daos">DAOs</MenuItem>
                            <MenuItem value="social">Social</MenuItem>
                            <MenuItem value="governance">Governance</MenuItem>
                            <MenuItem value="developer">Developer</MenuItem>
                        </Select>
                    </div>

                    <div className="form-input">
                        <p>Required Contact Fields</p>
                        <div className="input-tagged">
                            <div className="input-tags">
                                {formState.requiredContactTags.map((tag, index) => (
                                    <span key={index} className="tag">
                                        <span>{tag}</span>
                                        <button
                                            className="tag-close-icon"
                                            onClick={() => onRemoveTag(tag, "requiredContactTags")}
                                        >
                                            <svg viewBox="0 0 8 8" width="8" height="10" stroke="#00000035" strokeWidth="2" fill="#00000035" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 1 L7 7 M7 1 L1 7" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..."
                                value={formState.requiredContactField}
                                onChange={(e) => onFormChange(e, "requiredContactField")}
                            />
                        </div>
                    </div>

                    <div className="form-input">
                        <p>Nice to Have Contact Fields</p>
                        <div className="input-tagged">
                            <div className="input-tags">
                                {formState.niceToHaveContactTags.map((tag, index) => (
                                     <span key={index} className="tag">
                                        <span>{tag}</span>
                                        <button
                                            className="tag-close-icon"
                                            onClick={() => onRemoveTag(tag, "niceToHaveContactTags")}
                                        >
                                            <svg viewBox="0 0 8 8" width="8" height="10" stroke="#00000035" strokeWidth="2" fill="#00000035" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 1 L7 7 M7 1 L1 7" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={formState.niceToHaveContactField}
                                onChange={(e) => onFormChange(e, "niceToHaveContactField")}
                            />
                        </div>
                    </div>
                    <div className="form-input">
                        <p>Number of Contacts</p>
                        <div className="slider-container">
                            <span>
                                {numberFormat.format(formState.numberOfContacts)}
                            </span>
                            <Slider 
                                size="small"
                                value={formState.numberOfContacts} 
                                onChange={(e) => onFormChange(e, "numberOfContacts")} 
                                step={1}
                                min={1}
                                max={5000}
                                style={{
                                    color: "#00000010"
                                }}
                            />
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