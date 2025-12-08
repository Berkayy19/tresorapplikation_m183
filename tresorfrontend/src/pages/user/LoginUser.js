import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- 1. Import Link
import { postUserLogin } from "../../comunication/FetchUser";

/**
 * LoginUser
 * @author Peter Rutschmann
 */
function LoginUser({ setLoginValues }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            // Call the login API
            await postUserLogin({ email, password });

            // Update global state
            setLoginValues({ email: email, password: password });

            // Redirect to home or success page
            navigate('/user/success');
        } catch (error) {
            console.error('Login failed:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </aside>
                </section>

                <button type="submit">Login</button>

                {/* --- 2. ADD THE FORGOT PASSWORD LINK HERE --- */}
                <div style={{ marginTop: "15px", textAlign: "left" }}>
                    <Link to="/user/forgot-password" style={{ fontSize: "0.9rem", color: "#555" }}>
                        Forgot Password?
                    </Link>
                </div>
                {/* ------------------------------------------- */}

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
        </div>
    );
}

export default LoginUser;