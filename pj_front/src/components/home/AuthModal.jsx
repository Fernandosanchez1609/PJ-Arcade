import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { login, register } from "@/lib/authService";

function AuthModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre login y registro
    const [email, setEmail] = useState(''); // Para email en login y registro
    const [username, setUsername] = useState(''); // Para nombre de usuario en el registro
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Solo se utiliza en el registro

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let data;
            if (isLogin) {
                data = await login({ email, password });
                console.log("login");
                localStorage.setItem('token', data.token);
            } else {
                if (password !== confirmPassword) {
                    console.log("Las contraseñas no coinciden");
                    return;
                }
                data = await register({  name: username, email, password });
                console.log("register");
                localStorage.setItem('token', data.token);
            }

            onClose(); // cerrar modal al éxito
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-[var(--principal_orange)]">{isLogin ? 'Login' : 'Registro'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[var(--principal_orange)]">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-[var(--principal_orange)] placeholder-white"
                            placeholder="Escribe tu email"
                        />
                    </div>

                    {/* Nombre de usuario (solo en el formulario de registro) */}
                    {!isLogin && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-[var(--principal_orange)]">Nombre de usuario</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md text-[var(--principal_orange)] placeholder-white"
                                placeholder="Escriba su nombre de usuario"
                            />
                        </div>
                    )}

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[var(--principal_orange)]">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md text-[var(--principal_orange)] placeholder-white"
                            placeholder="Introduce tu contraseña"
                        />
                    </div>

                    {/* Confirmar Contraseña (solo en el formulario de registro) */}
                    {!isLogin && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--principal_orange)]">Confirmar contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md text-[var(--principal_orange)] placeholder-white"
                                placeholder="Confirma tu contraseña"
                            />
                        </div>
                    )}

                    {/* Botón */}
                    <div className="mt-4">
                        <button
                            type="submit"
                            className="w-full py-2 text-white rounded-md hover:bg-opacity-80"
                            style={{ backgroundColor: 'var(--header_footer)' }}
                        >
                            {isLogin ? 'Login' : 'Registrarse'}
                        </button>
                    </div>
                </form>

                {/* Texto de cambio entre formularios */}
                <div className="text-center text-[var(--principal_orange)] mt-4">
                    {isLogin ? (
                        <span>
                            ¿No tienes cuenta?{' '}
                            <button onClick={() => setIsLogin(false)} className="underline">Registrarse</button>
                        </span>
                    ) : (
                        <span>
                            ¿Ya tienes cuenta?{' '}
                            <button onClick={() => setIsLogin(true)} className="underline">Iniciar sesión</button>
                        </span>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AuthModal;
