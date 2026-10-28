import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                const data = await login(email, password);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                const data = await verifyOTP(email, otp);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setError('Account not verified. A new OTP has been sent to your email.');
            } else {
                setError(err.message || err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card p-8 rounded-2xl border border-white/20 shadow-2xl">
            <div className="text-center mb-7 sm:mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Event account</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Sign in to continue to your events</p>
            </div>

            {error && <div role="alert" className="bg-red-50 text-red-700 p-3 sm:p-4 rounded-lg mb-6 text-center shadow-inner border border-red-200 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {!showOTP ? (
                    <>
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="username"
                                inputMode="email"
                                required
                                pattern="[A-Za-z0-9._%+-]+@gmail\.com"
                                title="Use a Gmail address ending in @gmail.com"
                                placeholder="you@gmail.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition shadow-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            />
                            <p className="mt-2 text-xs text-gray-500">Sign in with your Gmail address.</p>
                        </div>
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 shadow-sm transition focus:border-gray-700 focus:ring-2 focus:ring-gray-700"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    className="password-toggle absolute inset-y-0 right-0 flex items-center px-4"
                                >
                                    {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <label htmlFor="login-otp" className="block text-sm font-semibold text-gray-700 mb-2">Verification Code (OTP)</label>
                        <input
                            id="login-otp"
                            type="text"
                            required
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="6-digit code"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-lg"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength="6"
                        />
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition shadow-md"
                >
                    {loading ? 'Processing...' : (showOTP ? 'Verify OTP & Log In' : 'Sign In')}
                </button>
            </form>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 text-center text-sm sm:flex-row sm:text-left">
                <Link to="/forgot-password" className="text-gray-700 hover:text-gray-900 font-medium underline underline-offset-4">Forgot password?</Link>
                <p className="text-gray-600">
                    Don't have an account? <Link to="/register" className="text-gray-900 font-bold hover:underline">Sign up</Link>
                </p>
            </div>
            </div>
        </div>
    );
};

export default Login;
