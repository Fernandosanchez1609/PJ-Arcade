import styles from './home/Home.module.css'
import { FaTwitter, FaInstagram, FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';

function Footer() {
    return(
        <footer className={styles.footer}>
        
          <img src="/icon.svg" alt="Joystick" />
          <div className={styles.footer_right}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" >
              <FaTwitter className={styles.icon}/>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className={styles.icon}/>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <FaGithub className={styles.icon}/>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className={styles.icon}/>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
              <FaDiscord className={styles.icon}/>
            </a>
          </div>
        </footer>
    )
}

export default Footer;