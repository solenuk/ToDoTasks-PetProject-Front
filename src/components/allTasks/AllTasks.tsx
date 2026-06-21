import { useState, useEffect } from 'react';
import { ResponseTaskDTO, User, PaginatedResponseDTO } from '../../types';
import './AllTasks.css';

interface AllTodosProps {
    token: string;
    user: User;
}

function AllTasks({ token }: Readonly<AllTodosProps>) {
    const [tasks, setTasks] = useState<ResponseTaskDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Map<number, User>>(new Map());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });

    useEffect(() => {
        const fetchData = async (page: number = 0) => {
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch all tasks
                const tasksRes = await fetch(`http://localhost:8080/api/tasks/all?page=${page}&size=${pagination.pageSize}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
                const tasksData: PaginatedResponseDTO<ResponseTaskDTO> = await tasksRes.json();
                setTasks(tasksData.content);
                setPagination({
                    pageNo: tasksData.pageNo,
                    pageSize: tasksData.pageSize,
                    totalElements: tasksData.totalElements,
                    totalPages: tasksData.totalPages,
                    last: tasksData.last,
                });

                const usersRes = await fetch('http://localhost:8080/api/users?page=0&size=1000', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!usersRes.ok) throw new Error('Failed to fetch users');
                const usersData: PaginatedResponseDTO<User> = await usersRes.json();
                const map = new Map<number, User>();
                usersData.content.forEach((u) => map.set(u.id, u));
                setUsersMap(map);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const fetchTasks = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const tasksRes = await fetch(
                `http://localhost:8080/api/tasks/all?page=${page}&size=${pagination.pageSize}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
            const tasksData: PaginatedResponseDTO<ResponseTaskDTO> = await tasksRes.json();
            setTasks(tasksData.content);
            setPagination({
                pageNo: tasksData.pageNo,
                pageSize: tasksData.pageSize,
                totalElements: tasksData.totalElements,
                totalPages: tasksData.totalPages,
                last: tasksData.last,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getUserEmail = (creatorId: number): string => {
        const user = usersMap.get(creatorId);
        return user ? user.email : 'Unknown';
    };

    // Delete handler
    const handleDelete = async (taskId: number) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete task');
            // Remove from list
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Could not delete task');
        }
    };

    const handlePrev = () => {
        if (pagination.pageNo > 0) fetchTasks(pagination.pageNo - 1);
    };

    const handleNext = () => {
        if (!pagination.last) fetchTasks(pagination.pageNo + 1);
    };

    if (loading) return <div className="all-todos-loading">Loading tasks...</div>;
    if (error) return <div className="all-todos-error">Error: {error}</div>;

    return (
        <div className="all-todos-container">
            <div className="all-todos-header">
                <h2>All Tasks (Admin)</h2>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">No tasks found.</div>
            ) : (
                <>
                    <div className="table-wrapper">
                    <table className="all-todos-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Priority</th>
                            <th>State</th>
                            <th>User Email</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td>{task.id}</td>
                                <td className="test">{task.title}</td>
                                <td><span>{task.priority}</span></td>
                                <td><span>{task.state}</span></td>
                                <td>{getUserEmail(task.creatorId)}</td>
                                <td>
                                    <button onClick={() => handleDelete(task.id)}>Delete</button>
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
        </div>
    );
}

export default AllTasks;