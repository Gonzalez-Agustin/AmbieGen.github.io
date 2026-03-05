const base = import.meta.env.BASE_URL;

export const defaultSounds = [
    { id: 'lluvia', name: 'Lluvia', icon: 'CloudRain', src: `${base}audio/rain.mp3`, color: '#00f0ff' },
    { id: 'forest', name: 'Bosque', icon: 'TreePine', src: `${base}audio/forest.mp3`, color: '#10ff70' },
    { id: 'cafe', name: 'Café', icon: 'Coffee', src: `${base}audio/cafe.mp3`, color: '#ffb020' },
    { id: 'keyboard', name: 'Teclado', icon: 'Keyboard', src: `${base}audio/keyboard.mp3`, color: '#cccccc' },
    { id: 'fuego', name: 'Fuego', icon: 'Flame', src: `${base}audio/fuego.mp3`, color: '#ff4d00' },
    { id: 'jazz', name: 'Jazz', icon: 'Music', src: `${base}audio/jazz.mp3`, color: '#b026ff' },
    { id: 'viento', name: 'Viento', icon: 'Wind', src: `${base}audio/viento.mp3`, color: '#aabccc' },
    { id: 'trueno', name: 'Trueno', icon: 'CloudLightning', src: `${base}audio/trueno.mp3`, color: '#d4c4f9' },
    { id: 'piano', name: 'Piano', icon: 'Piano', src: `${base}audio/piano.mp3`, color: '#ffd700' },
];
