import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const EliminarSecretaria = ({ secretaria, onSuccess, disabled = false }) => {
    const { id, estatus, nombre, paterno, materno } = secretaria;
    const token = sessionStorage.getItem('token');

    const handleEliminar = async () => {
        if (disabled) return;
        Swal.fire({
            title: '¿Estás seguro?',
            text: `La secretaria ${nombre} ${paterno} ${materno} será desactivada.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8080/api/usuarios/persona/eliminar/secretaria/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminada',
                        text: `La secretaria ${nombre} ${paterno} ${materno} ha sido desactivada correctamente.`,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    onSuccess();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Ocurrió un error al intentar eliminar a la secretaria.',
                    });
                }
            }
        });
    };

    const handleReactivar = async () => {
        Swal.fire({
            title: '¿Reactivar secretaria?',
            text: `La secretaria ${nombre} ${paterno} ${materno} volverá a estar activa.`,
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
                        text: `La secretaria ${nombre} ${paterno} ${materno} ha sido reactivada correctamente.`,
                        timer: 2000,
                        showConfirmButton: false
                    });

                    onSuccess();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Ocurrió un error al intentar reactivar a la secretaria.',
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
        </>
    );
};

export default EliminarSecretaria;