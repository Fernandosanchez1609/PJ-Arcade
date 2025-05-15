import { ENDPOINTS } from "@/lib/Endpoints";
import { useAuth } from "@/hooks/useAuth";

export function useFetchUsers() {
  const { token } = useAuth();

  const fetchUsers = async () => {
    if (!token) return [];

    try {
      const res = await fetch(ENDPOINTS.USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener usuarios");

      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return { fetchUsers };
}
