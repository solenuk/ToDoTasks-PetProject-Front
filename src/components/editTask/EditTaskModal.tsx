import React, { useState } from 'react';
import { ResponseTaskDTO, UpdateTaskDTO, TaskState, TaskPriority } from '../../types';
import './EditTaskModal.css';

interface EditTaskModalProps {
    task: ResponseTaskDTO;
    token: string;
    onClose: () => void;
    onTaskUpdated: (updatedTask: ResponseTaskDTO) => void;
}

function EditTaskModal({ task, token, onClose, onTaskUpdated }: Readonly<EditTaskModalProps>) {
    const [title, setTitle] = useState<string>(task.title);
    const [description, setDescription] = useState<string>(task.description || '');
    const [state, setState] = useState<TaskState>(task.state);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload: UpdateTaskDTO = { title, description, state, priority };

        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to update task');
            }

            const updatedTask: ResponseTaskDTO = await response.json();
            onTaskUpdated(updatedTask);
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
                <h2>Edit Task</h2>
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
                        <label htmlFor="state">State</label>
                        <select
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value as TaskState)}
                        >
                            <option value="NEW">New</option>
                            <option value="DOING">Doing</option>
                            <option value="DONE">Done</option>
                        </select>
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
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Task'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTaskModal;