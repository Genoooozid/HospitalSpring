import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h2 className="text-center">Iniciar sesión</h2>
                    <ToastContainer />

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Usuario</label>
                            <input
                                type="text"
                                id="username"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Introduce tu usuario"
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Introduce tu contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cargando...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;