import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import AgregarSecretariaModal from './AgregarSecretaria';
import TablaSecretarias from './TablaSecretaria';
import Buscador from '../components/Buscador';

const Secretarias = () => {
    const [showModal, setShowModal] = useState(false);
    const [pisos, setPisos] = useState([]);
    const [loadingPisos, setLoadingPisos] = useState(true);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [filtroNombre, setFiltroNombre] = useState('');

    const triggerRefresh = () => setRefresh(prev => !prev);

    const fetchPisos = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/pisos/listar', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            setPisos(response.data);
        } catch (err) {
            console.error('Error al obtener pisos:', err);
            setError('Error al cargar los pisos');
        } finally {
            setLoadingPisos(false);
        }
    };

    useEffect(() => {
        fetchPisos();
    }, []);

    return (
        <Layout>
            <div className="container mt-4 ms-4">
                <div className="text-center">
                    <h1>Gestionar Secretarias</h1>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                        disabled={loadingPisos}
                    >
                        {loadingPisos ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Cargando...
                            </>
                        ) : 'Agregar Secretaria'}
                    </button>

                    <div style={{ width: '250px' }}>
                        <Buscador
                            value={filtroNombre}
                            onChange={setFiltroNombre}
                        />
                    </div>
                </div>

                {error && <div className="alert alert-danger mt-3">{error}</div>}

                <TablaSecretarias refresh={refresh} filtroNombre={filtroNombre} />

                <AgregarSecretariaModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    pisos={pisos}
                    loadingPisos={loadingPisos}
                    triggerRefresh={triggerRefresh}
                />
            </div>
        </Layout>
    );
};

export default Secretarias;
