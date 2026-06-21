import React, {useEffect, useState} from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import Auth from './components/auth/Auth';
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import './App.css';
import {User} from "./types";
import Tasks from "./components/userTasks/Tasks";
import Profile from "./components/profile/Profile";
import AllUsers from "./components/allUsers/AllUsers";
import AllTasks from "./components/allTasks/AllTasks";

function App() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        fetch('http://localhost:8080/api/users/me', {
            headers: {
                Authorization: `Bearer ${storedToken}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Invalid token');
                return res.json();
            })
            .then((userData: User) => {
                setToken(storedToken);
                setUser(userData);
                setIsAuthenticated(true);
                setIsLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('token');
                setIsLoading(false);
            });
    }, []);

    const handleLoginSuccess = (jwtToken: string, userData: User) => {
        setToken(jwtToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', jwtToken);
        navigate('/');
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        navigate('/');
    };
    const handleUserUpdated = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const ProtectedAdminRoute = ({children}: { children: React.ReactNode }) => {
        if (user?.role !== 'ADMIN_ROLE') {
            return <Navigate to="/" replace/>;
        }
        return <>{children}</>;
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Auth onLoginSuccess={handleLoginSuccess}/>;
    }

    return (
            <div className="app">
                <Header user={user!} onLogout={handleLogout}/>
                <main>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/tasks" element={<Tasks token={token!} user={user!}/>}/>
                        <Route path="/profile"
                               element={<Profile user={user!} token={token!} onUserUpdated={handleUserUpdated}/>}/>
                        {/* Admin-only routes – we'll protect them later, but for now just render */}
                        <Route path="/admin/todos" element={<AllTasks/>}/>
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedAdminRoute>
                                    <AllUsers token={token!} currentUser={user!}/>
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </main>
            </div>
    );
}

export default App;