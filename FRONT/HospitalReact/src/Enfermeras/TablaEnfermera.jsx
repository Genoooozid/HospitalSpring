import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import EliminarEnfermera from './EliminarEnfermera';
import ModificarEnfermera from './ModificarEnfermera';
import ReasignarEnfermera from './ReasignarEnfermera';
import AsignarCamasAEnfermera from './AsignarCamasAEnfermera';

const TablaEnfermeras = ({ refresh, filtroNombre }) => {
    const [enfermeras, setEnfermeras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnfermera, setSelectedEnfermera] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refrescar, setRefrescar] = useState(false);
    const [showReasignarModal, setShowReasignarModal] = useState(false);
    const [showAsignarModal, setShowAsignarModal] = useState(false);

    const rol = sessionStorage.getItem('rol');

    const triggerRefresh = () => setRefrescar(prev => !prev);

    const fetchEnfermeras = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const rol = sessionStorage.getItem('rol');
            const idUsuario = sessionStorage.getItem('id');

            let url = 'http://localhost:8080/api/usuarios/persona/enfermeras';

            if (rol === 'secretaria') {
                const secretariaResponse = await axios.get(`http://localhost:8080/api/usuarios/persona/secretarias/${idUsuario}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const pisoId = secretariaResponse.data.piso?.idPiso;
                if (pisoId) {
                    url = `http://localhost:8080/api/usuarios/persona/enfermeras/piso/${pisoId}`;
                }
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setEnfermeras(response.data);
        } catch (error) {
            console.error('Error al obtener enfermeras:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchEnfermeras();
    }, [refresh]);

    const handleModificar = (enfermera) => {
        setSelectedEnfermera(enfermera);
        setShowModal(true);
    };

    const handleCloseModal = (updated) => {
        setShowModal(false);
        setSelectedEnfermera(null);
        if (updated) fetchEnfermeras();
    };

    const handleReasignar = (enfermera) => {
        setSelectedEnfermera(enfermera);
        setShowReasignarModal(true);
    };

    const handleAsignar = (enfermera) => {
        setSelectedEnfermera(enfermera);
        setShowAsignarModal(true);
    };

    const enfermerasFiltradas = useMemo(() => {
        if (!filtroNombre.trim()) return enfermeras;
        return enfermeras.filter(e => {
            const nombreCompleto = `${e.nombre} ${e.paterno} ${e.materno}`.toLowerCase();
            return nombreCompleto.includes(filtroNombre.toLowerCase());
        });
    }, [enfermeras, filtroNombre]);

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'nombreCompleto',
            header: 'Nombre Completo',
            cell: ({ row }) => {
                const { nombre, paterno, materno } = row.original;
                return `${nombre} ${paterno} ${materno}`;
            },
        }),
        columnHelper.accessor('username', {
            header: 'Usuario',
        }),
        columnHelper.accessor('piso.nombre', {
            header: 'Piso',
        }),
        columnHelper.accessor('estatus', {
            header: 'Activo',
            cell: info => (info.getValue() ? 'Sí' : 'No'),
        }),
        columnHelper.accessor('telefono', {
            header: 'Teléfono',
        }),
        columnHelper.display({
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => {
                const enfermera = row.original;
                const desactivada = !enfermera.estatus;

                return (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            onClick={() => handleReasignar(enfermera)}
                            title="Reasignar"
                            disabled={desactivada}
                        >
                            Reasignar
                        </button>

                        <button
                            className="btn btn-sm btn-info d-flex align-items-center gap-1"
                            onClick={() => handleAsignar(enfermera)}
                            title="Asignar camas"
                            disabled={desactivada || rol === 'admin'}
                        >
                            Asignar Cama
                        </button>

                        <button
                            className="btn btn-sm btn-warning d-flex align-items-center gap-1"
                            onClick={() => handleModificar(enfermera)}
                            title="Modificar enfermera"
                            disabled={desactivada}
                        >
                            Modificar
                        </button>

                        <EliminarEnfermera
                            enfermera={enfermera}
                            onSuccess={fetchEnfermeras}
                            disabled={desactivada}
                        />
                    </div>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data: enfermerasFiltradas,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return <p>Cargando enfermeras...</p>;

    return (
        <div className="mt-4 table-responsive">
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && selectedEnfermera && (
                <ModificarEnfermera
                    show={showModal}
                    enfermera={selectedEnfermera}
                    onClose={handleCloseModal}
                    triggerRefresh={triggerRefresh}
                />
            )}

            {showReasignarModal && selectedEnfermera && (
                <ReasignarEnfermera
                    show={showReasignarModal}
                    onClose={() => setShowReasignarModal(false)}
                    enfermera={selectedEnfermera}
                    onSuccess={fetchEnfermeras}
                />
            )}

            {showAsignarModal && selectedEnfermera && (

                <AsignarCamasAEnfermera
                    show={showAsignarModal}
                    enfermera={selectedEnfermera}
                    onClose={() => setShowAsignarModal(false)}
                    onSuccess={fetchEnfermeras}
                />

            )}

        </div>
    );
};

export default TablaEnfermeras;
