import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Dropdown, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const GestionarCamas = ({ show, onHide }) => {
  const [pisos, setPisos] = useState([]);
  const [camas, setCamas] = useState([]);
  const [camasFiltradas, setCamasFiltradas] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [enfermeras, setEnfermeras] = useState([]);
  const [enfermeraSeleccionada, setEnfermeraSeleccionada] = useState(null);
  const [mostrarFormularioAgregar, setMostrarFormularioAgregar] = useState(false);
  const [cantidadCamas, setCantidadCamas] = useState('');
  const [rol, setRol] = useState('');
  const [pisoDeSecretaria, setPisoDeSecretaria] = useState(null);




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



  const handleAgregarCamas = async () => {
    const cantidadValida = /^\d+$/.test(cantidadCamas) && parseInt(cantidadCamas) > 0;

    if (!cantidadValida) {
      toast.warning('Ingrese una cantidad válida de camas (número entero mayor a 0)');
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.post('http://localhost:8080/camas/insertar', {
        idPiso: pisoSeleccionado.idPiso,
        cantidadCamas: parseInt(cantidadCamas),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      toast.success('Camas agregadas correctamente');

      setMostrarFormularioAgregar(false);
      setCantidadCamas('');
      cargarCamasDelPiso(pisoSeleccionado.idPiso);
    } catch (error) {
      toast.error('Error al agregar camas');
    }
  };


  useEffect(() => {
    if (show) {
      const rolGuardado = localStorage.getItem('rol');
      const idUsuario = localStorage.getItem('id');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      setRol(rolGuardado);

      if (rolGuardado === 'secretaria' && idUsuario) {
        axios.get(`http://localhost:8080/api/usuarios/persona/secretarias/${idUsuario}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            const piso = response.data.piso;
            setPisoSeleccionado(piso);
            setPisoDeSecretaria(piso);
            cargarCamasDelPiso(piso.idPiso);
          })
          .catch(() => toast.error('Error al obtener el piso de la secretaria'));
      } else {
        obtenerPisos(); // Sólo si NO es secretaria
      }
    }
  }, [show]);

  const handleEliminarCama = async (idCama) => {
    const cama = camas.find((c) => c.idCama === idCama);

    if (!cama) {
      toast.error('Cama no encontrada');
      return;
    }

    if (cama.nombrePaciente && cama.nombrePaciente.trim().toLowerCase() !== "sin paciente") {
      toast.warning('No se puede eliminar una cama ocupada por un paciente');
      return;
    }

    if (cama.nombreEnfermera && cama.nombreEnfermera.trim().toLowerCase() !== "sin enfermera") {
      toast.warning('No se puede eliminar una cama asignada a una enfermera');
      return;
    }

    const camasDelPiso = camas.filter(c => c.idPiso === cama.idPiso);
    const nombresOrdenados = camasDelPiso
      .map(c => ({ ...c, num: parseInt(c.nombre.split('-')[1]) }))
      .sort((a, b) => a.num - b.num);

    if (nombresOrdenados.length > 1) {
      const index = nombresOrdenados.findIndex(c => c.idCama === idCama);
      const esPrimera = index === 0;
      const esUltima = index === nombresOrdenados.length - 1;

      if (!esPrimera && !esUltima) {
        toast.info('No se puede eliminar una cama intermedia. Solo se permite eliminar la última.');
        return;
      }
    }

    // 🔥 Confirmación con SweetAlert fuera del try
    const confirmacion = await Swal.fire({
      title: `¿Eliminar ${cama.nombre}?`,
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/camas/eliminar/${idCama}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await Swal.fire({
        icon: 'success',
        title: 'Cama eliminada exitosamente',
        showConfirmButton: false,
        timer: 1500
      });

      cargarCamasDelPiso(pisoSeleccionado.idPiso);
    } catch (error) {
      toast.error('Error al eliminar la cama');
      console.error(error); // Por si necesitas revisar en consola
    }
  };


  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">Gestión de Camas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between mb-3 gap-2 flex-wrap">
          {/* Escoger Piso */}
          {rol === 'secretaria' && pisoDeSecretaria ? (
            <Button variant="outline-primary" disabled>
              {pisoDeSecretaria.nombre}
            </Button>
          ) : (
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
          )}



          {/* Botón Agregar Camas */}
          {pisoSeleccionado && (
            <Button
              variant="outline-warning"
              onClick={() => setMostrarFormularioAgregar(!mostrarFormularioAgregar)}
            >
              Agregar Camas
            </Button>
          )}

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

        {mostrarFormularioAgregar && (
          <div className="mb-3 d-flex flex-column flex-sm-row align-items-start gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Cantidad de camas"
              value={cantidadCamas}
              onChange={(e) => setCantidadCamas(e.target.value)}
            />
            <Button variant="success" onClick={handleAgregarCamas}>
              Confirmar
            </Button>
          </div>
        )}

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
                        disabled={rol !== 'admin'}
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
