import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from "../../comunication/FetchUser";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            await requestPasswordReset(email);
            setStatus("success");
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message);
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <h2>Request Sent</h2>
                <p>
                    If an account exists for <strong>{email}</strong>,
                    we generated a reset link.
                </p>
                <div style={{
                    backgroundColor: "#f0f0f0",
                    padding: "10px",
                    border: "1px dashed #333",
                    margin: "20px 0"
                }}>
                    <strong>LOOK AT YOUR INTELLIJ CONSOLE (SERVER LOGS)</strong><br/>
                    Click the link that starts with <code>http://localhost:3000/user/reset-password...</code>
                </div>
                <Link to="/user/login">
                    <button>Back to Login</button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h2>Reset Password</h2>
            <p>Enter your email address to request a password reset.</p>

            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Email Address:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </aside>
                </section>

                <button type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                </button>

                <div style={{ marginTop: "15px" }}>
                    <Link to="/user/login">Back to Login</Link>
                </div>

                {errorMessage && (
                    <p style={{ color: 'red', marginTop: '10px' }}>
                        {errorMessage}
                    </p>
                )}
            </form>
        </div>
    );
}

export default ForgotPassword;