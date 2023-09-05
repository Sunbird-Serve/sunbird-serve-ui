import React from 'react';

function TimeInput({ label, onChange }) {
    const handleTimeChange = (event) => {
        const newValue = event.target.value;
        onChange(newValue);
    };

    return (
        <div>
            <label>{label}:</label>
            <input type="time" onChange={handleTimeChange} />
        </div>
    );
}

export default TimeInput;