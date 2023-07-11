import React from 'react'

export default function SelectInput(props) {

    const handleSelectChange = (e) => {
        if (props.type === "Volunteer") {
            props.setVolunteer(e.target.value)
        }
        else if (props.type === "Request Type") {
            props.setRequestType(e.target.value)
        }
        else if (props.type === "Availability") {
            props.setAvailablity(e.target.value)
        }
        else if (props.type === "expertise") {
            props.setexpertise(e.target.value)
        }
    }

    return (
        <select className="form-select" onChange={handleSelectChange}>
            <option value="">Select {props.type}</option>
            {props.list.map((option, index) => (
                <option value={option} key={index}>
                    {option}
                </option>
            ))}
        </select>
    )
}
