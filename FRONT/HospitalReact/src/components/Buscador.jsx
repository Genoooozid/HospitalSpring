import React from 'react';

const Buscador = ({ value, onChange }) => {
    return (
        <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default Buscador;
