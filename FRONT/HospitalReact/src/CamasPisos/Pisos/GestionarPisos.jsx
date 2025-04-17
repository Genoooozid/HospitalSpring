import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, InputGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaTrash, FaPlus } from 'react-icons/fa';

const GestionarPisos = ({ show, onHide, onUpdate }) => {
  const [pisos, setPisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [cantidadPisos, setCantidadPisos] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (show) {
      cargarPisos();
    }
  }, [show]);

  const cargarPisos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:8080/pisos/listar', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPisos(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      manejarError(error);
    }
  };

  const manejarError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error('No autorizado - Por favor inicie sesión nuevamente');
      } else if (error.response.status === 403) {
        toast.error('No tiene permisos para esta acción');
      } else {
        toast.error(`Error: ${error.response.data.message || 'Error al procesar la solicitud'}`);
      }
    } else {
      toast.error('Error de conexión con el servidor');
    }
  };

  const handleEliminarPiso = async (idPiso, nombrePiso) => {
    try {
      // Primera confirmación
      const confirmResult = await Swal.fire({
        title: `¿Eliminar piso ${nombrePiso}?`,
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmResult.isConfirmed) return;

      // Verificación previa para mostrar mensajes específicos
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      // Hacer la petición de eliminación
      const response = await axios.delete(`http://localhost:8080/pisos/${idPiso}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Si llega aquí, la eliminación fue exitosa
      const mensajeBackend = response.data; // El mensaje que retorna el backend
      
      // Mostrar alerta con los detalles de la operación
      await Swal.fire({
        title: 'Operación completada',
        html: `<p>${mensajeBackend}</p>`,
        icon: 'success',
        confirmButtonText: 'Entendido'
      });

      // Actualizar la lista
      cargarPisos();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      // Manejo específico de errores según el backend
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400 || status === 404) {
          // Errores de validación o no encontrado
          Swal.fire({
            title: 'Error',
            text: data.message || `No se pudo eliminar el piso ${nombrePiso}`,
            icon: 'error'
          });
        } else if (status === 409) {
          // Conflictos (camas asociadas o asignadas)
          Swal.fire({
            title: 'No se puede eliminar',
            html: `
              <p>${data.message}</p>
              <p class="text-muted small">Debe eliminar o reubicar las camas primero</p>
            `,
            icon: 'warning'
          });
        } else {
          // Otros errores
          toast.error(`Error: ${data.message || 'Error al procesar la solicitud'}`);
        }
      } else {
        toast.error('Error de conexión con el servidor');
      }
    }
  };

  const handleAgregarPisos = async () => {
    if (cantidadPisos <= 0) {
      toast.error('La cantidad de pisos debe ser mayor a 0');
      return;
    }

    const ultimoPiso = pisos.length > 0 
      ? pisos[pisos.length - 1].nombre 
      : "No hay pisos registrados";

    const result = await Swal.fire({
      title: `¿Registrar ${cantidadPisos} nuevo(s) piso(s)?`,
      html: `Actualmente el último piso es: <strong>${ultimoPiso}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setIsAdding(true);
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        await axios.post('http://localhost:8080/pisos/insertar', 
          { cantidadPisos: cantidadPisos },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        toast.success(`${cantidadPisos} piso(s) agregado(s) correctamente`);
        setShowAddForm(false);
        setCantidadPisos(1);
        cargarPisos();
        if (onUpdate) onUpdate();
      } catch (error) {
        manejarError(error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">Gestión de Pisos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col>
            {!showAddForm ? (
              <Button 
                variant="primary" 
                onClick={() => setShowAddForm(true)}
                disabled={isAdding}
              >
                <FaPlus className="me-2" />
                Agregar Pisos
              </Button>
            ) : (
              <InputGroup>
                <Form.Control
                  type="number"
                  min="1"
                  value={cantidadPisos}
                  onChange={(e) => setCantidadPisos(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="Cantidad de pisos"
                />
                <Button 
                  variant="success" 
                  onClick={handleAgregarPisos}
                  disabled={isAdding}
                >
                  {isAdding ? 'Registrando...' : 'Registrar'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowAddForm(false);
                    setCantidadPisos(1);
                  }}
                  disabled={isAdding}
                >
                  Cancelar
                </Button>
              </InputGroup>
            )}
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando lista de pisos...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th className="text-center">Piso</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pisos.length > 0 ? (
                pisos.map((piso) => (
                  <tr key={piso.idPiso}>
                    <td className="align-middle text-center">{piso.nombre}</td>
                    <td className="align-middle text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminarPiso(piso.idPiso, piso.nombre)}
                        title="Eliminar piso"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted py-3">
                    No hay pisos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GestionarPisos;