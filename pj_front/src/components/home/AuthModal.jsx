"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { app } from "@/lib/Firebase"; // Asegúrate de exportar `app` desde tu config Firebase
import axios from "axios"; // Asegúrate de tener axios instalado

function AuthModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { login, register } = useAuth();

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/;

    useEffect(() => {
        const auth = getAuth(app);
        getRedirectResult(auth)
            .then(async (result) => {
                if (result) {
                    const user = result.user;
                    const { isNewUser } = result._tokenResponse || {};
                    if (isNewUser) {
                        await axios.post("/api/usuarios", {
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName,
                            provider: "google",
                        });
                    }
                    toast.success(`Bienvenido, ${user.displayName} 🎉`);
                    // Cierra modal o actualiza estado de login aquí si quieres
                }
            })
            .catch((error) => {
                toast.error(
                    error.message || "Error al iniciar sesión con Google"
                );
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isLogin) {
                await login({ email, password });
                toast.success("Bienvenido de nuevo 🎉");
            } else {
                if (!passwordRegex.test(password)) {
                    toast.error(
                        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
                    );
                    return;
                }

                if (password !== confirmPassword) {
                    toast.error("Las contraseñas no coinciden");
                    return;
                }

                await register({ name: username, email, password });
                toast.success("Registro exitoso 🎉");
            }

            onClose();
        } catch (err) {
            toast.error(err.message || "Algo salió mal.");
        }
    };

    const handleGoogleLogin = () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        signInWithRedirect(auth, provider);
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-[var(--principal_orange)]">
                        {isLogin ? "Login" : "Registro"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[var(--principal_orange)]"
                        >
                            Email
                        </label>
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

                    {!isLogin && (
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-[var(--principal_orange)]"
                            >
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md text-[var(--principal_orange)] placeholder-white"
                                placeholder="Escribe tu nombre de usuario"
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[var(--principal_orange)]"
                        >
                            Contraseña
                        </label>
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

                    {!isLogin && (
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-[var(--principal_orange)]"
                            >
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                className="mt-1 p-2 w-full border border-gray-300 rounded-md text-[var(--principal_orange)] placeholder-white"
                                placeholder="Confirma tu contraseña"
                            />
                        </div>
                    )}

                    <div className="mt-4 space-y-2">
                        <button
                            type="submit"
                            className="w-full py-2 text-white rounded-md hover:bg-opacity-80"
                            style={{ backgroundColor: "var(--header_footer)" }}
                        >
                            {isLogin ? "Login" : "Registrarse"}
                        </button>

                        {/* Botón de Google */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-2 border border-gray-300 rounded-md text-[var(--principal_orange)] hover:bg-gray-100"
                        >
                            Iniciar sesión con Google
                        </button>
                    </div>
                </form>

                <div className="text-center text-[var(--principal_orange)] mt-4">
                    {isLogin ? (
                        <span>
                            ¿No tienes cuenta?{" "}
                            <button
                                onClick={() => setIsLogin(false)}
                                className="underline"
                            >
                                Registrarse
                            </button>
                        </span>
                    ) : (
                        <span>
                            ¿Ya tienes cuenta?{" "}
                            <button
                                onClick={() => setIsLogin(true)}
                                className="underline"
                            >
                                Iniciar sesión
                            </button>
                        </span>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AuthModal;
