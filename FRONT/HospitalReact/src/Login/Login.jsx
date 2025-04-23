import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock } from 'react-icons/fa';
import logo from '../assets/logo.png'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (username === '' || password === '') {
            setError('Por favor, completa todos los campos.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/signin', {
                username,
                password,
            });

            if (response.data.status === 'OK') {
                await Swal.fire({
                    title: '¡Éxito!',
                    text: 'Inicio de sesión exitoso',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                });

                // Extraer los valores de la respuesta
                const { token, rol, id, nombreCompleto } = response.data.data;

                localStorage.setItem('token', token);
                localStorage.setItem('username', username);
                localStorage.setItem('rol', rol);
                localStorage.setItem('id', id);
                localStorage.setItem('nombreCompleto', nombreCompleto);


                sessionStorage.setItem('id', id);
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('rol', rol);
                sessionStorage.setItem('nombreCompleto', nombreCompleto);
                navigate('/camaspisos');
            }
        } catch (error) {
            setError('Usuario o contraseña incorrectos.');
            toast.error('Error al iniciar sesión. Verifica tus datos.', {
                position: "top-right",
                autoClose: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(to right, #a1c4fd, #c2e9fb)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <ToastContainer />
            <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: 400, borderRadius: '20px' }}>
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo Hospital" style={{ width: 80 }} />
                    <h4 className="mt-2">Sistema Hospitalario</h4>
                    <p className="text-muted">Accede con tu cuenta</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Usuario</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaUser /></span>
                            <input
                                type="text"
                                id="username"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Usuario"
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <div className="input-group">
                            <span className="input-group-text"><FaLock /></span>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mt-3"
                        disabled={isLoading}
                        style={{ borderRadius: '30px' }}
                    >
                        {isLoading ? 'Cargando...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;