"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";


function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let data;
      if (isLogin) {
        // Llamamos al login del hook, que actualiza Redux y localStorage
        data = await login({ email, password });
        
        toast.success("bienvenido de nuevo 🎉");
      } else {
        if (password !== confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          return;
        }
        // Llamamos al register del hook
        data = await register({ name: username, email, password });
        toast.success("Registro exitoso 🎉");
      }

      onClose();
    } catch (err) {
      toast.error(err.message || "Algo salió mal.");
    }
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
            <label htmlFor="email" className="block text-sm font-medium text-[var(--principal_orange)]">
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

          {/* Nombre de usuario solo en registro */}
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--principal_orange)]">
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
            <label htmlFor="password" className="block text-sm font-medium text-[var(--principal_orange)]">
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--principal_orange)]">
                Confirmar contraseña
              </label>
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

          <div className="mt-4">
            <button
              type="submit"
              className="w-full py-2 text-white rounded-md hover:bg-opacity-80"
              style={{ backgroundColor: "var(--header_footer)" }}
            >
              {isLogin ? "Login" : "Registrarse"}
            </button>
          </div>
        </form>

        <div className="text-center text-[var(--principal_orange)] mt-4">
          {isLogin ? (
            <span>
              ¿No tienes cuenta?{" "}
              <button onClick={() => setIsLogin(false)} className="underline">
                Registrarse
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => setIsLogin(true)} className="underline">
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
