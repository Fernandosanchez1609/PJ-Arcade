import { ENDPOINTS } from "@/lib/Endpoints";
import { useAuth } from "./useAuth";

export function useToggleUserRole(onSuccess) {
  const { token } = useAuth();

  const toggleRole = async (userId) => {
    try {
      const res = await fetch(ENDPOINTS.TOGGLE_ROLE(userId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al cambiar el rol.");

      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Algo salió mal.");
    }
  };

  return toggleRole;
}
