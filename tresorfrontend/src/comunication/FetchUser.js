/**
 * Fetch methodes for user api calls
 * @author Peter Rutschmann
 */

export const getUsers = async () => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    const path = process.env.REACT_APP_API_PATH || "/api";
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Server response failed.');
        }

        const data = await response.json();
        console.log('User successfully got:', data);
        return data;
    } catch (error) {
        console.error('Failed to get user:', error.message);
        throw new Error('Failed to get user. ' || error.message);
    }
}

export const postUser = async (content) => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    const path = process.env.REACT_APP_API_PATH || "/api";
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Server response failed.');
        }
        const data = await response.json();
        console.log('User successfully posted:', data);
        return data;
    } catch (error) {
        console.error('Failed to post user:', error.message);
        throw new Error(error.message || 'Failed to save user.');
    }
};

export const postUserLogin = async (content) => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    const path = process.env.REACT_APP_API_PATH || "/api";
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: `${content.email}`,
                password: `${content.password}`
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Server response failed.');
        }
        const data = await response.json();
        console.log('User successfully logged in:', data);
        return data;
    } catch (error) {
        console.error('Failed to login user:', error.message);
        throw new Error(error.message || 'Failed to login user.');
    }
};

// --- NEW FUNCTIONS BELOW ---

export const requestPasswordReset = async (email) => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    const path = process.env.REACT_APP_API_PATH || "/api";
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;

    try {
        const response = await fetch(`${API_URL}/users/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Server response failed.');
        }
        return true;
    } catch (error) {
        console.error('Failed to request password reset:', error.message);
        throw new Error(error.message || 'Failed to request password reset.');
    }
};

export const confirmPasswordReset = async (token, newPassword) => {
    const protocol = process.env.REACT_APP_API_PROTOCOL || "http";
    const host = process.env.REACT_APP_API_HOST || "localhost";
    const port = process.env.REACT_APP_API_PORT || "8080";
    const path = process.env.REACT_APP_API_PATH || "/api";
    const portPart = port ? `:${port}` : '';
    const API_URL = `${protocol}://${host}${portPart}${path}`;

    try {
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token, password: newPassword })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to reset password");
        }

        return true;
    } catch (error) {
        console.error('Reset failed:', error.message);
        throw error;
    }
};