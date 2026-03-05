import { useState, useEffect } from 'react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { defaultSounds } from './data/sounds';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import DynamicBackground from './components/DynamicBackground';
import './App.css';

function App() {
  const engine = useAudioEngine();
  const [nodesData, setNodesData] = useState([]);
  const [activeNodesSet, setActiveNodesSet] = useState(new Set());
  const [isZenMode, setIsZenMode] = useState(false);

  // Revisa periódicamente qué nodos están dentro (volumen > 10%)
  // para activar el fondo dinámico. Revisamos el estado interno del motor.
  useEffect(() => {
    const interval = setInterval(() => {
      const newSet = new Set();
      if (engine.soundNodesRef.current) {
        engine.soundNodesRef.current.forEach((node, id) => {
          // Chequea si el nodo está dentro de la tabla por distancia
          // No tiene que estar reproduciéndose para el feedback visual
          if (node.currentVolume > 0.05) {
            newSet.add(id);
          }
        });
      }

      // Actualizar el estado si el tamaño o el contenido cambió
      setActiveNodesSet(prev => {
        let changed = prev.size !== newSet.size;
        if (!changed) {
          for (let item of prev) {
            if (!newSet.has(item)) {
              changed = true;
              break;
            }
          }
        }

        if (changed) {
          // Mantiene el orden cronológico del último arrastrado
          const orderedSet = new Set(prev);

          // Quita lo que se volvió inactivo
          for (let item of orderedSet) {
            if (!newSet.has(item)) orderedSet.delete(item);
          }

          // Agrega lo activado recientemente al final del set
          for (let item of newSet) {
            if (!orderedSet.has(item)) orderedSet.add(item);
          }
          return orderedSet;
        }

        return prev;
      });

    }, 500); // Revisa dos veces por segundo

    return () => clearInterval(interval);
  }, [engine.soundNodesRef]);

  useEffect(() => {
    let mounted = true;

    const setupApp = async () => {
      await engine.loadSounds(defaultSounds);

      if (!mounted) return;

      const totalNodes = defaultSounds.length;
      const initialNodes = defaultSounds.map((sound, i) => {
        engine.registerSoundNode(sound.id);

        // Organizar en círculo alrededor del área
        const angle = (i / totalNodes) * Math.PI * 2;
        // Radio dinámico para no salirse de pantalla en el celular
        // En móvil es 150px, 175px lo pone inactivo
        const isMobile = window.innerWidth <= 768;
        const radius = isMobile ? 175 : 280;

        return {
          ...sound,
          x: Math.round(Math.cos(angle) * radius),
          y: Math.round(Math.sin(angle) * radius),
        };
      });
      setNodesData(initialNodes);
    };

    setupApp();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [customPresets, setCustomPresets] = useState({});

  // Cargar presets personalizados del navegador al inicio
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ambiegen_custom_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch (e) { console.error("Could not load presets", e); }
  }, []);

  const saveCustomPreset = (name) => {
    if (!name.trim()) return;
    const newCustoms = { ...customPresets, [name]: nodesData };
    setCustomPresets(newCustoms);
    try {
      localStorage.setItem('ambiegen_custom_presets', JSON.stringify(newCustoms));
    } catch (e) { console.error("Could not save preset", e); }
  };

  const deleteCustomPreset = (name) => {
    const newCustoms = { ...customPresets };
    delete newCustoms[name];
    setCustomPresets(newCustoms);
    try {
      localStorage.setItem('ambiegen_custom_presets', JSON.stringify(newCustoms));
    } catch (e) { console.error("Could not save preset", e); }
  };

  const applyPreset = (presetId) => {
    if (!engine.isReady) engine.init();

    // Verificar primero presets customizados
    if (customPresets[presetId]) {
      setNodesData(customPresets[presetId]);
      engine.playAll();
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const inactiveRadius = isMobile ? 175 : 350; // Justo fuera del escenario
    let unassignedAngles = 0;

    let newNodes = nodesData.map(n => {
      let x, y;
      let isAssigned = false;

      if (presetId === 'storm-office') {
        if (n.id === 'lluvia') { x = -20; y = -40; isAssigned = true; }
        if (n.id === 'keyboard') { x = 30; y = 60; isAssigned = true; }
        if (n.id === 'cafe') { x = 70; y = -80; isAssigned = true; }
      } else if (presetId === 'deep-forest') {
        if (n.id === 'forest') { x = 0; y = 0; isAssigned = true; }
        if (n.id === 'fuego') { x = -60; y = 60; isAssigned = true; }
      }

      if (!isAssigned) {
        // Distribuir de forma circular basándose en el índice
        const angle = (unassignedAngles / nodesData.length) * Math.PI * 2;
        x = Math.round(Math.cos(angle) * inactiveRadius);
        y = Math.round(Math.sin(angle) * inactiveRadius);
        unassignedAngles++;
      }

      return { ...n, x, y };
    });

    setNodesData(newNodes);
    engine.playAll();
  };

  return (
    <>
      <DynamicBackground activeNodes={activeNodesSet} />

      <div className={`app-container ${isZenMode ? 'zen-mode' : ''}`}>
        {(!engine.isReady || engine.loadingProgress < 100) && engine.loadingProgress > 0 && (
          <div className="loading-overlay">Cargando Sonidos... {Math.round(engine.loadingProgress)}%</div>
        )}
        <Sidebar
          engine={engine}
          applyPreset={applyPreset}
          customPresets={customPresets}
          saveCustomPreset={saveCustomPreset}
          deleteCustomPreset={deleteCustomPreset}
        />
        <main className="main-content">
          <Board engine={engine} nodes={nodesData} setNodes={setNodesData} isZenMode={isZenMode} />
        </main>

        {/* Botón Cambio Modo Zen */}
        {engine.isReady && (
          <button
            className="zen-toggle-btn"
            onClick={() => setIsZenMode(!isZenMode)}
            title={isZenMode ? "Salir del Modo Zen" : "Entrar en Modo Zen (Ocultar UI)"}
          >
            {isZenMode ? "Salir de Zen" : "Modo Zen"}
          </button>
        )}
      </div>
    </>
  );
}

export default App;
