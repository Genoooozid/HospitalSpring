import React from 'react';
import Sidebar from '../Navegacion/Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2 p-0">
                    <Sidebar />
                </div>
                <div className="col-md-10 p-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;