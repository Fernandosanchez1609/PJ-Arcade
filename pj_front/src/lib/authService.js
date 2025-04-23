export async function login({ email, password }) {
    const res = await fetch('https://localhost:7053/api/User/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  
    if (!res.ok) throw new Error('Error al iniciar sesión');
    return await res.json();
  }
  
  export async function register({  name, email, password }) {
    console.log(name, email, password);
    const res = await fetch('https://localhost:7053/api/User/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  
    if (!res.ok) throw new Error('Error al registrarse');
    return await res.json();
  }
  