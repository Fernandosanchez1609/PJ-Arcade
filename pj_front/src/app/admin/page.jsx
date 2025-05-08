"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFetchUsers } from "@/hooks/useFetchUsers";
import UserCardList from "@/components/admin/UserCardList";

export default function AdminPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { users, loading, error } = useFetchUsers();

  useEffect(() => {
    if (!token || user?.role !== "Admin") {
      router.replace("/");
    }
  }, [token, user, router]);

  if (!token) return null;

  return (
    <main>
      <h1>Panel de Administración</h1>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p>{error}</p>}

      <UserCardList users={users} />
    </main>
  );
}
