import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const EliminarEnfermera = ({ id, estatus, onSuccess }) => {
    const token = sessionStorage.getItem('token');

    const handleEliminar = async () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'La enfermera será desactivada (eliminación lógica).',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8080/api/usuarios/persona/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'La enfermera ha sido desactivada correctamente',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    onSuccess();
                } catch (error) {
                    console.error('Error al eliminar enfermera:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Ocurrió un error al intentar eliminar a la enfermera.',
                    });
                }
            }
        });
    };

    const handleReactivar = async () => {
        Swal.fire({
            title: '¿Reactivar enfermera?',
            text: 'La enfermera volverá a estar activa.',
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
                        text: 'La enfermera ha sido reactivada correctamente',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    onSuccess();
                } catch (error) {
                    console.error('Error al reactivar enfermera:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Ocurrió un error al intentar reactivar a la enfermera.',
                    });
                }
            }
        });
    };

    return estatus ? (
        <button className="btn btn-sm btn-danger" onClick={handleEliminar}>
            Desactivar
        </button>
    ) : (
        <button className="btn btn-sm btn-success" onClick={handleReactivar}>
            Reactivar
        </button>
    );
};

export default EliminarEnfermera;
