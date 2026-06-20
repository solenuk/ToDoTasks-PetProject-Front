import React, { useState } from 'react';
import './Auth.css';
import {AuthResponse, FieldErrors, LoginRequest, RegisterRequest, User, UserRole} from "../../types";

interface AuthProps {
    onLoginSuccess: (token: string, user: User) => void;
}

function Auth({ onLoginSuccess }: Readonly<AuthProps>) {
    // Toggle
    const [isLogin, setIsLogin] = useState<boolean>(true);

    // Form fields
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName]  = useState<string>('');
    const [email, setEmail]        = useState<string>('');
    const [password, setPassword]  = useState<string>('');
    const [role, setRole]          = useState<UserRole>('USER_ROLE');

    // UI state
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // ----- Inline validation helpers (per field) -----
    const validateField = (field: keyof FieldErrors, value: string): string | undefined => {
        switch (field) {
            case 'firstName':
                if (!value.trim()) return 'First name is required';
                if (value.length > 50) return 'First name cannot exceed 50 characters';
                return undefined;

            case 'lastName':
                if (!value.trim()) return 'Last name is required';
                if (value.length > 50) return 'Last name cannot exceed 50 characters';
                return undefined;

            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Must be a valid email address';
                if (value.length > 100) return 'Email cannot exceed 100 characters';
                return undefined;

            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (value.length > 50) return 'Password cannot exceed 50 characters';
                return undefined;

            default:
                return undefined;
        }
    };

    const clearFieldError = (field: keyof FieldErrors) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleBlur = (field: keyof FieldErrors, value: string) => {
        if (isLogin && (field === 'firstName' || field === 'lastName')) return;
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    // Generic change handler that updates state and clears error
    const handleChange = (
        field: keyof FieldErrors,
        value: string,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(value);
        clearFieldError(field);
    };

    // ----- Role change (dropdown) -----
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value as UserRole);
        clearFieldError('role');
    };

    // ----- Submit: final check + API call -----
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGeneralError(null);

        // Validate ALL fields before sending (defensive)
        const newErrors: FieldErrors = {};
        const fieldsToValidate: (keyof FieldErrors)[] = isLogin
            ? ['email', 'password']
            : ['firstName', 'lastName', 'email', 'password', 'role'];

        for (const field of fieldsToValidate) {
            let value = '';
            if (field === 'firstName') value = firstName;
            else if (field === 'lastName') value = lastName;
            else if (field === 'email') value = email;
            else if (field === 'password') value = password;
            else if (field === 'role') value = role;

            if (field === 'role') {
                if (!role) newErrors.role = 'Role is required';
            } else {
                const err = validateField(field, value);
                if (err) newErrors[field] = err;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const endpoint = isLogin
                ? 'http://localhost:8080/api/auth/login'
                : 'http://localhost:8080/api/auth/register';

            let body: LoginRequest | RegisterRequest;

            if (isLogin) {
                body = { email, password };
            } else {
                body = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email,
                    password,
                    role,
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data: AuthResponse | any = await response.json();

            if (!response.ok) {
                if (response.status === 400 && data.errors) {
                    const backendErrors: FieldErrors = {};
                    data.errors.forEach((err: any) => {
                        const field = err.field as keyof FieldErrors;
                        backendErrors[field] = err.message;
                    });
                    setErrors(backendErrors);
                } else if (response.status === 401) {
                    setGeneralError('Invalid email or password');
                } else {
                    setGeneralError(data.message || 'An error occurred. Please try again.');
                }
                return;
            }

            const authData = data as AuthResponse;
            const { token, user } = authData;
            console.log('Authentication successful:', user);

            onLoginSuccess(token, user);
        } catch (error) {
            console.error('Network error:', error);
            setGeneralError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const renderError = (field: keyof FieldErrors) => {
        const err = errors[field];
        return err ? <div className="field-error">{err}</div> : null;
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>

                <form onSubmit={handleSubmit} noValidate>
                    {/* First Name */}
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="Bob"
                                value={firstName}
                                maxLength={50}
                                onChange={(e) => handleChange('firstName', e.target.value, setFirstName)}
                                onBlur={(e) => handleBlur('firstName', e.target.value)}
                                className={errors.firstName ? 'error-input' : ''}
                            />
                            {renderError('firstName')}
                        </div>
                    )}

                    {/* Last Name */}
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Morse"
                                value={lastName}
                                maxLength={50}
                                onChange={(e) => handleChange('lastName', e.target.value, setLastName)}
                                onBlur={(e) => handleBlur('lastName', e.target.value)}
                                className={errors.lastName ? 'error-input' : ''}
                            />
                            {renderError('lastName')}
                        </div>
                    )}

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="bobmorse@gmail.com"
                            value={email}
                            maxLength={100}
                            onChange={(e) => handleChange('email', e.target.value, setEmail)}
                            onBlur={(e) => handleBlur('email', e.target.value)}
                            className={errors.email ? 'error-input' : ''}
                        />
                        {renderError('email')}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder=""
                            value={password}
                            minLength={8}
                            maxLength={50}
                            onChange={(e) => handleChange('password', e.target.value, setPassword)}
                            onBlur={(e) => handleBlur('password', e.target.value)}
                            className={errors.password ? 'error-input' : ''}
                        />
                        {renderError('password')}
                    </div>

                    {/* Role Dropdown (Register only) */}
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={handleRoleChange}
                                onBlur={() => {
                                    if (!role) setErrors((prev) => ({ ...prev, role: 'Role is required' }));
                                    else clearFieldError('role');
                                }}
                                className={errors.role ? 'error-input' : ''}
                            >
                                <option value="USER_ROLE">User</option>
                                <option value="ADMIN_ROLE">Admin</option>
                            </select>
                            {renderError('role')}
                        </div>
                    )}

                    {generalError && <div className="general-error">{generalError}</div>}

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Register' : ' Login'}
          </span>
                </p>
            </div>
        </div>
    );
}

export default Auth;