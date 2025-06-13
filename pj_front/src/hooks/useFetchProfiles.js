import { ENDPOINTS } from "@/lib/Endpoints";
import { useAuth } from "@/hooks/useAuth";

export function useFetchProfile() {
  const { token } = useAuth();

  const fetchProfiles = async () => {
    if (!token) return [];

    try {
      const res = await fetch(ENDPOINTS.PROFILES, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener los perfiles");

      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return { fetchProfiles };
}
