import styles from "./UserCardList.module.css";

export default function UserCardList({ users, currentUserId, onToggleRole, onDeleteUser, onToggleBan }) {
  return (
    <div className={styles.grid}>
      {users.map((user) => {
        const isCurrentUser = String(user.userId) === String(currentUserId);

        return (
          <div key={user.userId} className={styles.card}>
            <div className={styles.data}>
              <h2 className={styles.name}>{user.name}</h2>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.role}>Rol: {user.rol}</p>
            </div>

            <div className={styles.buttons}>
              <button
                className={styles.toggleBtn}
                onClick={() => onToggleRole(user.userId)}
                disabled={isCurrentUser}
                title={isCurrentUser ? "No puedes cambiar tu propio rol" : ""}
                style={{
                  cursor: isCurrentUser ? "not-allowed" : "pointer",
                  opacity: isCurrentUser ? 0.5 : 1,
                }}
              >
                Cambiar a {user.rol === "Admin" ? "User" : "Admin"}
              </button>
              <button
                className={styles.banBtn}
                onClick={() => onToggleBan(user.userId)}
                disabled={isCurrentUser}
                title={isCurrentUser ? "No puedes banearte a ti mismo" : ""}
                style={{
                  cursor: isCurrentUser ? "not-allowed" : "pointer",
                  opacity: isCurrentUser ? 0.5 : 1,
                }}
              >
                {user.isBanned ? "Desbanear" : "Banear"}
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => onDeleteUser(user.userId)}
                disabled={isCurrentUser}
                title={isCurrentUser ? "No puedes eliminar tu propio usuario" : ""}
                style={{
                  cursor: isCurrentUser ? "not-allowed" : "pointer",
                  opacity: isCurrentUser ? 0.5 : 1,
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

