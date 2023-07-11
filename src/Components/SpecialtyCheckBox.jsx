import React from 'react'

export default function SpecialtyCheckBox({ specialtyList, selectedSpecialty, handleSpecialtyChange }) {

    return (
        <div>
            {specialtyList.map((specialty) => (
                <label key={specialty.specialtyId} style={{ margin: '10px' }}>
                    <input style={{ margin: "10px" }}
                        type="checkbox"
                        checked={selectedSpecialty.includes(specialty.specialtyId)}
                        onChange={() => handleSpecialtyChange(specialty.specialtyId)} />
                    {specialty.specialtyName}
                </label>
            ))}
        </div>
    )
}
