import React, { useState } from 'react';
import { CreateTaskDTO, TaskPriority, ResponseTaskDTO } from '../../types';
import './CreateTaskModal.css';

interface CreateTaskModalProps {
    token: string;
    onClose: () => void;
    onTaskCreated: (newTask: ResponseTaskDTO) => void;
}

function CreateTaskModal({ token, onClose, onTaskCreated }: Readonly<CreateTaskModalProps>) {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simple validation
        if (!title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }

        const payload: CreateTaskDTO = {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
        };

        try {
            const response = await fetch('http://localhost:8080/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to create task');
            }

            const newTask: ResponseTaskDTO = await response.json();
            onTaskCreated(newTask);
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
                <h2>Create New Task</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={255}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>
                    {error && <div className="error-text">{error}</div>}
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTaskModal;