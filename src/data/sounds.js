// Función auxiliar para resolver rutas de la carpeta public correctamente en GitHub Pages
const getUrl = (path) => {
    // Vite inyecta BASE_URL (ej: '/AmbieGen.github.io/') en producción y '/' en desarrollo
    const base = import.meta.env.BASE_URL;
    // Si la ruta ya empieza con el base, la dejamos. Si no, la concatenamos asegurando una sola barra.
    return path.startsWith(base) ? path : `${base}${path.replace(/^\//, '')}`;
};

export const defaultSounds = [
    { id: 'lluvia', name: 'Lluvia', icon: 'CloudRain', src: getUrl('/audio/rain.mp3'), color: '#00f0ff' },
    { id: 'forest', name: 'Bosque', icon: 'TreePine', src: getUrl('/audio/forest.mp3'), color: '#10ff70' },
    { id: 'cafe', name: 'Café', icon: 'Coffee', src: getUrl('/audio/cafe.mp3'), color: '#ffb020' },
    { id: 'keyboard', name: 'Teclado', icon: 'Keyboard', src: getUrl('/audio/keyboard.mp3'), color: '#cccccc' },
    { id: 'fuego', name: 'Fuego', icon: 'Flame', src: getUrl('/audio/fuego.mp3'), color: '#ff4d00' },
    { id: 'jazz', name: 'Jazz', icon: 'Music', src: getUrl('/audio/jazz.mp3'), color: '#b026ff' },
    { id: 'viento', name: 'Viento', icon: 'Wind', src: getUrl('/audio/viento.mp3'), color: '#aabccc' },
    { id: 'trueno', name: 'Trueno', icon: 'CloudLightning', src: getUrl('/audio/trueno.mp3'), color: '#d4c4f9' },
    { id: 'piano', name: 'Piano', icon: 'Piano', src: getUrl('/audio/piano.mp3'), color: '#ffd700' },
];
