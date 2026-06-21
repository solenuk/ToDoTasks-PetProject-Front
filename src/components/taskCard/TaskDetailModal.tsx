import { useState, useEffect } from 'react';
import {PaginatedResponseDTO, ResponseTaskDTO, User} from '../../types';
import './TaskDetailModal.css';

interface TaskDetailModalProps {
    task: ResponseTaskDTO;
    token: string;
    currentUserId: number;
    onClose: () => void;
}

function TaskDetailModal({ task, token, currentUserId, onClose }: TaskDetailModalProps) {
    const [collaborators, setCollaborators] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [adding, setAdding] = useState<boolean>(false);
    const [removing, setRemoving] = useState<number | null>(null);

    const isCreator = task.creatorId === currentUserId;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all users (paginated)
                let page = 0;
                const size = 50;
                let allUsersData: User[] = [];
                let totalPages = 1;
                do {
                    const res = await fetch(
                        `http://localhost:8080/api/users?page=${page}&size=${size}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (!res.ok) throw new Error('Failed to fetch users');
                    const data: PaginatedResponseDTO<User> = await res.json();
                    allUsersData = [...allUsersData, ...data.content];
                    totalPages = data.totalPages;
                    page++;
                } while (page < totalPages);
                setAllUsers(allUsersData);

                // 2. Fetch collaborators details
                if (task.collaboratorIds && task.collaboratorIds.length > 0) {
                    const promises = task.collaboratorIds.map((id) =>
                        fetch(`http://localhost:8080/api/users/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        }).then((res) => {
                            if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
                            return res.json();
                        })
                    );
                    const collabs = await Promise.all(promises);
                    setCollaborators(collabs);
                } else {
                    setCollaborators([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [task, token]);

    const availableUsers = allUsers.filter(
        (u) => u.id !== task.creatorId && !collaborators.some((c) => c.id === u.id)
    );
    const hasAvailableUsers = availableUsers.length > 0;

    const handleAdd = async () => {
        if (!selectedUserId || !isCreator) return;
        setAdding(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/tasks/${task.id}/collaborators/${selectedUserId}`,
                { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error('Failed to add collaborator');

            const addedUser = allUsers.find((u) => u.id === selectedUserId);
            if (addedUser) {
                setCollaborators((prev) => [...prev, addedUser]);
                task.collaboratorIds = [...task.collaboratorIds, selectedUserId];
            }
            setSelectedUserId('');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Could not add collaborator');
        } finally {
            setAdding(false);
        }
    };

    // Remove collaborator (only if creator)
    const handleRemove = async (userId: number) => {
        if (!isCreator) return;
        if (!window.confirm('Remove this collaborator?')) return;
        setRemoving(userId);
        try {
            const response = await fetch(
                `http://localhost:8080/api/tasks/${task.id}/collaborators/${userId}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error('Failed to remove collaborator');

            setCollaborators((prev) => prev.filter((c) => c.id !== userId));
            task.collaboratorIds = task.collaboratorIds.filter((id) => id !== userId);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Could not remove collaborator');
        } finally {
            setRemoving(null);
        }
    };

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <h2>{task.title}</h2>

                <div className="modal-body">
                    <div className="detail-row">
                        <span className="label">Description:</span>
                        <span>{task.description || 'No description'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">State:</span>
                        <span>{task.state}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Priority:</span>
                        <span>{task.priority}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Created:</span>
                        <span>{formatDate(task.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Updated:</span>
                        <span>{formatDate(task.updatedAt)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Creator ID:</span>
                        <span>{task.creatorId}</span>
                    </div>

                    <div className="collaborators-section">
                        <h3>Collaborators</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="error-text">{error}</p>
                        ) : (
                            <>
                                <div className="collab-list">
                                    {collaborators.length === 0 ? (
                                        <p className="no-collab">No collaborators yet</p>
                                    ) : (
                                        <table className="collab-table">
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Operations</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {collaborators.map((u, idx) => (
                                                <tr key={u.id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{u.firstName} {u.lastName}</td>
                                                    <td>
                                                        {isCreator ? (
                                                            <button
                                                                onClick={() => handleRemove(u.id)}
                                                                disabled={removing === u.id}
                                                            >
                                                                {removing === u.id ? 'Removing...' : 'Remove'}
                                                            </button>
                                                        ) : (
                                                            <span className="no-action">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {isCreator ? (
                                    <div className="add-collab">
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                            disabled={adding || !hasAvailableUsers}
                                        >
                                            <option value="">
                                                {hasAvailableUsers ? 'Select collaborator...' : 'No users available to add'}
                                            </option>
                                            {availableUsers.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.firstName} {u.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="add-collab-btn"
                                            onClick={handleAdd}
                                            disabled={!selectedUserId || adding || !hasAvailableUsers}
                                        >
                                            {adding ? 'Adding...' : 'Add'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="collab-readonly">
                                        You are a collaborator on this task. Only the creator can manage collaborators.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TaskDetailModal;