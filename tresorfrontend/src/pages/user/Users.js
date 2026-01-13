import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Users({ loginValues }) {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users', {
                headers: getAuthHeader()
            });
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (userId) => {
        if(!window.confirm("User wirklich löschen? Alle Secrets werden auch gelöscht!")) return;

        try {
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (!response.ok) throw new Error("Delete failed");

            // Liste aktualisieren
            setUsers(users.filter(u => u.id !== userId));
            alert("User gelöscht!");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>User Verwaltung (Admin)</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}

            <table border="1" cellPadding="10" style={{borderCollapse: 'collapse', width: '100%', marginTop: '20px'}}>
                <thead>
                    <tr style={{backgroundColor: '#f2f2f2'}}>
                        <th>ID</th>
                        <th>Vorname</th>
                        <th>Nachname</th>
                        <th>Email</th>
                        <th>Rolle</th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                >
                                    Löschen
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Users;