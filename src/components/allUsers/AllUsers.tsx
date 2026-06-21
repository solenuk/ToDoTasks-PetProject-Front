import { useState, useEffect } from 'react';
import { User, PaginatedResponseDTO } from '../../types';
import EditUserModal from '../editUser/EditUserModal';
import './AllUsers.css';

interface AllUsersProps {
    token: string;
    currentUser: User;
}

function AllUsers({ token, currentUser }: Readonly<AllUsersProps>) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async (page: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:8080/api/users?page=${page}&size=${pagination.pageSize}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error('Failed to fetch users');
            const data: PaginatedResponseDTO<User> = await response.json();
            setUsers(data.content);
            setPagination({
                pageNo: data.pageNo,
                pageSize: data.pageSize,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
                last: data.last,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(0);
    }, []);

    // Delete handler
    const handleDelete = async (userId: number) => {
        if (userId === currentUser.id) {
            alert('You cannot delete your own account.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete user');
            // Remove from list
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Could not delete user');
        }
    };

    const handleUserUpdated = (updatedUser: User) => {
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    };

    const handlePrev = () => {
        if (pagination.pageNo > 0) fetchUsers(pagination.pageNo - 1);
    };

    const handleNext = () => {
        if (!pagination.last) fetchUsers(pagination.pageNo + 1);
    };

    if (loading) return <div className="users-loading">Loading users...</div>;
    if (error) return <div className="users-error">Error: {error}</div>;

    return (
        <div className="users-container">
            <div className="users-header">
                <h2>All Users</h2>
            </div>

            {users.length === 0 ? (
                <div className="empty-state">No users found.</div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                            <tr>
                                <th>No.</th>
                                <th>Full name</th>
                                <th>E-mail</th>
                                <th>Operations</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u, idx) => (
                                <tr key={u.id}>
                                    <td>{pagination.pageNo * pagination.pageSize + idx + 1}</td>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => setEditingUser(u)}>Edit</button>
                                            <button onClick={() => handleDelete(u.id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-bar">
                        <button onClick={handlePrev} disabled={pagination.pageNo === 0} className="page-btn">Prev</button>
                        <span className="page-info">Page {pagination.pageNo + 1} of {pagination.totalPages}</span>
                        <button onClick={handleNext} disabled={pagination.last} className="page-btn">Next</button>
                    </div>
                </>
            )}

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    token={token}
                    onClose={() => setEditingUser(null)}
                    onUserUpdated={handleUserUpdated}
                />
            )}
        </div>
    );
}

export default AllUsers;