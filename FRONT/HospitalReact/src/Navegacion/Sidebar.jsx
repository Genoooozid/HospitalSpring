import React from 'react';
import Swal from 'sweetalert2';
import Logo from '../assets/logo.png';
import Enfermera from '../assets/inyeccion.png';
import PisosCamas from '../assets/hospital.png';
import Paciente from '../assets/hospitalizacion.png';
import Secretaria from '../assets/secretario.png';

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const username = sessionStorage.getItem('username');
    const userRole = (sessionStorage.getItem('rol') || "admin").toLowerCase();

    const handleLogout = async () => {
        sessionStorage.clear();
        localStorage.clear();

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

    const rawMenuItems = [
        { name: "Pisos y Camas", icon: PisosCamas, path: "/camaspisos", roles: ["admin", "secretaria", "enfermera"] },
        { name: "Enfermeras", icon: Enfermera, path: "/enfermeras", roles: ["admin", "secretaria"] },
        { name: "Pacientes", icon: Paciente, path: "/pacientes", roles: ["admin", "enfermera"] },
        { name: "Secretarias", icon: Secretaria, path: "/secretarias", roles: ["admin"] },
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
                    }}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '0 15px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {rawMenuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        const isDisabled = !item.roles.includes(userRole);

                        return (
                            <li
                                key={index}
                                title={isDisabled ? "No tienes acceso" : ""}
                                style={{
                                    marginBottom: '5px',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: isActive ? '#3498db' : 'transparent',
                                    borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? 0.5 : 1,
                                }}
                                onClick={() => {
                                    if (!isDisabled) navigate(item.path);
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 15px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                }}>
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            marginRight: '15px',
                                            objectFit: 'contain',
                                            filter: isDisabled ? 'grayscale(100%)' : 'none',
                                        }}
                                    />
                                    <span style={{
                                        fontSize: '0.95rem',
                                        fontWeight: isActive ? '600' : '400'
                                    }}>
                                        {item.name}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
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
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => {
                        e.target.style.backgroundColor = '#e74c3c';
                        e.target.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#e74c3c';
                    }}
                    onClick={handleLogout}
                >
                    <span style={{ marginRight: '8px' }}></span>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Sidebar;