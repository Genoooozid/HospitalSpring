import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import DelegarCamasModal from './DelegarCamas';

const ReasignarEnfermeraModal = ({ show, onClose, enfermera, onSuccess }) => {
    const [pisos, setPisos] = useState([]);
    const [nuevoPisoId, setNuevoPisoId] = useState('');
    const [loading, setLoading] = useState(true);
    const [showDelegarCamasModal, setShowDelegarCamasModal] = useState(false);
    const [enfermerasDelPiso, setEnfermerasDelPiso] = useState([]);
    const [reintentarReasignacion, setReintentarReasignacion] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const fetchEnfermerasPorPiso = async (pisoId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/usuarios/persona/enfermeras/piso/${pisoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEnfermerasDelPiso(response.data);
        } catch (err) {
            console.error('Error al obtener enfermeras por piso:', err);
        }
    };

    const realizarReasignacion = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/usuarios/persona/reasignar-usuario`, null, {
                params: {
                    usuarioId: enfermera.id,
                    nuevoPisoId: parseInt(nuevoPisoId)
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'Reasignado',
                text: response.data,
                timer: 2000,
                showConfirmButton: false
            });

            onSuccess();
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data || 'Error al reasignar la enfermera.';

            if (errorMsg.includes('camas asignadas')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMsg,
                    showCancelButton: true,
                    cancelButtonText: 'Cancelar',
                    confirmButtonText: 'Delegar camas',
                }).then(result => {
                    if (result.isConfirmed) {
                        setShowDelegarCamasModal(true);
                        setReintentarReasignacion(true);
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMsg,
                });
            }
        }
    };

    const handleConfirm = () => {
        if (!nuevoPisoId) {
            Swal.fire('Error', 'Selecciona un piso antes de continuar.', 'warning');
            return;
        }

        if (parseInt(nuevoPisoId) === enfermera.piso?.idPiso) {
            Swal.fire('Advertencia', 'La enfermera ya está asignada a ese piso.', 'info');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: 'La enfermera será reasignada al nuevo piso.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, reasignar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await realizarReasignacion();
            }
        });
    };

    const handleDelegacionExitosa = async () => {
        setShowDelegarCamasModal(false);
        if (reintentarReasignacion) {
            setReintentarReasignacion(false);
            setTimeout(async () => {
                await realizarReasignacion();
            }, 400);
        }
    };

    useEffect(() => {
        if (show) {
            fetchPisos();
            setNuevoPisoId('');
        }
    }, [show]);

    useEffect(() => {
        if (enfermera.piso?.idPiso) {
            fetchEnfermerasPorPiso(enfermera.piso.idPiso);
        }
    }, [enfermera]);

    if (!show) return null;

    return (
        <div>
            {!showDelegarCamasModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reasignar Enfermera</h5>
                                <button type="button" className="btn-close" onClick={onClose}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Selecciona el nuevo piso</label>
                                <select
                                    className="form-select"
                                    value={nuevoPisoId}
                                    onChange={(e) => setNuevoPisoId(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">-- Selecciona un piso --</option>
                                    {pisos.map((piso) => (
                                        <option key={piso.idPiso} value={piso.idPiso}>
                                            {piso.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleConfirm}>Aceptar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDelegarCamasModal && (
                <DelegarCamasModal
                    enfermeraActual={enfermera}
                    visible={showDelegarCamasModal}
                    onClose={() => setShowDelegarCamasModal(false)}
                    onDelegadoExitosamente={handleDelegacionExitosa}
                />
            )}
        </div>
    );
};

export default ReasignarEnfermeraModal;
