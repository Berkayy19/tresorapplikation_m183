import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha"; // Das ist die v2 Library

function RegisterUser() {
    const navigate = useNavigate();

    // Formular States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Captcha State
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // OFFIZIELLER GOOGLE TEST-KEY (Funktioniert immer auf localhost)
    const TEST_SITE_KEY = "6Ld-2BYsAAAAAFBGmIqmJj9QBM-3g-1ajc6Gtii3";

    // Wird aufgerufen, wenn der User die Checkbox anklickt
    const handleCaptchaChange = (token) => {
        console.log("Captcha gelöst, Token:", token);
        setRecaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Prüfung: Wurde die Checkbox geklickt?
        if (!recaptchaToken) {
            setErrorMessage("Bitte bestätige, dass du kein Roboter bist.");
            return;
        }

        const user = {
            firstName,
            lastName,
            email,
            password,
            recaptchaToken // Token wird an Backend gesendet
        };

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            // Wir erwarten JSON zurück (Message oder Error)
            const data = await response.json();

            if (!response.ok) {
                // Falls Backend Error sendet (z.B. User exists)
                throw new Error(data.error || data.message || 'Registration failed');
            }

            console.log("Registrierung erfolgreich:", data);
            // Weiterleitung zum Login
            navigate('/user/login');

        } catch (error) {
            console.error("Registrierungs-Fehler:", error);
            setErrorMessage(error.message);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{textAlign: 'center'}}>Registrieren</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Vorname</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Nachname</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Passwort</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {/* --- RECAPTCHA V2 CHECKBOX --- */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <ReCAPTCHA
                        sitekey={TEST_SITE_KEY}
                        onChange={handleCaptchaChange}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Registrieren
                </button>
            </form>

            {errorMessage && (
                <div style={{
                    color: '#721c24',
                    backgroundColor: '#f8d7da',
                    borderColor: '#f5c6cb',
                    marginTop: '15px',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid transparent'
                }}>
                    {errorMessage}
                </div>
            )}

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Hast du schon einen Account? <Link to="/user/login">Hier einloggen</Link>
            </p>
        </div>
    );
}

export default RegisterUser;