import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const GestionarCamas = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100">Gestión de Camas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center py-4">
          <h4>Contenido de gestión de camas irá aquí</h4>
          <p className="text-muted">Interfaz para administrar camas del hospital</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary">
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GestionarCamas;