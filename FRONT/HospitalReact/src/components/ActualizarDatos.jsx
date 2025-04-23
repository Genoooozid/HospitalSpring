import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiKey, FiUser } from 'react-icons/fi';
import './css/ActualizarDatos.css';
import { useNavigate } from 'react-router-dom';

const ActualizarDatos = ({ show, onClose, userId, triggerRefresh }) => {

    const navigate = useNavigate();

    const username = sessionStorage.getItem('username');

    const [formData, setFormData] = useState({
        username: username || '',
        password: ''
    });

    const [errors, setErrors] = useState({
        username: false,
        password: false
    });

    const [loading, setLoading] = useState(false);

    const regex = {
        username: /^[a-zA-Z0-9_]{4,20}$/,
        password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: !regex[name].test(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'El nombre de usuario no puede estar vacío.'
            });
            return;
        }

        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');

            await axios.put(
                `http://localhost:8080/api/usuarios/persona/info-personal/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            sessionStorage.clear();
            localStorage.clear();

            Swal.fire({
                icon: 'success',
                title: 'Credenciales Actualizadas!',
                text: 'Vuelve a iniciar sesión con tus nuevos datos',
                showConfirmButton: true,
            }).then(() => {
                navigate("/");
            });

            onClose(true);
            if (triggerRefresh) triggerRefresh();
        } catch (error) {
            const message = error.response?.data?.message || 'Error al actualizar';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const inputStyle = (field) => ({
        borderColor: errors[field] ? 'red' : '#ced4da'
    });

    return (
        <div className="modal-backdrop">
            <div className="modal-container-sm">
                <div className="modal-header">
                    <h3><FiKey className="icon" /> Actualizar Credenciales</h3>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>
                            <FiUser className="me-2" />
                            Nuevo Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={inputStyle('username')}
                            placeholder="Ej: juan.perez"
                        />
                        {errors.username && (
                            <small className="text-danger">
                                Usuario inválido (4-20 caracteres alfanuméricos)
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiKey className="me-2" />
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={inputStyle('password')}
                            placeholder="Mínimo 8 caracteres"
                        />
                        {errors.password && (
                            <small className="text-danger">
                                La contraseña debe tener al menos 8 caracteres entre letras, números y carácter especial
                            </small>
                        )}
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

export default ActualizarDatos;