import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AsignarCamasAEnfermera = ({ show, enfermera, onClose, onSuccess }) => {
    const [camas, setCamas] = useState([]);
    const [camasAsignadas, setCamasAsignadas] = useState([]);
    const [selectedCamas, setSelectedCamas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pisoId, setPisoId] = useState(null);

    useEffect(() => {
        const obtenerCamas = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/camas/piso/${pisoId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const camasDisponibles = response.data.filter(cama =>
                    cama.nombreEnfermera === "Sin Enfermera"
                );

                setCamas(camasDisponibles);
                setError(null);
            } catch (err) {
                setError('Error al obtener las camas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (pisoId) {
            obtenerCamas();
        }
    }, [pisoId]);

    useEffect(() => {
        const obtenerPisoSecretaria = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const idUsuario = sessionStorage.getItem('id');
                const rol = sessionStorage.getItem('rol');

                if (rol === 'secretaria') {
                    const response = await axios.get(
                        `http://localhost:8080/api/usuarios/persona/secretarias/${idUsuario}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        }
                    );
                    setPisoId(response.data.piso?.idPiso);
                }
            } catch (err) {
                setError('Error al obtener el piso de la secretaria.');
                console.error(err);
            }
        };

        obtenerPisoSecretaria();
    }, []);

    useEffect(() => {
        const obtenerCamasAsignadas = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/asignaciones/listar', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const camasYaAsignadas = response.data.filter(cama => cama.idEnfermera === enfermera.id);
                setCamasAsignadas(camasYaAsignadas);
            } catch (err) {
                setError('Error al obtener las camas asignadas.');
                console.error(err);
            }
        };

        obtenerCamasAsignadas();
    }, [enfermera.id]);

    const handleCamaSelection = (camaId) => {
        setSelectedCamas((prevSelected) =>
            prevSelected.includes(camaId)
                ? prevSelected.filter(id => id !== camaId)
                : [...prevSelected, camaId]
        );
    };

    const handleSubmit = async () => {
        if (selectedCamas.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona al menos una cama',
                text: 'Por favor selecciona al menos una cama antes de continuar.',
            });
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                'http://localhost:8080/asignaciones/asignar-multiples',
                {
                    enfermeraId: enfermera.id,
                    camasIds: selectedCamas,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            Swal.fire({
                icon: 'success',
                title: '¡Camas asignadas correctamente!',
                text: 'Las camas han sido asignadas a la enfermera con éxito.',
            });

            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al asignar las camas',
                text: 'Hubo un problema al asignar las camas. Por favor, inténtalo nuevamente.',
            });
            console.error(err);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-container p-4">
                <div className="modal-header mb-3">
                    <h5>Asignar camas a: {enfermera.nombre} {enfermera.paterno} {enfermera.materno}</h5>
                </div>

                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p>Cargando camas disponibles...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : (
                        <>
                            <p className="text-muted">Selecciona las camas disponibles para asignar</p>

                            <div className="mb-3">
                                <h6>Camas ya asignadas</h6>
                                {camasAsignadas.length > 0 ? (
                                    <div className="list-group">
                                        {camasAsignadas.map(cama => (
                                            <div key={cama.idCama} className="list-group-item">
                                                {cama.nombreCama} (Asignada)
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">
                                        No hay camas asignadas a esta enfermera.
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <h6>Camas disponibles</h6>
                                {camas.length > 0 ? (
                                    <div className="list-group">
                                        {camas.map(cama => (
                                            <label key={cama.idCama} className="list-group-item">
                                                <input
                                                    className="form-check-input me-2"
                                                    type="checkbox"
                                                    checked={selectedCamas.includes(cama.idCama)}
                                                    onChange={() => handleCamaSelection(cama.idCama)}
                                                />
                                                {cama.nombre} - {cama.estadoCama}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">
                                        No hay camas disponibles en este piso
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={selectedCamas.length === 0}
                    >
                        Asignar Camas Seleccionadas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsignarCamasAEnfermera;
