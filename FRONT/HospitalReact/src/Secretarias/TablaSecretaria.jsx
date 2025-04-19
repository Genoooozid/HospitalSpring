import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import ModificarSecretaria from './ModificarSecretaria';
import EliminarSecretaria from './EliminarSecretaria';
import ReasignarSecretaria from './ReasignarSecretaria'; 

const TablaSecretarias = ({ refresh, filtroNombre }) => {
    const [secretarias, setSecretarias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSecretaria, setSelectedSecretaria] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refrescar, setRefrescar] = useState(false);
    const [showReasignarModal, setShowReasignarModal] = useState(false); 

    const triggerRefresh = () => setRefrescar(prev => !prev);

    const fetchSecretarias = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/usuarios/persona/secretarias', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSecretarias(response.data);
        } catch (error) {
            console.error('Error al obtener secretarias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSecretarias();
    }, [refresh]);

    const handleModificar = (secretaria) => {
        setSelectedSecretaria(secretaria);
        setShowModal(true);
    };

    const handleReasignar = (secretaria) => {
        setSelectedSecretaria(secretaria);
        setShowReasignarModal(true);
    };

    const handleCloseModal = (updated) => {
        setShowModal(false);
        setSelectedSecretaria(null);
        if (updated) fetchSecretarias();
    };

    const secretariasFiltradas = useMemo(() => {
        if (!filtroNombre.trim()) return secretarias;
        return secretarias.filter(s => {
            const nombreCompleto = `${s.nombre} ${s.paterno} ${s.materno}`.toLowerCase();
            return nombreCompleto.includes(filtroNombre.toLowerCase());
        });
    }, [secretarias, filtroNombre]);

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
        columnHelper.accessor('piso.idPiso', {
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
                const secretaria = row.original;
                const desactivada = !secretaria.estatus;

                return (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleReasignar(secretaria)}
                            disabled={desactivada}
                        >
                            Reasignar
                        </button>

                        <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleModificar(secretaria)}
                            disabled={desactivada}
                        >
                            Modificar
                        </button>

                        <EliminarSecretaria
                            secretaria={secretaria}
                            onSuccess={fetchSecretarias}
                            disabled={desactivada}
                        />
                    </div>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data: secretariasFiltradas,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return <p>Cargando secretarias...</p>;

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

            {showModal && selectedSecretaria && (
                <ModificarSecretaria
                    show={showModal}
                    secretaria={selectedSecretaria}
                    onClose={handleCloseModal}
                    triggerRefresh={triggerRefresh}
                />
            )}

            {showReasignarModal && selectedSecretaria && (
                <ReasignarSecretaria
                    show={showReasignarModal}
                    secretaria={selectedSecretaria}
                    onClose={() => {
                        setShowReasignarModal(false);
                        setSelectedSecretaria(null);
                    }}
                    onSuccess={fetchSecretarias}
                />
            )}
        </div>
    );
};

export default TablaSecretarias;