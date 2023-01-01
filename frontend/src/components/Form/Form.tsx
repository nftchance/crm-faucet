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

const sizes: {
    [key: string]: number;
} = {
    Sample: 5,
    Personal: 100,
    Medium: 1000,
    Large: 2500,
    Enterprise: 5000,
}

const buckets: string[] = [
    'NFT',
    'DeFi',
    'DAOs',
    'Social',
    'Governance',
    'Developer',
]

const contactFields: string[] = [
    'Ethereum Wallet',
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
        numberOfContacts: 5,
        requiredContactFields: ["Ethereum Wallet", "Twitter", "Discord"],
        optionalContactFields: ["Telegram"]
    });

    const freeContacts = 5;
    const paidContacts = formState.numberOfContacts > freeContacts ? formState.numberOfContacts - freeContacts : 0;

    const unitPrice = 0.0005;
    const totalPrice = (unitPrice * paidContacts).toFixed(4);

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
                    <p><small><strong>Notice:</strong> The faucet is currently in beta. Please be patient as we work out the kinks. The maximum download is limited to 5,000 contacts per transaction to prevent extreme contact competition so that you can grow even faster!</small></p>
                </div>

                <div className="form-panel form-inputs">
                    <FormControl sx={{ width: "100%" }}>
                        <InputLabel id="contacts">Contacts</InputLabel>
                        <Select name="numberOfContacts"
                            value={formState.numberOfContacts}
                            onChange={(e) => handleChange(e.target.value as string, "numberOfContacts")}
                            input={<OutlinedInput id="contacts" label="Contacts" />}
                        >
                            {Object.keys(sizes).map((size) => (
                                <MenuItem key={size} value={sizes[size]}>{sizes[size]} | {size}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

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

                    <button className="cta">{totalPrice} <small>ETH</small> | Export Contacts</button>
                </div>
            </div>
        </div>
    )
}

export default Form;