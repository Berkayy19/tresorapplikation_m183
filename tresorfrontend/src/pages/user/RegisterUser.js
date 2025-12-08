import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postUser } from "../../comunication/FetchUser";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

/**
 * RegisterUser
 * @author Peter Rutschmann
 */
function RegisterUser({loginValues, setLoginValues}) {
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const initialState = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        recaptchaToken: ""
    };
    const [credentials, setCredentials] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');

    // --- PASSWORD ANALYSIS LOGIC ---
    const analyzePassword = (pass) => {
        // Define the specific requirements
        const requirements = [
            { label: "At least 8 characters", met: pass.length >= 8 },
            { label: "At least 1 Uppercase (A-Z)", met: /[A-Z]/.test(pass) },
            { label: "At least 1 Lowercase (a-z)", met: /[a-z]/.test(pass) },
            { label: "At least 1 Number (0-9)", met: /[0-9]/.test(pass) },
            { label: "At least 1 Special Symbol (!?@#)", met: /[^A-Za-z0-9]/.test(pass) },
        ];

        // Calculate how many are met
        const metCount = requirements.filter(req => req.met).length;

        // Determine Color and Strength Label
        let color = "#e0e0e0"; // gray
        let strengthLabel = "None";
        let width = "0%";

        if (pass.length > 0) {
            // Even if weak, show a little bit of the bar (10%)
            // We map 0-5 requirements to percentages
            const percentage = Math.max(10, (metCount / 5) * 100);
            width = `${percentage}%`;

            if (metCount <= 2) {
                color = "#ff4d4d"; // Red (Weak)
                strengthLabel = "Weak";
            } else if (metCount === 3 || metCount === 4) {
                color = "#ffa500"; // Orange (Medium)
                strengthLabel = "Medium";
            } else if (metCount === 5) {
                color = "#00cc00"; // Green (Strong)
                strengthLabel = "Strong";
            }
        }

        return { requirements, metCount, color, width, strengthLabel };
    };

    const passAnalysis = analyzePassword(credentials.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if(credentials.password !== credentials.passwordConfirmation) {
            setErrorMessage('Password and password-confirmation are not equal.');
            return;
        }

        // Optional: Block if not all requirements are met
        if (passAnalysis.metCount < 5) {
            setErrorMessage('Please fulfill all password requirements.');
            return;
        }

        if (!executeRecaptcha) {
            setErrorMessage('Captcha not ready.');
            return;
        }

        try {
            const token = await executeRecaptcha('register_submit');
            const payload = { ...credentials, recaptchaToken: token };

            await postUser(payload);

            setLoginValues({userName: credentials.email, password: credentials.password});
            setCredentials(initialState);
            navigate('/');
        } catch (error) {
            console.error('Failed to fetch to server:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div>
            <h2>Register user</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Firstname:</label>
                            <input
                                type="text"
                                value={credentials.firstName}
                                onChange={(e) => setCredentials(prev => ({...prev, firstName: e.target.value}))}
                                required
                            />
                        </div>
                        <div>
                            <label>Lastname:</label>
                            <input
                                type="text"
                                value={credentials.lastName}
                                onChange={(e) => setCredentials(prev => ({...prev, lastName: e.target.value}))}
                                required
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={credentials.email}
                                onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
                                required
                            />
                        </div>
                    </aside>
                    <aside>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                                required
                            />

                            {/* --- STRENGTH BAR START --- */}
                            {credentials.password && (
                                <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                                    <div style={{
                                        height: '6px',
                                        width: '100%',
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: '3px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: passAnalysis.width,
                                            backgroundColor: passAnalysis.color,
                                            transition: 'all 0.3s ease'
                                        }}></div>
                                    </div>
                                    <div style={{
                                        textAlign: 'right',
                                        fontSize: '0.7rem',
                                        color: passAnalysis.color,
                                        fontWeight: 'bold',
                                        marginTop: '2px'
                                    }}>
                                        {passAnalysis.strengthLabel}
                                    </div>
                                </div>
                            )}
                            {/* --- STRENGTH BAR END --- */}

                            {/* --- REQUIREMENTS LIST START --- */}
                            <div style={{
                                fontSize: '0.75rem',
                                marginTop: '5px',
                                padding: '5px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '4px',
                                border: '1px solid #eee'
                            }}>
                                <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Requirements:</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {passAnalysis.requirements.map((req, index) => (
                                        <li key={index} style={{
                                            color: req.met ? '#00cc00' : '#888',
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '2px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>
                                                {req.met ? '✓' : '○'}
                                            </span>
                                            {req.label}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* --- REQUIREMENTS LIST END --- */}

                        </div>
                        <div>
                            <label>Confirm Password:</label>
                            <input
                                type="password"
                                value={credentials.passwordConfirmation}
                                onChange={(e) => setCredentials(prev => ({...prev, passwordConfirmation: e.target.value}))}
                                required
                            />
                        </div>
                    </aside>
                </section>
                <button type="submit">Register</button>
                <div style={{fontSize: "0.8rem", color: "#888", marginTop: "10px"}}>
                    Protected by reCAPTCHA v3
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default RegisterUser;