import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postUserLogin } from "../../comunication/FetchUser";

// FIREBASE IMPORTS
import { auth, googleProvider } from "../../firebase-config";
import { signInWithPopup } from "firebase/auth";

function LoginUser({ setLoginValues }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    // A. STANDARD LOGIN
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            await postUserLogin({ email, password });

            // Credentials speichern für AES Entschlüsselung
            setLoginValues({ email: email, password: password });

            navigate('/user/success');
        } catch (error) {
            setErrorMessage(error.message || 'Login failed');
        }
    };

    // B. GOOGLE LOGIN
    const handleGoogleLogin = async () => {
        setErrorMessage(''); // Alten Fehler löschen
        try {
            // 1. Popup bei Google
            console.log("Start Google Popup...");
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 2. Token von Google holen
            console.log("Get ID Token...");
            const token = await user.getIdToken();

            // 3. Backend Call
            console.log("Sending to Backend...");
            const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8080'}/api/users/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
            });

            // WICHTIG: Hier lesen wir jetzt den echten Text vom Server!
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Server responded with error " + response.status);
            }

            const data = await response.json();

            // 4. Token speichern und Redirect
            if (data.token) {
                console.log("Login Success!");
                localStorage.setItem('token', data.token);

                // Wir haben kein Passwort für Verschlüsselung!
                setLoginValues({ email: data.userId, password: "" });

                navigate('/user/success');
            }

        } catch (error) {
            console.error("Google Login Fehler:", error);
            // Zeigt den echten Fehlertext in der roten Box an
            setErrorMessage("Google Login Failed: " + error.message);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Login</h2>

            {/* Formular */}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="submit" style={{ padding: '8px 16px' }}>Login</button>
                    <Link to="/user/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
                </div>
            </form>

            <div style={{ margin: '20px 0', borderTop: '1px solid #ccc' }}></div>

            {/* Google Button */}
            <button
                onClick={handleGoogleLogin}
                style={{
                    width: '100%',
                    backgroundColor: '#DB4437',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                Sign in with Google
            </button>

            {errorMessage && (
                <div style={{ color: 'red', marginTop: '15px', padding: '10px', backgroundColor: '#ffe6e6', border: '1px solid red' }}>
                    {errorMessage}
                </div>
            )}
        </div>
    );
}

export default LoginUser;