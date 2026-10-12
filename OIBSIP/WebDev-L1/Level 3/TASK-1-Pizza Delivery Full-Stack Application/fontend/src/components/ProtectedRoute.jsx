import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function ProtectedRoute({children,adminOnly=false}){const {user,loading}=useAuth();if(loading)return <div className="center">Loading...</div>;if(!user)return <Navigate to={adminOnly?'/admin/login':'/login'} replace/>;if(adminOnly&&user.role!=='admin')return <Navigate to="/dashboard" replace/>;if(!adminOnly&&user.role!=='user')return <Navigate to="/admin/dashboard" replace/>;return children;}
