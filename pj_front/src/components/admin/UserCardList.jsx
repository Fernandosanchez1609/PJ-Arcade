import styles from "./UserCardList.module.css";

export default function UserCardList({ users, onToggleRole, onDeleteUser }) {
  return (
    <div className={styles.grid}>
      {users.map((user) => (
        <div key={user.userId} className={styles.card}>
          <h2 className={styles.name}>{user.name}</h2>
          <p className={styles.email}>{user.email}</p>
          <p className={styles.role}>Rol: {user.rol}</p>

          <button
            className={styles.toggleBtn}
            onClick={() => onToggleRole(user.userId)}
          >
            Cambiar a {user.rol === "Admin" ? "User" : "Admin"}
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => onDeleteUser(user.userId)}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
