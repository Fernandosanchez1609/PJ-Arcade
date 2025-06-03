/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true, // Usar SWC para minificar el código (más rápido que Terser)

    // Controlar los source maps
    webpack(config, { dev, isServer }) {
        if (dev) {
            // Solo habilitar source maps en desarrollo
            config.devtool = "eval-source-map"; // Puedes probar también con 'source-map'
        } else {
            // Deshabilitar source maps en producción
            config.devtool = false;
        }

        return config;
    },

    // Configuración para rutas dinámicas
    async rewrites() {
        return [
            {
                source: "/old-page",
                destination: "/new-page", // Redirigir /old-page a /new-page
            },
        ];
    },

    // Configuración para manejo de imágenes
    images: {
        domains: ["example.com", "another-example.com"], // Permitir imágenes de estos dominios
        formats: ["image/avif", "image/webp"], // Usar formatos de imagen más optimizados
    },

    // Configuración de las cabeceras HTTP (si necesitas configurar CORS, por ejemplo)
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-Custom-Header",
                        value: "my custom value",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
