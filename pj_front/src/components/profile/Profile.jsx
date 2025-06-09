import styles from "./Profile.module.css";

export default function Profile({ user }) {
    return (
        <div className={styles.container}>
            <section>
                <p></p>
                <button>Cambiar contraseña</button>
            </section>
            <section>
                <img src="" alt="Foto de perfil" />
                <nick>{user.name}</nick>
                <button>
                    <img src="" alt="Editar perfil" />
                </button>
            </section>
        </div>
    );
}
