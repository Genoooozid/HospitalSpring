import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const DelegarCamasModal = ({ enfermeraActual, visible, onClose, onDelegadoExitosamente }) => {
    const [enfermerasDelPiso, setEnfermerasDelPiso] = useState([]);
    const [enfermeraDelegadaId, setEnfermeraDelegadaId] = useState('');
    const [noEnfermerasDisponibles, setNoEnfermerasDisponibles] = useState(false);

    useEffect(() => {
        const fetchEnfermeras = async () => {
            if (!enfermeraActual?.piso?.idPiso) return;
            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get(
                    `http://localhost:8080/api/usuarios/persona/enfermeras/piso/${enfermeraActual.piso.idPiso}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const otrasEnfermeras = res.data.filter(e => e.id !== enfermeraActual.id);
                setEnfermerasDelPiso(otrasEnfermeras);
                setNoEnfermerasDisponibles(otrasEnfermeras.length === 0);
            } catch (err) {
                console.error('Error al obtener enfermeras:', err);
            }
        };

        if (visible) {
            setEnfermeraDelegadaId('');
            setNoEnfermerasDisponibles(false);
            fetchEnfermeras();
        }
    }, [visible, enfermeraActual]);

    const handleDelegar = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/api/usuarios/persona/delegar-camas', null, {
                params: {
                    enfermeraActualId: enfermeraActual.id,
                    nuevaEnfermeraId: enfermeraDelegadaId
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            await Swal.fire({
                icon: 'success',
                title: 'Camas delegadas',
                text: response.data,
                timer: 2000,
                showConfirmButton: false
            });

            onClose();
            onDelegadoExitosamente();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al delegar las camas.',
            });
        }
    };

    if (!visible) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Delegar Camas</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <label className="form-label">Selecciona la enfermera a la que deseas delegar las camas</label>
                        {noEnfermerasDisponibles ? (
                            <div className="form-select" style={{ padding: '0.375rem 0.75rem', backgroundColor: '#f1f1f1' }}>
                                -- No hay enfermeras disponibles --
                            </div>
                        ) : (
                            <select
                                className="form-select"
                                value={enfermeraDelegadaId}
                                onChange={(e) => setEnfermeraDelegadaId(e.target.value)}
                            >
                                <option value="">-- Selecciona una enfermera --</option>
                                {enfermerasDelPiso.map((enf) => (
                                    <option key={enf.id} value={enf.id}>
                                        {enf.nombre} {enf.paterno}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button
                            className="btn btn-primary"
                            onClick={handleDelegar}
                            disabled={!enfermeraDelegadaId || noEnfermerasDisponibles}
                        >
                            Delegar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DelegarCamasModal;
