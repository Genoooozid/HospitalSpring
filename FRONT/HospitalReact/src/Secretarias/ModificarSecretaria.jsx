import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiEdit } from 'react-icons/fi';

const ModificarSecretaria = ({ show, onClose, secretaria, triggerRefresh }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        username: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (secretaria) {
            setFormData({
                nombre: secretaria.nombre || '',
                paterno: secretaria.paterno || '',
                materno: secretaria.materno || '',
                correo: secretaria.correo || '',
                telefono: secretaria.telefono || '',
                username: secretaria.username || ''
            });
        }
    }, [secretaria]);

    const validateField = (name, value) => {
        switch (name) {
            case 'nombre':
            case 'paterno':
            case 'materno':
                return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(value.trim());
            case 'correo':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'telefono':
                return /^\d{10}$/.test(value);
            case 'username':
                return /^[a-zA-Z0-9_]{4,20}$/.test(value);
            default:
                return true;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: !validateField(name, value)
        }));
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            paterno: '',
            materno: '',
            correo: '',
            telefono: '',
            username: ''
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedData = {};
        const newErrors = {};

        Object.entries(formData).forEach(([key, value]) => {
            const trimmedValue = value.trim();
            trimmedData[key] = trimmedValue;

            if (!validateField(key, trimmedValue)) {
                newErrors[key] = true;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: 'Revisa los campos marcados antes de continuar.'
            });
            return;
        }

        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');

            await axios.put(
                `http://localhost:8080/api/usuarios/persona/secretaria/${secretaria.id}`,
                trimmedData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Secretaria actualizada correctamente'
            });

            resetForm();
            onClose(true);
            setTimeout(() => triggerRefresh(), 3000);
        } catch (error) {
            const message = error.response?.data?.mensaje || error.response?.data?.message || 'Ocurrió un error al actualizar la secretaria';

            Swal.fire({
                icon: 'error',
                title: 'No se pudo actualizar',
                text: message,
            });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field) => ({
        borderColor: errors[field] ? 'red' : undefined
    });

    if (!show || !secretaria) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h3><FiEdit className="icon" /> Modificar Secretaria</h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre(s):</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                style={inputStyle('nombre')}
                                required
                            />
                            {errors.nombre && <small style={{ color: 'red' }}>Solo letras y espacios</small>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Apellido Paterno:</label>
                            <input
                                type="text"
                                name="paterno"
                                value={formData.paterno}
                                onChange={handleChange}
                                style={inputStyle('paterno')}
                                required
                            />
                            {errors.paterno && <small style={{ color: 'red' }}>Solo letras y espacios</small>}
                        </div>

                        <div className="form-group">
                            <label>Apellido Materno:</label>
                            <input
                                type="text"
                                name="materno"
                                value={formData.materno}
                                onChange={handleChange}
                                style={inputStyle('materno')}
                            />
                            {errors.materno && <small style={{ color: 'red' }}>Solo letras y espacios</small>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Correo:</label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                style={inputStyle('correo')}
                                required
                            />
                            {errors.correo && <small style={{ color: 'red' }}>Correo inválido</small>}
                        </div>

                        <div className="form-group">
                            <label>Teléfono:</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                style={inputStyle('telefono')}
                                required
                            />
                            {errors.telefono && <small style={{ color: 'red' }}>Teléfono debe tener 10 dígitos</small>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nombre de Usuario:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={inputStyle('username')}
                            required
                        />
                        {errors.username && <small style={{ color: 'red' }}>Usuario inválido (4-16 carácteres)</small>}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onClose(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModificarSecretaria;
