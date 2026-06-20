import {useEffect, useState} from 'react';
import Auth from './components/auth/Auth';
import Header from "./components/header/Header";
import Home from "./components/home/Home";
import './App.css';
import {User} from "./types";

function App() {
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
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="app">
            <Header user={user!} onLogout={handleLogout} />
            <main>
                <Home />
            </main>
        </div>
    );
}

export default App;