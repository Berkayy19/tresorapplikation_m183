import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from "../../comunication/FetchUser";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Extract token from URL
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // --- PASSWORD ANALYSIS LOGIC ---
    const analyzePassword = (pass) => {
        const requirements = [
            { label: "At least 8 characters", met: pass.length >= 8 },
            { label: "At least 1 Uppercase (A-Z)", met: /[A-Z]/.test(pass) },
            { label: "At least 1 Lowercase (a-z)", met: /[a-z]/.test(pass) },
            { label: "At least 1 Number (0-9)", met: /[0-9]/.test(pass) },
            { label: "At least 1 Special Symbol (!?@#)", met: /[^A-Za-z0-9]/.test(pass) },
        ];

        const metCount = requirements.filter(req => req.met).length;

        let color = "#e0e0e0";
        let strengthLabel = "None";
        let width = "0%";

        if (pass.length > 0) {
            const percentage = Math.max(10, (metCount / 5) * 100);
            width = `${percentage}%`;

            if (metCount <= 2) {
                color = "#ff4d4d"; // Red
                strengthLabel = "Weak";
            } else if (metCount === 3 || metCount === 4) {
                color = "#ffa500"; // Orange
                strengthLabel = "Medium";
            } else if (metCount === 5) {
                color = "#00cc00"; // Green
                strengthLabel = "Strong";
            }
        }

        return { requirements, metCount, color, width, strengthLabel };
    };

    const passAnalysis = analyzePassword(password);
    // ----------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Missing reset token.");
            return;
        }

        // Validate Strength
        if (passAnalysis.metCount < 5) {
            setError("Please fulfill all password requirements.");
            return;
        }

        // Optional: Add a standard JS confirm dialog as a double-check
        if (!window.confirm("Are you sure? All your old secrets will be lost.")) {
            return;
        }

        try {
            await confirmPasswordReset(token, password);
            setMessage("Password changed successfully! Redirecting to login...");
            setTimeout(() => navigate('/user/login'), 2500);
        } catch (err) {
            setError(err.message);
        }
    };

    if (!token) {
        return <h3>Invalid Link: No token provided in URL.</h3>;
    }

    return (
        <div>
            <h2>Set New Password</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />

                            {/* Strength Bar */}
                            {password && (
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

                            {/* Requirements List */}
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

                        </div>
                        <div>
                            <label>Confirm Password:</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>
                    </aside>
                </section>

                {/* --- WARNING BOX START --- */}
                <div style={{
                    backgroundColor: "#fff3cd", // Light yellow background
                    color: "#856404",           // Dark yellow/brown text
                    border: "1px solid #ffeeba",
                    padding: "15px",
                    borderRadius: "5px",
                    marginTop: "20px",
                    marginBottom: "20px",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <span style={{ fontSize: "1.5rem", marginRight: "15px" }}>⚠️</span>
                    <div>
                        <strong>Warning: Data Loss</strong>
                        <p style={{ margin: "5px 0 0 0" }}>
                            Resetting your password will permanently delete access to all your
                            saved secrets, as they are encrypted with your old password.
                        </p>
                    </div>
                </div>
                {/* --- WARNING BOX END --- */}

                <button
                    type="submit"
                    style={{ backgroundColor: "#d9534f", borderColor: "#d43f3a" }} // Red button to indicate danger
                >
                    Confirm Reset & Delete Secrets
                </button>

                {message && <p style={{color: 'green', fontWeight: 'bold', marginTop: '10px'}}>{message}</p>}
                {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
            </form>
        </div>
    );
}

export default ResetPassword;