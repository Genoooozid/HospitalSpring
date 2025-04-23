import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DelegarCamasModal from './DelegarCamas';

const EliminarEnfermera = ({ enfermera, onSuccess, disabled = false }) => {
    const { id, estatus, nombre, paterno, materno, piso } = enfermera;
    const token = sessionStorage.getItem('token');

    const [showDelegarCamasModal, setShowDelegarCamasModal] = useState(false);
    const [reintentarEliminacion, setReintentarEliminacion] = useState(false);

    const fetchEnfermerasPorPiso = async (pisoId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/usuarios/persona/enfermeras/piso/${pisoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            console.error('Error al obtener enfermeras por piso:', err);
            return [];
        }
    };

    const handleEliminar = async () => {
        if (disabled) return;

        const enfermeras = await fetchEnfermerasPorPiso(piso?.idPiso);
        const enfermerasActivas = enfermeras.filter(e => e.estatus === true);

        if (enfermerasActivas.length === 1 && enfermerasActivas[0].id === id) {
            Swal.fire('Acción no permitida', 'No puedes desactivar a la única enfermera activa asignada a este piso.', 'warning');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: `La enfermera ${nombre} ${paterno} ${materno} será desactivada.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8080/api/usuarios/persona/eliminar/enfermera/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: `La enfermera ${nombre} ${paterno} ${materno} ha sido desactivada correctamente.`,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    onSuccess();
                } catch (error) {
                    const status = error.response?.status;
                    const message = error.response?.data?.message;

                    if (status === 409) {
                        Swal.fire({
                            icon: 'error',
                            title: 'No se puede eliminar',
                            text: 'La enfermera tiene camas asignadas y no puede ser eliminada.',
                            showCancelButton: true,
                            cancelButtonText: 'Cancelar',
                            confirmButtonText: 'Delegar camas',
                        }).then(result => {
                            if (result.isConfirmed) {
                                setShowDelegarCamasModal(true);
                                setReintentarEliminacion(true);
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: message || 'Ocurrió un error al intentar eliminar a la enfermera.',
                        });
                    }
                }
            }
        });
    };

    const handleDelegacionExitosa = async () => {
        setShowDelegarCamasModal(false);
        if (reintentarEliminacion) {
            setReintentarEliminacion(false);
            setTimeout(() => {
                handleEliminar();
            }, 400);
        }
    };

    const handleReactivar = async () => {
        Swal.fire({
            title: '¿Reactivar enfermera?',
            text: `La enfermera ${nombre} ${paterno} ${materno} volverá a estar activa.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.put(`http://localhost:8080/api/usuarios/persona/activar/${id}`, {}, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Reactivada',
                        text: `La enfermera ${nombre} ${paterno} ${materno} ha sido reactivada correctamente.`,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    onSuccess();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Ocurrió un error al intentar reactivar a la enfermera.',
                    });
                }
            }
        });
    };

    return (
        <>
            {estatus ? (
                <button
                    className="btn btn-sm btn-danger"
                    style={{ width: '98px' }}
                    onClick={handleEliminar}
                    disabled={disabled}
                >
                    Desactivar
                </button>
            ) : (
                <button
                    className="btn btn-sm btn-success"
                    style={{ width: '98px' }}
                    onClick={handleReactivar}
                >
                    Reactivar
                </button>
            )}

            {showDelegarCamasModal && (
                <DelegarCamasModal
                    enfermeraActual={enfermera}
                    visible={showDelegarCamasModal}
                    onClose={() => setShowDelegarCamasModal(false)}
                    onDelegadoExitosamente={handleDelegacionExitosa}
                />
            )}
        </>
    );
};

export default EliminarEnfermera;
