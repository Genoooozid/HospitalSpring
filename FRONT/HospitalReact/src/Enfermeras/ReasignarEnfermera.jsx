import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const ReasignarEnfermeraModal = ({ show, onClose, enfermera, onSuccess }) => {
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
                try {
                    const token = sessionStorage.getItem('token');
                    const response = await axios.put(`http://localhost:8080/api/usuarios/persona/reasignar-enfermera`, null, {
                        params: {
                            enfermeraId: enfermera.id,
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

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMsg,
                    });
                }
            }
        });
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
    );
};

export default ReasignarEnfermeraModal;
