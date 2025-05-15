// src/app/profile/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { token, user } = useAuth();
  const router = useRouter();

  
  useEffect(() => {
    if (!token) {
      router.replace("/"); 
    }
  }, [token, router]);


  if (!token) {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">
        ¡Bienvenido, {user.name || user.email}!
      </h1>
      <p>no tenemos esta pagina hecha aun.</p>
    </main>
  );
}
