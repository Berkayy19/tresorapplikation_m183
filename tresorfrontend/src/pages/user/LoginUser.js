import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { postUserLogin } from "../../comunication/FetchUser";

/**
 * LoginUser
 * @author Peter
 */
function LoginUser({ loginValues, setLoginValues }) {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Login attempt:", loginValues);
        setErrorMessage('');

        try {
            await postUserLogin(loginValues);
            // Redirect to the login success page
            navigate('/user/success');
        } catch (error) {
            console.error('Login failed:', error.message);
            setErrorMessage(error.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h2>Login User</h2>
            <form onSubmit={handleSubmit}>
                <section>
                    <aside>
                        <div>
                            <label>Email:</label>
                            <input
                                type="text"
                                value={loginValues.email}
                                onChange={(e) =>
                                    setLoginValues(prev => ({ ...prev, email: e.target.value }))
                                }
                                required
                                placeholder="Please enter your email *"
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={loginValues.password}
                                onChange={(e) =>
                                    setLoginValues(prev => ({ ...prev, password: e.target.value }))
                                }
                                required
                                placeholder="Please enter your password *"
                            />
                        </div>
                    </aside>
                </section>

                {errorMessage && (
                    <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                        {errorMessage}
                    </p>
                )}

                <button type="submit" className="login-button">
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginUser;
