"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFetchUsers } from "@/hooks/useFetchUsers";
import { useToggleUserRole } from "@/hooks/useToggleUserRole";
import { useDeleteUser } from "@/hooks/useDeleteUser";
import UserCardList from "@/components/admin/UserCardList";
import { useBanUser } from "@/hooks/useBanUser";

export default function AdminPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { fetchUsers } = useFetchUsers();
 

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 1) Función para recargar usuarios
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
      setError(null);
    } catch {
      setError("Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // 2) Hooks de acción
  const toggleRole = useToggleUserRole(loadUsers);
  const deleteUser = useDeleteUser(loadUsers);
  const banUser = useBanUser(loadUsers);

  // 3) Handlers pasados a UserCardList
  const handleToggleRole = (userId) => {
    toggleRole(userId);
  };

  const handleDeleteUser = (userId) => {
    deleteUser(userId);
  };
  const handleToggleBan = (userId) => {
    banUser(userId);
  };

  // 4) Efecto inicial
  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.replace("/");
      return;
    }
    loadUsers();
  }, [token]);

  return (
    <main>
      <h1 className="text-center">
        Panel de Administración
      </h1>


      {loading && <p>Cargando usuarios...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <UserCardList
        users={users}
        currentUserId={user?.id}
        onToggleRole={handleToggleRole}
        onDeleteUser={handleDeleteUser}
        onToggleBan={handleToggleBan}
      />

    </main>
  );
}
