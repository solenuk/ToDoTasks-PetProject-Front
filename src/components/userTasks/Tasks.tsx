import {useState, useEffect} from 'react';
import {ResponseTaskDTO, PaginatedResponseDTO, User} from '../../types';
import './Tasks.css';
import TaskDetailModal from "../taskCard/TaskDetailModal";

interface TasksProps {
    token: string;
    user: User;
}

function Tasks({token, user}: Readonly<TasksProps>) {
    const [tasks, setTasks] = useState<ResponseTaskDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        pageNo: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
    });
    const [selectedTask, setSelectedTask] = useState<ResponseTaskDTO | null>(null);

    const fetchTasks = async (page: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:8080/api/tasks?page=${page}&size=${pagination.pageSize}`,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data: PaginatedResponseDTO<ResponseTaskDTO> = await response.json();
            setTasks(data.content);
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
        fetchTasks(0);
    }, []);

    const handlePrev = () => {
        if (pagination.pageNo > 0) fetchTasks(pagination.pageNo - 1);
    };

    const handleNext = () => {
        if (!pagination.last) fetchTasks(pagination.pageNo + 1);
    };

    const handleRowClick = (task: ResponseTaskDTO) => {
        setSelectedTask(task);
    };

    const closeModal = () => {
        setSelectedTask(null);
    };

    if (loading) return <div className="todos-loading">Loading tasks...</div>;
    if (error) return <div className="todos-error">Error: {error}</div>;

    return (
        <div className="todos-container">
            <div className="todos-header">
                <h2>All Tasks from {user.firstName}'s To-Do</h2>
                <button className="btn-create">Create New Task</button>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">No tasks yet. Create your first one!</div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="tasks-table">
                            <thead>
                            <tr>
                                <th>No.</th>
                                <th>Id</th>
                                <th>Title</th>
                                <th>Priority</th>
                                <th>State</th>
                                <th>Operations</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tasks.map((task, idx) => (
                                <tr key={task.id}>
                                    <td>{pagination.pageNo * pagination.pageSize + idx + 1}</td>
                                    <td>{task.id}</td>
                                    <td className="task-title"
                                        onClick={() => handleRowClick(task)}>
                                        {task.title}
                                    </td>
                                    <td><span>{task.priority}</span></td>
                                    <td><span>{task.state}</span></td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="action-buttons">
                                            <button className="btn-edit">Edit</button>
                                            <button className="btn-delete">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-bar">
                        <button onClick={handlePrev} disabled={pagination.pageNo === 0} className="page-btn">Prev
                        </button>
                        <span className="page-info">
              Page {pagination.pageNo + 1} of {pagination.totalPages}
            </span>
                        <button onClick={handleNext} disabled={pagination.last} className="page-btn">Next</button>
                    </div>
                </>
            )}

            {selectedTask && (
                <TaskDetailModal task={selectedTask} token={token} currentUserId={user.id} onClose={closeModal}/>
            )}
        </div>
    );
}

export default Tasks;