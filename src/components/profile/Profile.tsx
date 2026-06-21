import React, { useState } from 'react';
import { User, UpdateUserDTO } from '../../types';
import './Profile.css';

interface ProfileProps {
    user: User;
    token: string;
    onUserUpdated: (updatedUser: User) => void;
}

function Profile({ user, token, onUserUpdated }: Readonly<ProfileProps>) {
    const [firstName, setFirstName] = useState<string>(user.firstName);
    const [lastName, setLastName] = useState<string>(user.lastName);
    const [email, setEmail] = useState<string>(user.email);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form validation
    const validateFields = (): string | null => {
        if (!firstName.trim()) return 'First name is required';
        if (firstName.length > 50) return 'First name cannot exceed 50 characters';
        if (!lastName.trim()) return 'Last name is required';
        if (lastName.length > 50) return 'Last name cannot exceed 50 characters';
        if (!email.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Must be a valid email address';
        if (email.length > 100) return 'Email cannot exceed 100 characters';
        return null;
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const validationError = validateFields();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload: UpdateUserDTO = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            role: user.role
        };

        setLoading(true);

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
                throw new Error(errData.message || 'Failed to update profile');
            }

            const updatedUser: User = await response.json();
            onUserUpdated(updatedUser);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Edit Profile</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role (read-only)</label>
                        <input
                            id="role"
                            type="text"
                            value={user.role === "USER_ROLE" ? "User" : "Admin"}
                            disabled
                            className="readonly-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;