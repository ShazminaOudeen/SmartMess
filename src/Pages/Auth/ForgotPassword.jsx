import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdEmail, MdLockOutline } from 'react-icons/md';

export default function ForgotPassword() {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // We can use a neutral theme or general SmartMess brand for this
    const borderColor = '#3b82f6'; // blue-500
    const glowColor = 'rgba(59,130,246,0.3)';
    const accentLight = 'rgba(59,130,246,0.08)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');

        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            toast.success(res.data.message || 'Email sent successfully!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error sending password reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 font-sans transition-colors duration-400">
            {/* Mesh Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className={`absolute inset-0 ${dark
                    ? "bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(59,130,246,0.08)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(139,92,246,0.06)_0%,transparent_60%)]"
                    : "bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(59,130,246,0.12)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(139,92,246,0.07)_0%,transparent_60%)]"
                }`} />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md mb-6 animate-fade-down">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition-all duration-200"
                    >
                        ← Back to Login
                    </Link>
                </div>

                <div
                    className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 rounded-2xl p-8 animate-fade-up shadow-xl relative overflow-hidden"
                    style={{ borderColor: borderColor + '44', boxShadow: `0 24px 60px ${glowColor}, 0 0 0 1px ${borderColor}11` }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-30" style={{ background: accentLight }} />

                    <div className="text-center mb-8 relative z-10">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto mb-4"
                            style={{ background: `linear-gradient(135deg, ${borderColor}80, ${borderColor})`, boxShadow: `0 8px 20px ${glowColor}` }}
                        >
                            <MdLockOutline className="w-7 h-7" />
                        </div>
                        <h1 className="font-playfair text-2xl font-black text-gray-900 dark:text-white">
                            Recover <span style={{ color: borderColor }}>Password</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                            Enter your email address to receive a password reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="input-field pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: `linear-gradient(135deg, ${borderColor}cc, ${borderColor})`, boxShadow: `0 4px 15px ${glowColor}` }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} theme={dark ? 'dark' : 'light'} />
        </div>
    );
}
