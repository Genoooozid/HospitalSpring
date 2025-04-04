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
import { FiEdit } from 'react-icons/fi';

const TablaEnfermeras = ({ refresh }) => {
    const [enfermeras, setEnfermeras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnfermera, setSelectedEnfermera] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refrescar, setRefrescar] = useState(false);

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

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('nombre', {
            header: 'Nombre',
        }),
        columnHelper.accessor('paterno', {
            header: 'Apellido Paterno',
        }),
        columnHelper.accessor('materno', {
            header: 'Apellido Materno',
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
                        <FiEdit /> Modificar
                    </button>
                    <EliminarEnfermera id={row.original.id} estatus={row.original.estatus} onSuccess={fetchEnfermeras} />
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
        </div>
    );
};

export default TablaEnfermeras;
