import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Table, Form, InputGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Paciente = () => {
    const [pacientes, setPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPacientes();
    }, []);

    const fetchPacientes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8080/pacientes/listar', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setPacientes(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Sesión expirada');
                navigate('/login');
            } else {
                toast.error('Error al cargar pacientes');
                console.error('Error:', error);
            }
            setLoading(false);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "NO DADO DE ALTA";
        const date = new Date(fecha);
        return date.toLocaleDateString('es-MX') + ' ' + date.toLocaleTimeString('es-MX');
    };

    const filteredPacientes = pacientes.filter(paciente => {
        const searchText = searchTerm.toLowerCase();
        return (
            paciente.nombre?.toLowerCase().includes(searchText) ||
            paciente.paterno?.toLowerCase().includes(searchText) ||
            paciente.materno?.toLowerCase().includes(searchText) ||
            paciente.telefono?.includes(searchText) ||
            paciente.camaqueocupo?.toLowerCase().includes(searchText)
        );
    });
    return (
        <Layout>
            <div className="container mt-4">
                <div className="text-center mb-4">
                    <h1>Consultar Pacientes</h1>
                </div>

                <div className="mb-3">
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Buscar paciente..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroup.Text>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                    </InputGroup>
                </div>

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Nombre Completo</th>
                                <th>Teléfono</th>
                                <th>Fecha de Ingreso</th>
                                <th>Fecha de Salida</th>
                                <th>Cama Ocupada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPacientes.length > 0 ? (
                                filteredPacientes.map((paciente) => (
                                    <tr key={paciente.id}>
                                        <td>{`${paciente.nombre} ${paciente.paterno} ${paciente.materno}`}</td>
                                        <td>{paciente.telefono}</td>
                                        <td>{formatFecha(paciente.fechaingreso)}</td>
                                        <td>{formatFecha(paciente.fechasalida)}</td>
                                        <td>{paciente.camaqueocupo}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        {pacientes.length === 0 ? 'No hay pacientes registrados' : 'No se encontraron resultados'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </div>
        </Layout>
    );
};

export default Paciente;