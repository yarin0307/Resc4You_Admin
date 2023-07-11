import React from 'react'
import { Label, Input } from 'reactstrap';


export default function RegisterInputs({ name, type, value, label, setInputValue }) {

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    return (
        <div>
            <Label style={{ fontWeight: "bold" }} for={label}>{name}</Label>
            <Input type={type} name={label} value={value} onChange={handleInputChange} />
        </div>
    )
}
