import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    getPaginationRowModel,
} from "@tanstack/react-table";

const Bitacora = () => {
    const url = "http://localhost:8080/bitacora/lista/";
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");

    const getLista = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = response.data?.data?.body?.data || response.data?.data || response.data;
            if (Array.isArray(data)) {
                setLista(data.reverse());
            }
        } catch (error) {
            console.error("Error al obtener datos:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getLista();
    }, []);

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor("fechamovimiento", {
            header: "Fecha",
            cell: ({ getValue }) => {
                const value = getValue();
                return value ? new Date(value).toLocaleString() : "N/A";
            },
        }),
        columnHelper.accessor("movimiento", {
            header: "Método HTTP",
            cell: ({ getValue }) => getValue() || "N/A",
        }),
        columnHelper.accessor("metodo", {
            header: "Descripción del movimiento",
            cell: ({ getValue }) => getValue() || "N/A",
        }),
        columnHelper.accessor("nombreUsuario", {
            header: "Usuario",
            cell: ({ getValue }) => getValue() || "N/A",
        }),
    ], []);

    const listaFiltrada = useMemo(() => {
        const texto = filtro.toLowerCase();
        return lista.filter(item =>
            item.movimiento?.toLowerCase().includes(texto) ||
            item.metodo?.toLowerCase().includes(texto) ||
            item.nombreUsuario?.toLowerCase().includes(texto)
        );
    }, [lista, filtro]);

    const table = useReactTable({
        data: listaFiltrada,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 8,
            },
        },
    });

    return (
        <Layout>
            <div className="container-fluid mt-4">
                <div className="mb-4">
                    <h2 className="text-center">Historial de Movimientos - Bitácora</h2>
                </div>

                <div className="mb-3 d-flex justify-content-end">
                    <input
                        type="text"
                        className="form-control w-50"
                        placeholder="Buscar por método, movimiento o usuario..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="text-center">Cargando datos...</p>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
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
                                    {table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map(row => (
                                            <tr key={row.id}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={columns.length} className="text-center">
                                                No hay movimientos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="d-flex justify-content-center mt-3">
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="btn btn-secondary"
                            >
                                Anterior
                            </button>
                            <span className="mx-2">
                                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="btn btn-secondary"
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Bitacora;
