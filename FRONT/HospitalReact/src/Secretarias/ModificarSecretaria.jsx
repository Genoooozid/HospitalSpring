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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');

            await axios.put(`http://localhost:8080/api/usuarios/persona/secretaria/${secretaria.id}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'Secretaria actualizada correctamente'
            });

            resetForm();
            onClose(true);
            setTimeout(() => {
                triggerRefresh();
            }, 3000);
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

    if (!show || !secretaria) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>
                        <FiEdit className="icon" /> Modificar Secretaria
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
                            <label>Teléfono:</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

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