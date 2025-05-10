import { ENDPOINTS } from "@/lib/Endpoints";
import { useAuth } from "@/hooks/useAuth";

export function useDeleteUser(onSuccess) {
  const { token } = useAuth();

  const deleteUser = async (userId) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(ENDPOINTS.DELETE_USER(userId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 204) {
        if (onSuccess) onSuccess();
      } else if (res.status === 404) {
        const body = await res.json();
        throw new Error(body.message || "Usuario no encontrado.");
      } else {
        const text = await res.text();
        throw new Error(text || "Error al eliminar usuario.");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return deleteUser;
}
