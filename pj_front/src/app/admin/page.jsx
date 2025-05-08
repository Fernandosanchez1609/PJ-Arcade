"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFetchUsers } from "@/hooks/useFetchUsers";
import { ENDPOINTS } from "@/lib/Endpoints";
import UserCardList from "@/components/admin/UserCardList";

export default function AdminPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { fetchUsers } = useFetchUsers();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleUserRole = async (userId) => {
    try {
      const res = await fetch(ENDPOINTS.TOGGLE_ROLE(userId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al cambiar el rol");

      const updatedUsers = await fetchUsers(); // recarga los usuarios
      setUsers(updatedUsers);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.replace("/");
      return;
    }

    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError("Error al cargar usuarios.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token]);

  return (
    <main>
      <h1>Panel de Administración</h1>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p>{error}</p>}

      <UserCardList users={users} onToggleRole={toggleUserRole} />
    </main>
  );
}
