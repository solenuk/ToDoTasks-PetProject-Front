import './Header.css';
import {NavLink} from 'react-router-dom';
import {User} from "../../types";

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

function Header({user, onLogout}: Readonly<HeaderProps>) {
    return (
        <header className="app-header">
            <div className="header-left">
                <span className="logo">TodoApp</span>
            </div>
            <nav className="header-nav">
                <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                    Home
                </NavLink>
                <NavLink to="/tasks" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Todos
                </NavLink>
                <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                    Edit Profile
                </NavLink>

                {user.role === 'ADMIN_ROLE' && (
                    <>
                        <NavLink to="/admin/todos" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                            All Todos
                        </NavLink>
                        <NavLink to="/admin/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                            All Users
                        </NavLink>
                    </>
                )}
            </nav>
            <div className="header-right">
                <span className="user-info">{user.email}</span>
                <button className="logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;