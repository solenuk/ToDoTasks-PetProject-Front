import React, { useState } from 'react';
import { User, UpdateUserDTO, UserRole } from '../../types';
import './EditUserModal.css';

interface EditUserModalProps {
    user: User;
    token: string;
    onClose: () => void;
    onUserUpdated: (updatedUser: User) => void;
}

function EditUserModal({ user, token, onClose, onUserUpdated }: Readonly<EditUserModalProps>) {
    const [role, setRole] = useState<UserRole>(user.role);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload: UpdateUserDTO = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: role,
        };

        try {
            const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update user');
            }

            const updatedUser: User = await response.json();
            onUserUpdated(updatedUser);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content edit" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>Edit User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            value={user.firstName}
                            maxLength={50}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            value={user.lastName}
                            maxLength={50}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={user.email}
                            maxLength={100}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                        >
                            <option value="USER_ROLE">User</option>
                            <option value="ADMIN_ROLE">Admin</option>
                        </select>
                    </div>
                    {error && <div className="error-text">{error}</div>}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUserModal;