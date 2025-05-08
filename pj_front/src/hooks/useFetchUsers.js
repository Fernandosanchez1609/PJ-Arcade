import { useState, useEffect } from "react";
import { ENDPOINTS } from "@/lib/Endpoints";
import { useAuth } from "@/hooks/useAuth";

export function useFetchUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    async function fetchUsers() {
      try {
        const res = await fetch(ENDPOINTS.USERS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener usuarios");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [token]);

  return { users, loading, error };
}
