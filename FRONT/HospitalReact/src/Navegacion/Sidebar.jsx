import React from 'react';
import Swal from 'sweetalert2';
import Logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');
    const userRole = "Administrador"; 

    const handleLogout = async () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("username");

        Swal.fire({
            icon: "success",
            title: "Sesión cerrada",
            text: "Has cerrado sesión correctamente.",
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            navigate("/");
        });
    };

    const menuItems = [
        { name: "Pisos y Camas", icon: "🏥", path: "/camaspisos" },
        { name: "Enfermeras", icon: "💉", path: "/enfermeras" },
        { name: "Pacientes", icon: "👨‍⚕️", path: "/pacientes" },
        { name: "Secretarias", icon: "📋", path: "/secretarias" },
    ];

    return (
        <div style={{
            width: '280px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 0',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000
        }}>
            <div style={{
                textAlign: 'center',
                padding: '20px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '20px'
            }}>
                <img
                    src={Logo}
                    alt="Hospital Logo"
                    style={{ width: '150px', marginBottom: '15px' }}
                />
                <h3 style={{
                    margin: '5px 0',
                    color: '#fff',
                    fontWeight: '600'
                }}>Sistema Hospitalario</h3>
                <p style={{
                    margin: 0,
                    color: '#ecf0f1',
                    fontSize: '0.85rem',
                    opacity: 0.8
                }}>v1.0.0</p>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 25px',
                marginBottom: '20px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                margin: '0 15px 25px'
            }}>
                <div>
                    <p style={{
                        margin: 0,
                        fontWeight: '600',
                        fontSize: '0.95rem'
                    }}>{username}</p>
                    <p style={{
                        margin: 0,
                        color: '#bdc3c7',
                        fontSize: '0.8rem'
                    }}>{userRole}</p>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '0 15px' }}>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                }}>
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            style={{
                                marginBottom: '5px',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease',
                                ':hover': {
                                    backgroundColor: '#3498db'
                                }
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 15px',
                                cursor: 'pointer',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                ':hover': {
                                    backgroundColor: '#3498db'
                                }
                            }}>
                                <span style={{
                                    fontSize: '1.2rem',
                                    marginRight: '15px',
                                    width: '25px',
                                    textAlign: 'center'
                                }}>{item.icon}</span>
                                <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{
                padding: '15px 25px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button
                    style={{
                        backgroundColor: 'transparent',
                        color: '#e74c3c',
                        border: '1px solid #e74c3c',
                        padding: '10px',
                        cursor: 'pointer',
                        width: '100%',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        fontWeight: '500',
                        ':hover': {
                            backgroundColor: '#e74c3c',
                            color: 'white'
                        }
                    }}
                    onClick={handleLogout}
                >
                    <span style={{ marginRight: '8px' }}>🚪</span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;