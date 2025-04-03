import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from '../Login/Login';
import PantallaPrincipal from '../CamasPisos/PantallaPrincipal';
import PrivateRoute from './PrivateRoute'; 
import Enfermeras from '../Enfermeras/Enfermeras';
import Pacientes from '../Pacientes/Paciente'
import Secretarias from '../Secretarias/Secretarias'

function AppRouter() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LoginRoute />} />
        <Route path="/camaspisos" element={<PrivateRoute><PantallaPrincipal /></PrivateRoute>}/>
        <Route path="/enfermeras" element={<PrivateRoute><Enfermeras /></PrivateRoute>}/>
        <Route path="/pacientes" element={<PrivateRoute><Pacientes /></PrivateRoute>}/>
        <Route path="/secretarias" element={<PrivateRoute><Secretarias /></PrivateRoute>}/>
         {/* Aquí puedes añadir mas rutas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

const LoginRoute = () => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  return token ? <Navigate to="/camaspisos" replace /> : <Login />;
};

export default AppRouter;
