import { ENDPOINTS } from "./Endpoints";

export async function getAllGames() {
  const res = await fetch(ENDPOINTS.GAMES, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Error al obtener los juegos");
  return await res.json(); // devuelve un array de GameDTO
}