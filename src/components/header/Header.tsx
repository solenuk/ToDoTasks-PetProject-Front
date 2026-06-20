import './Header.css'
import {User} from "../../types";

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

function Header({ user, onLogout }: Readonly<HeaderProps>) {
    return (
        <header className="app-header">
            <div className="header-left">
                <span className="logo">TodoApp</span>
            </div>
            <nav className="header-nav">
                <button className="nav-btn">Home</button>
                <button className="nav-btn">My Todos</button>
                <button className="nav-btn">Edit Profile</button>

                {user.role === 'ADMIN_ROLE' && (
                    <>
                        <button className="nav-btn">All Todos</button>
                        <button className="nav-btn">All Users</button>
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