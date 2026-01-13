import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * LoginSuccess
 * Shown right after successful login
 */
function LoginSuccess() {
    const navigate = useNavigate();

    // Optional auto-redirect after 3 s
    useEffect(() => {
        const timer = setTimeout(() => navigate('/secret/secrets'), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
            <div className="bg-white shadow-xl rounded-2xl p-10 text-center w-80">
                <h1 className="text-2xl font-bold text-green-700 mb-4">
                    ✅ Login Successful
                </h1>
                <p className="text-gray-600 mb-6">
                    Welcome back! You are now logged in.
                </p>
                <button
                    onClick={() => navigate('/secret/secrets')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-all duration-200"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

export default LoginSuccess;
