import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Dropdown, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const GestionarCamas = ({ show, onHide }) => {
  const [pisos, setPisos] = useState([]);
  const [camas, setCamas] = useState([]);
  const [camasFiltradas, setCamasFiltradas] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [enfermeras, setEnfermeras] = useState([]);
  const [enfermeraSeleccionada, setEnfermeraSeleccionada] = useState(null);

  useEffect(() => {
    if (show) {
      obtenerPisos();
    }
  }, [show]);

  const obtenerPisos = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/pisos/listar', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPisos(response.data);
    } catch (error) {
      toast.error('Error al cargar los pisos');
    }
  };

  const cargarCamasDelPiso = async (idPiso) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/camas/piso/${idPiso}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setCamas(data);
      setCamasFiltradas(data);
      setEnfermeraSeleccionada(null);
      const enfermerasUnicas = [...new Set(data.map((c) => c.nombreEnfermera))];
      setEnfermeras(enfermerasUnicas);
    } catch (error) {
      toast.error('Error al cargar las camas del piso');
    }
  };

  const handleSeleccionarPiso = (piso) => {
    setPisoSeleccionado(piso);
    cargarCamasDelPiso(piso.idPiso);
  };

  const handleFiltrarPorEnfermera = (nombre) => {
    setEnfermeraSeleccionada(nombre);
    const filtradas = camas.filter((cama) => cama.nombreEnfermera === nombre);
    setCamasFiltradas(filtradas);
  };

  const limpiarFiltroEnfermera = () => {
    setEnfermeraSeleccionada(null);
    setCamasFiltradas(camas);
  };

  const handleEliminarCama = (idCama) => {
    toast.info(`Eliminar cama con ID ${idCama} (por implementar)`);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">Gestión de Camas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
          {/* Escoger Piso */}
          <Dropdown as={ButtonGroup}>
            <Button variant="outline-primary">
              {pisoSeleccionado ? pisoSeleccionado.nombre : 'Escoger Piso'}
            </Button>
            <Dropdown.Toggle split variant="outline-primary" />
            <Dropdown.Menu>
              {pisos.map((p) => (
                <Dropdown.Item key={p.idPiso} onClick={() => handleSeleccionarPiso(p)}>
                  {p.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Filtrar por Enfermera */}
          {pisoSeleccionado && enfermeras.length > 0 && (
            <Dropdown as={ButtonGroup}>
              <Button variant="outline-success">
                {enfermeraSeleccionada || 'Filtrar por enfermera'}
              </Button>
              <Dropdown.Toggle split variant="outline-success" />
              <Dropdown.Menu>
                {enfermeras.map((enf, idx) => (
                  <Dropdown.Item key={idx} onClick={() => handleFiltrarPorEnfermera(enf)}>
                    {enf}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item onClick={limpiarFiltroEnfermera}>Mostrar todas</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* Tabla */}
        {pisoSeleccionado ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr className="text-center">
                <th>Cama</th>
                <th>Asignada para</th>
                <th>Ocupada por</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {camasFiltradas.length > 0 ? (
                camasFiltradas.map((cama) => (
                  <tr key={cama.idCama} className="text-center align-middle">
                    <td>{cama.nombre}</td>
                    <td>{cama.nombreEnfermera}</td>
                    <td>{cama.nombrePaciente}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminarCama(cama.idCama)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No hay camas registradas con este filtro
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted text-center">Seleccione un piso para ver sus camas</p>
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

export default GestionarCamas;
