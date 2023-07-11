import React from 'react'

export default function ExpertGroupRadio({ expertGroupList, selectedExpertGroup, setSelectedExpertGroup }) {
    return (
        <div>
            {expertGroupList.map((expertGroup) => (
                <label key={expertGroup.expertGroupId} style={{ margin: '10px' }}>
                    <input style={{ margin: "10px" }}
                        type="radio"
                        name='expertGroup'
                        checked={selectedExpertGroup === expertGroup.expertGroupId}
                        onChange={() => setSelectedExpertGroup(expertGroup.expertGroupId)}
                    />
                    {expertGroup.expertGroupName}
                </label>
            ))}
        </div>
    )
}
