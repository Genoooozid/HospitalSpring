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
import ReasignarEnfermera from './ReasignarEnfermera'

const TablaEnfermeras = ({ refresh }) => {
    const [enfermeras, setEnfermeras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnfermera, setSelectedEnfermera] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refrescar, setRefrescar] = useState(false);
    const [showReasignarModal, setShowReasignarModal] = useState(false);

    const triggerRefresh = () => setRefrescar(prev => !prev);

    const fetchEnfermeras = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/usuarios/persona/enfermeras', {
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

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
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
            cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-warning d-flex align-items-center gap-1"
                        onClick={() => handleModificar(row.original)}
                        title="Modificar enfermera"
                    >
                        Modificar
                    </button>
                    <EliminarEnfermera id={row.original.id} estatus={row.original.estatus} onSuccess={fetchEnfermeras} />
                    <button
                        className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                        onClick={() => handleReasignar(row.original)}
                        title="Reasignar"
                    >
                        Reasignar
                    </button>
                </div>
            ),
        }),
    ], []);


    const table = useReactTable({
        data: enfermeras,
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

        </div>
    );
};

export default TablaEnfermeras;
