import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiUser } from 'react-icons/fi';

const regex = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefono: /^\d{10}$/,
    username: /^[a-zA-Z0-9._-]{4,16}$/,
};

const AgregarSecretaria = ({ show, onClose, pisos, loadingPisos, triggerRefresh }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        username: '',
        pisoAsignado: { idPiso: '' }
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const token = sessionStorage.getItem('token');

    const validateField = (name, value) => {
        switch (name) {
            case 'nombre':
            case 'paterno':
            case 'materno':
                return regex.nombre.test(value) ? '' : 'Solo letras y espacios';
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

        if (name === 'idPiso') {
            setFormData({ ...formData, pisoAsignado: { idPiso: value } });
        } else {
            setFormData({ ...formData, [name]: value });
            setErrors({ ...errors, [name]: validateField(name, value) });
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            paterno: '',
            materno: '',
            correo: '',
            telefono: '',
            username: '',
            pisoAsignado: { idPiso: '' }
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
            await axios.post('http://localhost:8080/api/usuarios/secretarias', trimmedData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: '¡Registrada!',
                text: 'Secretaria registrada correctamente'
            });

            resetForm();
            triggerRefresh();
        } catch (error) {
            const message = error.response?.data?.mensaje || error.response?.data?.message || 'Ocurrió un error al registrar la secretaria';

            Swal.fire({
                icon: 'error',
                title: 'Error al registrar',
                text: message
            });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const inputStyle = (field) => ({
        borderColor: errors[field] ? 'red' : '',
    });

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>
                        <FiUser className="icon" /> Agregar Nueva Secretaria
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre(s):</label>
                            <input style={inputStyle('nombre')} type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            {errors.nombre && <small style={{ color: 'red' }}>{errors.nombre}</small>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Apellido Paterno:</label>
                            <input style={inputStyle('paterno')} type="text" name="paterno" value={formData.paterno} onChange={handleChange} required />
                            {errors.paterno && <small style={{ color: 'red' }}>{errors.paterno}</small>}
                        </div>

                        <div className="form-group">
                            <label>Apellido Materno:</label>
                            <input style={inputStyle('materno')} type="text" name="materno" value={formData.materno} onChange={handleChange} required />
                            {errors.materno && <small style={{ color: 'red' }}>{errors.materno}</small>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Correo:</label>
                            <input style={inputStyle('correo')} type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                            {errors.correo && <small style={{ color: 'red' }}>{errors.correo}</small>}
                        </div>

                        <div className="form-group">
                            <label>Teléfono:</label>
                            <input style={inputStyle('telefono')} type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                            {errors.telefono && <small style={{ color: 'red' }}>{errors.telefono}</small>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre de Usuario:</label>
                            <input style={inputStyle('username')} type="text" name="username" value={formData.username} onChange={handleChange} required />
                            {errors.username && <small style={{ color: 'red' }}>{errors.username}</small>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Piso Asignado:</label>
                        <select
                            name="idPiso"
                            value={formData.pisoAsignado.idPiso}
                            onChange={handleChange}
                            required
                            disabled={loadingPisos}
                            style={inputStyle('idPiso')}
                        >
                            <option value="">{loadingPisos ? 'Cargando pisos...' : 'Seleccione un piso'}</option>
                            {pisos.map((piso) => (
                                <option key={piso.idPiso} value={piso.idPiso}>
                                    Piso {piso.numeroPiso} - {piso.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.idPiso && <small style={{ color: 'red' }}>{errors.idPiso}</small>}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                resetForm();
                                onClose(false);
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : 'Guardar Secretaria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgregarSecretaria;