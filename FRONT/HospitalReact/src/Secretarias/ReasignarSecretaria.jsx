import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const ReasignarSecretariaModal = ({ show, onClose, secretaria, onSuccess }) => {
    const [pisos, setPisos] = useState([]);
    const [nuevoPisoId, setNuevoPisoId] = useState('');
    const [loading, setLoading] = useState(true);

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

    const realizarReasignacion = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/api/usuarios/persona/reasignar-usuario`, null, {
                params: {
                    usuarioId: secretaria.id,
                    nuevoPisoId: parseInt(nuevoPisoId)
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'Reasignada',
                text: response.data,
                timer: 2000,
                showConfirmButton: false
            });

            onSuccess();
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data || 'Error al reasignar la secretaria.';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMsg,
            });
        }
    };

    const handleConfirm = async () => {
        if (!nuevoPisoId) {
            Swal.fire('Error', 'Selecciona un piso antes de continuar.', 'warning');
            return;
        }

        if (parseInt(nuevoPisoId) === secretaria.piso?.idPiso) {
            Swal.fire('Acción no permitida', 'La secretaria ya está asignada a ese piso.', 'info');
            return;
        }

        const hayOtrasSecretarias = await verificarSecretariasEnPiso(secretaria.piso?.idPiso, secretaria.id);

        if (!hayOtrasSecretarias) {
            Swal.fire('Acción no permitida', 'No puedes reasignar a la única secretaria del piso.', 'warning');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: 'La secretaria será reasignada al nuevo piso.',
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

    const verificarSecretariasEnPiso = async (pisoId, secretariaId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/usuarios/persona/secretarias/piso/${pisoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const secretarias = response.data;
            return secretarias.some((s) => s.id !== secretariaId);
        } catch (error) {
            console.error('Error al verificar secretarias en el piso:', error);
            return false;
        }
    };


    useEffect(() => {
        if (show) {
            fetchPisos();
            setNuevoPisoId('');
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Reasignar Secretaria</h5>
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
    );
};

export default ReasignarSecretariaModal;