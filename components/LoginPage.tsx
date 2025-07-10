import React, { useState } from 'react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                onLoginSuccess();
            } else {
                setError(data.message || 'Ocurrió un error. Inténtalo de nuevo.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor. Verifica tu conexión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
                <div className="text-center">
                    <img src="https://i.imgur.com/zOGb0ay.jpeg" alt="Rago Automotores Logo" className="h-20 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Acceso de Administrador</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Ingresa tu contraseña para gestionar el inventario.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="password" className="sr-only">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 text-lg bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-rago-burgundy focus:border-transparent focus:outline-none transition disabled:opacity-50"
                            placeholder="Contraseña"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-500 text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-rago-burgundy hover:bg-rago-burgundy-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rago-burgundy/50 transition disabled:bg-rago-burgundy/50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Ingresando...
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </div>
                </form>

                 <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <a href="/" className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-lg font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rago-burgundy transition">
                        &larr; Volver al catálogo
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;