import React from 'react';

const Buscador = ({ value, onChange, placeholder = "Buscar por nombre o piso..." }) => {
    return (
        <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default Buscador;