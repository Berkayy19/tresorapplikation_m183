// --- EXISTIERENDE FUNKTIONEN (Login, Register, GetUsers) BLEIBEN BESTEHEN ---
// Füge diese am Ende der Datei hinzu oder ersetze die Datei:

export const getUsers = async () => {
    // ... dein bestehender Code ...
    // HINWEIS: Hier muss jetzt der Token mitgesendet werden!
    const token = localStorage.getItem('token');

    const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/users`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` // Token Header
        }
    });
    // ... Rest wie gehabt ...
};

export const postUser = async (content) => {
    // ... dein bestehender Code für Register ...
    const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    });
    // ... Error Handling ...
    return await response.json();
};

export const postUserLogin = async (content) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }
    const data = await response.json();

    // WICHTIG: Token speichern!
    if (data.token) {
        localStorage.setItem('token', data.token);
    }

    return data;
};

// --- NEUE FUNKTIONEN FÜR PASSWORT RESET ---

export const requestPasswordReset = async (email) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });

    if (!response.ok) {
        throw new Error('Failed to request reset');
    }
    return true; // Erfolg
};

export const confirmPasswordReset = async (token, newPassword) => {
    const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, password: newPassword })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to reset password');
    }
    return true;
};