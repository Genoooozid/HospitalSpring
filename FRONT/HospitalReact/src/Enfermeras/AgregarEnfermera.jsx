import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiUser } from 'react-icons/fi';
import './css/agregarEnfermera.css';

const AgregarEnfermera = ({ show, onClose, pisos, loadingPisos, triggerRefresh }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        paterno: '',
        materno: '',
        correo: '',
        telefono: '',
        username: '',
        password: '',
        pisoAsignado: { idPiso: '' }
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'idPiso') {
            setFormData({
                ...formData,
                pisoAsignado: { idPiso: value }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
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
            password: '',
            pisoAsignado: { idPiso: '' }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');

            await axios.post('http://localhost:8080/api/usuarios/persona/enfermera', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Enfermera agregada correctamente',
                timer: 2000,
                showConfirmButton: false
            });

            resetForm();
            onClose(true);

            setTimeout(() => {
                triggerRefresh();
            }, 3000);
            
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Ocurrió un error al agregar la enfermera',
            });
        } finally {
            setLoading(false);
        }
    };


    if (!show) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>
                        <FiUser className="icon" /> Agregar Nueva Enfermera
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
                                required
                            />
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
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Apellido Materno:</label>
                            <input
                                type="text"
                                name="materno"
                                value={formData.materno}
                                onChange={handleChange}
                            />
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
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label> Teléfono:</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre de Usuario:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label> Contraseña:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label> Piso Asignado:</label>
                        <select
                            name="idPiso"
                            value={formData.pisoAsignado.idPiso}
                            onChange={handleChange}
                            required
                            disabled={loadingPisos}
                        >
                            <option value="">{loadingPisos ? 'Cargando pisos...' : 'Seleccione un piso'}</option>
                            {pisos.map((piso) => (
                                <option key={piso.idPiso} value={piso.idPiso}>
                                    Piso {piso.numeroPiso} - {piso.nombre}
                                </option>
                            ))}
                        </select>
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
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : 'Guardar Enfermera'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgregarEnfermera;