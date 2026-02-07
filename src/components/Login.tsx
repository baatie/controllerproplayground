import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/auth';
import { Icons } from '../../constants';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await authApi.register(username, password);
                // Auto login after register
                const data = await authApi.login(username, password);
                login(data.token, data.username);
            } else {
                const data = await authApi.login(username, password);
                login(data.token, data.username);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-maple flex items-center justify-center wood-texture">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-oak/20">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purpleheart to-purpleheartdark rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-12 shadow-lg">
                        <span className="text-white font-black text-2xl transform -rotate-12">CP</span>
                    </div>
                    <h1 className="text-2xl font-black text-oak uppercase tracking-widest">
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-oak/60 text-sm mt-2 font-medium">
                        {isRegistering ? 'Join the secure workspace' : 'Enter your credentials to access'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-oaklight uppercase tracking-wider mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-maple/30 border border-oak/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purpleheart text-oak font-bold transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-oaklight uppercase tracking-wider mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-maple/30 border border-oak/20 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purpleheart text-oak font-bold transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purpleheart hover:bg-purpleheartdark text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-oaklight hover:text-purpleheart text-sm font-bold transition-colors"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};
