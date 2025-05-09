import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiEdit } from 'react-icons/fi';
import './css/agregarEnfermera.css';

const regex = {
    nombreCompleto: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefono: /^\d{10}$/,
    username: /^[a-zA-Z0-9._-]{4,16}$/,
};

const ModificarEnfermera = ({ show, onClose, enfermera, triggerRefresh }) => {
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
        if (enfermera) {
            setFormData({
                nombre: enfermera.nombre || '',
                paterno: enfermera.paterno || '',
                materno: enfermera.materno || '',
                correo: enfermera.correo || '',
                telefono: enfermera.telefono || '',
                username: enfermera.username || ''
            });
        }
    }, [enfermera]);

    const validateField = (name, value) => {
        switch (name) {
            case 'nombre':
            case 'paterno':
            case 'materno':
                return regex.nombreCompleto.test(value) ? '' : 'Solo letras y espacios';
            case 'correo':
                return regex.correo.test(value) ? '' : 'Correo inválido';
            case 'telefono':
                return regex.telefono.test(value) ? '' : 'Teléfono debe tener 10 dígitos';
            case 'username':
                return regex.username.test(value) ? '' : 'Usuario inválido (4-16 caracteres)';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrors({
            ...errors,
            [name]: validateField(name, value)
        });
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            paterno: '',
            materno: '',
            correo: '',
            telefono: '',
            username: '',
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
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

            await axios.put(`http://localhost:8080/api/usuarios/persona/enfermera/${enfermera.id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Enfermera actualizada correctamente'
            });

            resetForm();
            onClose(true);
            setTimeout(() => {
                triggerRefresh();
            }, 3000);
        } catch (error) {
            const message = error.response?.data?.mensaje || error.response?.data?.message || 'Ocurrió un error al actualizar la enfermera';

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
        borderColor: errors[field] ? 'red' : '',
    });

    if (!show || !enfermera) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>
                        <FiEdit className="icon" /> Modificar Enfermera
                    </h3>
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
                            {errors.nombre && <small style={{ color: 'red' }}>{errors.nombre}</small>}
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
                            {errors.paterno && <small style={{ color: 'red' }}>{errors.paterno}</small>}
                        </div>

                        <div className="form-group">
                            <label>Apellido Materno:</label>
                            <input
                                type="text"
                                name="materno"
                                value={formData.materno}
                                onChange={handleChange}
                                style={inputStyle('materno')}
                                required
                            />
                            {errors.materno && <small style={{ color: 'red' }}>{errors.materno}</small>}
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
                            {errors.correo && <small style={{ color: 'red' }}>{errors.correo}</small>}
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
                            {errors.telefono && <small style={{ color: 'red' }}>{errors.telefono}</small>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nombre de Usuario:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={{
                                ...inputStyle('username'),
                                backgroundColor: '#f5f5f5',
                                cursor: 'not-allowed',
                                border: '1px solid #ddd',
                            }}
                            readOnly
                        />
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
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Actualizando...
                                </>
                            ) : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModificarEnfermera;