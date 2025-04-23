import React from 'react';
import { Link } from 'react-router-dom';

const Error404 = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>404</h1>
                <p style={styles.message}>Oops... Página no encontrada</p>
                <p style={styles.subtext}>La ruta que estás buscando no existe o fue movida.</p>
                <Link to="/" style={styles.button}>
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif',
    },
    card: {
        background: '#fff',
        padding: '40px 60px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
    },
    title: {
        fontSize: '5rem',
        margin: '0',
        color: '#dc3545',
    },
    message: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginTop: '10px',
        marginBottom: '5px',
    },
    subtext: {
        fontSize: '0.95rem',
        color: '#6c757d',
        marginBottom: '20px',
    },
    button: {
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '500',
    }
};

export default Error404;
