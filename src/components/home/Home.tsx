import './Home.css'

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to Todo App For Tasks!</h1>
            <p>
                This is your personal task manager. Keep track of your daily tasks,
                organize them, and stay productive.
            </p>
            <p>Features:</p>
            <ul>
                <li>Create, edit, and delete tasks</li>
                <li>Mark tasks as complete</li>
                <li>View all your todos</li>
                <li>Collaborate with other users</li>
            </ul>
        </div>
    );
}

export default Home;