import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import Layout from '../components/Layout';
import CamaOcupada from '../assets/camaocupada.png';
import CamaDesocupada from '../assets/camadesocupada.png';
import GestionarPisos from '../CamasPisos/Pisos/GestionarPisos';
import GestionarCamas from '../CamasPisos/Camas/GestionarCamas';
import { Modal, Button } from 'react-bootstrap';

const PantallaPrincipal = () => {
  const [pisos, setPisos] = useState([]);
  const [pisoSeleccionado, setPisoSeleccionado] = useState(null);
  const [camas, setCamas] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [loadingPisos, setLoadingPisos] = useState(true);
  const [loadingCamas, setLoadingCamas] = useState(false);
  const [showModalPisos, setShowModalPisos] = useState(false);
  const [showModalCamas, setShowModalCamas] = useState(false);
  const [refreshPisos, setRefreshPisos] = useState(false);
  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '',
    paterno: '',
    materno: '',
    telefono: '',
    camaId: null,
    enfermeraId: null,
  });


  const handleAsignarPaciente = (cama) => {
    const enfermeraId = localStorage.getItem('id'); // o sessionStorage
    if (!enfermeraId) {
      toast.error('No se encontró ID de enfermera en localStorage');
      return;
    }

    setDatosPaciente({
      nombre: '',
      paterno: '',
      materno: '',
      telefono: '',
      camaId: cama.id,
      enfermeraId: enfermeraId
    });
    setShowModalPaciente(true);
  };


  useEffect(() => {
    cargarPisos();
    setRefreshPisos(false);
  }, [refreshPisos]);

  const cargarPisos = async () => {
    try {
      setLoadingPisos(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const response = await axios.get('http://localhost:8080/pisos/listar', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPisos(response.data);
      setLoadingPisos(false);
    } catch (error) {
      setLoadingPisos(false);
      manejarError(error);
    }
  };

  const cargarCamasPorPiso = async (idPiso) => {
    try {
      setLoadingCamas(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      const response = await axios.get(`http://localhost:8080/camas/piso/${idPiso}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const camasTransformadas = response.data.map(cama => ({
        id: cama.idCama,
        nombre: cama.nombre,
        estado: cama.estadoCama === 'Ocupada' ? 'Ocupada' : 'Desocupada',
        paciente: cama.nombrePaciente === 'Sin Paciente' ? '' : cama.nombrePaciente,
        enfermera: cama.nombreEnfermera,
        pacienteId: cama.idPaciente
      }));

      setCamas(camasTransformadas);
      setLoadingCamas(false);
    } catch (error) {
      setLoadingCamas(false);
      manejarError(error);
    }
  };

  const manejarError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error('No autorizado - No tiene permisos para acceder a este recurso');
      } else if (error.response.status === 403) {
        toast.error('No tiene permisos para acceder a este recurso');
      } else {
        toast.error(`Error: ${error.response.data.message || 'Error desconocido'}`);
      }
    } else if (error.request) {
      toast.error('No se recibió respuesta del servidor');
    } else {
      toast.error('Error al configurar la solicitud');
    }
    console.error('Error detallado:', error);
  };

  const seleccionarPiso = (piso) => {
    setPisoSeleccionado(piso);
    setMostrarDropdown(false);
    cargarCamasPorPiso(piso.idPiso);
  };

  const handleDesocuparCama = async (cama) => {
    if (cama.estado === 'Desocupada') {
      toast.info('Esta cama ya está desocupada');
      return;
    }

    const result = await Swal.fire({
      title: `¿Dar de alta al paciente?`,
      html: `Esto liberará la <strong>${cama.nombre}</strong> ocupada por <strong>${cama.paciente}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de alta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        await axios.post(
          'http://localhost:8080/pacientes/desocupar-cama',
          { pacienteId: cama.pacienteId },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        toast.success(`Paciente dado de alta. La ${cama.nombre} ahora está desocupada`);

        if (pisoSeleccionado) {
          await cargarCamasPorPiso(pisoSeleccionado.idPiso);
        }
      } catch (error) {
        manejarError(error);
      }
    }
  };

  const registrarPaciente = async () => {
    const { nombre, paterno, materno, telefono, camaId, enfermeraId } = datosPaciente;
  
    if (!nombre || !paterno || !materno || !telefono) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
  
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  
      await axios.post('http://localhost:8080/pacientes/registrar', {
        nombre,
        paterno,
        materno,
        telefono,
        camaId,
        enfermeraId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      toast.success('Paciente asignado exitosamente');
      setShowModalPaciente(false);
      if (pisoSeleccionado) await cargarCamasPorPiso(pisoSeleccionado.idPiso);
  
    } catch (error) {
      manejarError(error);
    }
  };
  

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={5000} />
      <GestionarPisos
        show={showModalPisos}
        onHide={() => setShowModalPisos(false)}
        onUpdate={() => setRefreshPisos(true)}
      />
      <GestionarCamas show={showModalCamas} onHide={() => setShowModalCamas(false)} />

      <div className="container text-center mt-4">
        <h1>Gestionar Camas y Pisos</h1>
        <div className="d-flex justify-content-between my-3">
          <div className="dropdown">
            <button
              className="btn btn-outline-dark dropdown-toggle"
              type="button"
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              disabled={loadingPisos}
            >
              {loadingPisos ? 'Cargando pisos...' : (pisoSeleccionado ? pisoSeleccionado.nombre : 'Escoger Piso')}
            </button>
            {mostrarDropdown && (
              <div className="dropdown-menu show" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {pisos.length > 0 ? (
                  pisos.map((piso) => (
                    <button
                      key={piso.idPiso}
                      className="dropdown-item"
                      onClick={() => seleccionarPiso(piso)}
                    >
                      {piso.nombre}
                    </button>
                  ))
                ) : (
                  <span className="dropdown-item-text">No hay pisos disponibles</span>
                )}
              </div>
            )}
          </div>
          <div>
            <button className="btn btn-outline-dark mx-2" onClick={() => setShowModalCamas(true)}>Gestionar Camas</button>
            <button className="btn btn-outline-dark" onClick={() => setShowModalPisos(true)}>Gestionar Pisos</button>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}></div>

        {loadingCamas ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando camas del piso...</p>
          </div>
        ) : (
          <div className="row row-cols-5 g-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {camas.length > 0 ? (
              camas.map((cama) => (
                <div
                  key={cama.id}
                  className="col d-flex justify-content-center"
                  style={{
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={(e) => {
                    if (e.target.tagName !== 'BUTTON') {
                      handleDesocuparCama(cama);
                    }
                  }}

                >
                  <div className="card p-3 text-center" style={{ width: '250px' }}>
                    <img
                      src={cama.estado === 'Ocupada' ? CamaOcupada : CamaDesocupada}
                      alt="Cama"
                      className="img-fluid"
                    />
                    <p className="fw-bold">{cama.nombre}</p>
                    <p className="fw-bold mt-2">
                      {cama.estado === 'Ocupada' ? `Ocupada por ${cama.paciente}` : 'Disponible'}
                    </p>
                    <p className="text-muted">Enf. {cama.enfermera}</p>
                    {cama.estado === 'Desocupada' && (
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => handleAsignarPaciente(cama)}
                      >
                        Asignar Paciente
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center my-5">
                <p>{pisoSeleccionado ? 'No hay camas en este piso' : 'Seleccione un piso para ver las camas'}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Modal show={showModalPaciente} onHide={() => setShowModalPaciente(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <input className="form-control my-2" placeholder="Nombre" value={datosPaciente.nombre} onChange={(e) => setDatosPaciente({ ...datosPaciente, nombre: e.target.value })} required />
            <input className="form-control my-2" placeholder="Apellido Paterno" value={datosPaciente.paterno} onChange={(e) => setDatosPaciente({ ...datosPaciente, paterno: e.target.value })} required />
            <input className="form-control my-2" placeholder="Apellido Materno" value={datosPaciente.materno} onChange={(e) => setDatosPaciente({ ...datosPaciente, materno: e.target.value })} required />
            <input className="form-control my-2" placeholder="Teléfono" value={datosPaciente.telefono} onChange={(e) => setDatosPaciente({ ...datosPaciente, telefono: e.target.value })} required />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalPaciente(false)}>Cancelar</Button>
          <Button variant="primary" onClick={registrarPaciente}>Registrar</Button>
        </Modal.Footer>
      </Modal>

    </Layout>
  );
};

export default PantallaPrincipal;
