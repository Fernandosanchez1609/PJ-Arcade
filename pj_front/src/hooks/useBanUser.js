import { ENDPOINTS } from "@/lib/Endpoints";
import { useAuth } from "./useAuth";

export function useBanUser(refreshUsers) {
  const { token } = useAuth();

  return async function (userId) {
    try {
      const res = await fetch(ENDPOINTS.TOGGLE_BAN(userId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Error al banear/desbanear el usuario.");
      }

      refreshUsers();
    } catch (err) {
      console.error(err);
    }
  };
}
