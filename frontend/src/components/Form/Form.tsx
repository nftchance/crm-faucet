import { useState } from "react"

import { Theme, useTheme } from '@mui/material/styles';
import { Box, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Slider } from "@mui/material"

import "./Form.css"

interface FormState {
    bucket: string;
    requiredContactField: string;
    niceToHaveContactField: string;
    numberOfContacts: number;
    requiredContactFields: string[];
    optionalContactFields: string[];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const buckets = [
    'NFT',
    'DeFi',
    'DAOs',
    'Social',
    'Governance',
    'Developer',
]

const contactFields = [
    'Reddit',
    'Twitter',
    'Discord',
    'Telegram',
    'Email',
]

function getStyles(name: string, value: readonly string[], theme: Theme) {
    return {
        fontWeight:
            value.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const Form = () => {
    const theme = useTheme();

    const [formState, setFormState] = useState<FormState>({
        bucket: buckets[0],
        requiredContactField: "",
        niceToHaveContactField: "",
        numberOfContacts: 500,
        requiredContactFields: ["Reddit", "Twitter", "Discord"],
        optionalContactFields: ["Telegram"]
    });

    const numberFormatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0,
    });

    const handleChange = (value: any, name: string) => {
        setFormState({
            ...formState,
            [name]: typeof value === 'string' ? value.split(',') : value
        })
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
                    <FormControl sx={{ width: "100%" }}>
                        <InputLabel id="required-fields">Behavior Segments</InputLabel>
                        <Select name="bucket"
                            value={formState.bucket}
                            onChange={(e) => handleChange(e.target.value as string, "bucket")}
                            input={<OutlinedInput id="bucket" label="Behavior Segments" />}
                        >
                            {buckets.map((bucket) => (
                                <MenuItem key={bucket} value={bucket}>{bucket}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ width: "100%" }}>
                        <InputLabel id="required-fields">Required Fields</InputLabel>
                        <Select labelId="required-fields" id="required-fields" MenuProps={MenuProps} multiple
                            value={formState.requiredContactFields}
                            onChange={(e) => handleChange(e.target.value as string, "requiredContactFields")}
                            input={<OutlinedInput id="select-required-fields" label="Required Fields" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {contactFields.map((field) => (
                                <MenuItem key={field} value={field} style={getStyles(field, formState.requiredContactFields, theme)}>
                                    {field}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ width: "100%" }}>
                        <InputLabel id="optional-fields">Optional Fields</InputLabel>
                        <Select labelId="optional-fields" id="optional-fields" MenuProps={MenuProps} multiple
                            value={formState.optionalContactFields}
                            onChange={(e) => handleChange(e.target.value as string, "optionalContactFields")}
                            input={<OutlinedInput id="select-optional-fields" label="Optional Fields" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {contactFields.map((field) => (
                                <MenuItem key={field} value={field} style={getStyles(field, formState.optionalContactFields, theme)}>
                                    {field}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <div className="form-input">
                        <InputLabel id="required-fields" sx={{ mb: 0.5 }}>Number of Contacts</InputLabel>
                        <div className="slider-container">
                            <span>{numberFormatter.format(formState.numberOfContacts)}</span>
                            <Slider step={1} min={1} max={5000} style={{ color: "#00000010" }}
                                size="small"
                                value={formState.numberOfContacts}
                                onChange={(e, value) => handleChange(value as number, "numberOfContacts")}
                            />
                            <span>{numberFormatter.format(5000)}</span>
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