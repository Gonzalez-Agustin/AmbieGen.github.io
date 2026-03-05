import { useRef, useState, useCallback, useEffect } from 'react';

// Motor de Audio Central para gestionar Audio Espacial
export function useAudioEngine() {
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isLofiMode, setIsLofiMode] = useState(false);

    const audioCtxRef = useRef(null);
    const masterGainRef = useRef(null);
    const filterRef = useRef(null);
    const buffersRef = useRef(new Map());
    const soundNodesRef = useRef(new Map());

    // Inicializa el Audio Context al interactuar (requerido por navegadores)
    const init = useCallback(() => {
        if (audioCtxRef.current) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();

        // Crear Nodos Maestros
        masterGainRef.current = audioCtxRef.current.createGain();
        masterGainRef.current.gain.value = 0; // Empieza muteado, sube al reproducir

        // Crear Filtro Lowpass para efecto Lo-Fi / Subacuático
        filterRef.current = audioCtxRef.current.createBiquadFilter();
        filterRef.current.type = 'lowpass';
        // 22050Hz equivale a apagado (deja pasar todas las frecuencias)
        filterRef.current.frequency.value = 22050;
        filterRef.current.Q.value = 0.5;

        // Enrutamiento: Master -> Filtro -> Destino (Altavoces)
        masterGainRef.current.connect(filterRef.current);
        filterRef.current.connect(audioCtxRef.current.destination);

        setIsReady(true);
    }, []);

    // Precargar lista de URLs de sonido en AudioBuffers
    const loadSounds = useCallback(async (soundsList) => {
        if (!audioCtxRef.current) init();
        let loaded = 0;

        await Promise.all(
            soundsList.map(async (sound) => {
                try {
                    const response = await fetch(sound.src);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const arrayBuffer = await response.arrayBuffer();

                    // Safari y navegadores viejos pueden no dar promesas con decodeAudioData
                    const decodePromise = new Promise((resolve, reject) => {
                        try {
                            const p = audioCtxRef.current.decodeAudioData(
                                arrayBuffer,
                                (decoded) => resolve(decoded),
                                (err) => reject(err)
                            );
                            if (p && typeof p.catch === 'function') {
                                p.catch(reject);
                            }
                        } catch (e) {
                            reject(e);
                        }
                    });

                    // Añadimos un tiempo de espera de seguridad de 15s para archivos custom MP3
                    const audioBuffer = await Promise.race([
                        decodePromise,
                        new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout decodificando audio')), 15000))
                    ]);

                    buffersRef.current.set(sound.id, audioBuffer);
                } catch (error) {
                    console.warn(`Failed to load ${sound.src}. Using dummy buffer.`, error);
                    try {
                        if (audioCtxRef.current && audioCtxRef.current.sampleRate > 0) {
                            const dummyBuffer = audioCtxRef.current.createBuffer(2, audioCtxRef.current.sampleRate, audioCtxRef.current.sampleRate);
                            buffersRef.current.set(sound.id, dummyBuffer);
                        }
                    } catch (dummyError) {
                        console.error("No se pudo crear dummy buffer", dummyError);
                    }
                } finally {
                    loaded++;
                    setLoadingProgress((loaded / soundsList.length) * 100);
                }
            })
        );
    }, [init]);

    // Conecta un sonido a su Ganancia y Paneo dedicados
    const registerSoundNode = useCallback((id, x = 0, y = 0) => {
        // No verificamos buffersRef para que GainNodes rastreen para visuales
        if (!audioCtxRef.current) init();

        // Comprobar si ya está registrado
        if (soundNodesRef.current.has(id)) {
            // Detener fuente existente si la hay
            const existingNode = soundNodesRef.current.get(id);
            if (existingNode.source) {
                try { existingNode.source.stop(); } catch (e) { }
            }
        }

        const gainNode = audioCtxRef.current.createGain();
        const pannerNode = audioCtxRef.current.createStereoPanner();

        // Valores iniciales
        gainNode.gain.value = 0;
        pannerNode.pan.value = 0;

        pannerNode.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        soundNodesRef.current.set(id, {
            gainNode,
            pannerNode,
            isPlaying: false,
            source: null,
            currentVolume: 0
        });
    }, []);

    // Lógica espacial en base a relativas (-1 a 1)
    const updateNodePosition = useCallback((id, xRel, yRel, isInsideBoard = true) => {
        const node = soundNodesRef.current.get(id);
        if (!node || !audioCtxRef.current) return;

        if (!isInsideBoard) {
            // Silenciar si se arrastra afuera del radio
            node.gainNode.gain.value = 0;
            node.currentVolume = 0;

            // Actualizar estilo DOM
            const domElement = document.getElementById(`node-${id}`);
            if (domElement) {
                domElement.style.setProperty('--node-glow', '0px');
                domElement.style.opacity = '0.4';
            }
            return;
        }

        // Distancia del centro (0 a 1)
        const distance = Math.max(0, Math.min(1, Math.sqrt(xRel * xRel + yRel * yRel) || 0));

        // Curva de desvanecimiento para más naturalidad (100%->10%)
        const minVol = 0.10;
        const maxVol = 1.0;
        let mappedVol = maxVol - distance * (maxVol - minVol);
        mappedVol = Math.max(0, Math.min(1, mappedVol)); // Límites

        // Lógica de Paneo X
        const panValue = Math.max(-1, Math.min(1, xRel || 0));

        // Setear compatibilidad
        try {
            node.gainNode.gain.value = mappedVol;
            node.pannerNode.pan.value = panValue;
            node.currentVolume = mappedVol;
        } catch (e) {
            console.error("Audio Param assignment error", e);
        }

        // Actualización directa del DOM (Rendimiento Extremo)
        const domElement = document.getElementById(`node-${id}`);
        if (domElement) {
            // Usa el volumen final para variar el halo visual
            const blurRadius = isInsideBoard ? (mappedVol * 30) : 5;
            const opacity = isInsideBoard ? (0.4 + mappedVol * 0.6) : 0.4;

            domElement.style.setProperty('--node-glow', `${blurRadius}px`);
            domElement.style.opacity = `${opacity}`;
        }

    }, []);

    const playAll = useCallback(() => {
        if (!audioCtxRef.current) return;
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        // Asignación directa
        masterGainRef.current.gain.value = 1;

        // Nuevos buffers activos
        for (const [id, node] of soundNodesRef.current.entries()) {
            if (node.isPlaying) continue;

            const buffer = buffersRef.current.get(id);
            if (!buffer) continue;

            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            // Compatibilidad MP3/AAC
            source.connect(node.pannerNode);
            source.start();

            node.source = source;
            node.isPlaying = true;
        }

        setIsPlaying(true);
    }, []);

    const pauseAll = useCallback(() => {
        if (!audioCtxRef.current) return;
        // Fade-out anticlicks
        masterGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.3);
        setTimeout(() => {
            if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
                audioCtxRef.current.suspend();
            }
        }, 400); // Dar borde de tiempo
        setIsPlaying(false);
    }, []);

    const setMasterVolume = useCallback((volume) => {
        if (!masterGainRef.current) return;
        // Obliga min 0, max 1
        const safeVol = Math.max(0, Math.min(1, volume));
        masterGainRef.current.gain.value = safeVol;
    }, []);

    // Activar modo acua
    const toggleLofiMode = useCallback(() => {
        if (!filterRef.current || !audioCtxRef.current) return;

        setIsLofiMode(prev => {
            const willBeActive = !prev;
            // Transición suave en un segundo para el filtro
            const targetFreq = willBeActive ? 400 : 22050; // 400hz suena bajo agua

            filterRef.current.frequency.cancelScheduledValues(audioCtxRef.current.currentTime);
            filterRef.current.frequency.exponentialRampToValueAtTime(
                targetFreq,
                audioCtxRef.current.currentTime + 1.0
            );

            return willBeActive;
        });
    }, []);

    return {
        isReady,
        isPlaying,
        loadingProgress,
        isLofiMode,
        init,
        loadSounds,
        registerSoundNode,
        updateNodePosition,
        playAll,
        pauseAll,
        setMasterVolume,
        toggleLofiMode,
        soundNodesRef
    };
}
