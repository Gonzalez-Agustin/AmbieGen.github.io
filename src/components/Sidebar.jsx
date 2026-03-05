import React, { useState } from 'react';
import { Play, Pause, Save, X, Headphones } from 'lucide-react';

export default function Sidebar({ engine, applyPreset, customPresets, saveCustomPreset, deleteCustomPreset }) {
    const { isPlaying, playAll, pauseAll, isReady, init, isLofiMode, toggleLofiMode } = engine;
    const [newPresetName, setNewPresetName] = useState('');

    const handleMasterToggle = () => {
        if (!isReady) {
            init(); // user interaction initializes context
        }
        if (isPlaying) pauseAll();
        else playAll();
    };

    const handleSave = () => {
        if (newPresetName.trim()) {
            saveCustomPreset(newPresetName);
            setNewPresetName('');
        }
    };

    return (
        <aside className="sidebar glass-panel">
            <div>
                <h1 className="app-title text-gradient">AmbieGen</h1>
                <p className="subtitle">Arquitecto de Ambientes Sonoros</p>
            </div>

            <div className="control-section">
                <button
                    className={`master-btn ${!isPlaying ? 'paused' : ''}`}
                    onClick={handleMasterToggle}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    {isPlaying ? 'Pausar Ambiente' : 'Iniciar Escucha'}
                </button>
            </div>

            {/* Global Effects Section */}
            <div className="control-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filtro Global</span>
                </div>
                <button
                    className={`preset-btn lofi-btn ${isLofiMode ? 'active' : ''}`}
                    onClick={() => {
                        if (!isReady) init();
                        toggleLofiMode();
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    <Headphones size={18} />
                    {isLofiMode ? 'Filtro Subacuático: Activo' : 'Activar Filtro Lo-Fi'}
                </button>
            </div>

            <div className="control-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Volumen Maestro</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="1"
                    className="volume-slider"
                    onChange={(e) => engine.setMasterVolume(parseFloat(e.target.value))}
                />
            </div>

            <div className="control-section">
                <h3>Presets Inclusos</h3>
                <div className="presets-list">
                    <button className="preset-btn" onClick={() => applyPreset('storm-office')}>Tormenta de Código</button>
                    <button className="preset-btn" onClick={() => applyPreset('deep-forest')}>Bosque Profundo</button>
                </div>
            </div>

            <div className="control-section">
                <h3>Mis Presets</h3>
                <div className="save-preset-row">
                    <input
                        type="text"
                        placeholder="Nombre de sesión..."
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        className="preset-input"
                    />
                    <button className="icon-btn save-btn" onClick={handleSave} title="Guardar Posiciones Actuales">
                        <Save size={18} />
                    </button>
                </div>

                <div className="presets-list custom-presets">
                    {Object.keys(customPresets || {}).map(name => (
                        <div key={name} className="custom-preset-item">
                            <button className="preset-btn flex-1" onClick={() => applyPreset(name)}>
                                {name}
                            </button>
                            <button className="icon-btn delete-btn" onClick={() => deleteCustomPreset(name)} title="Borrar">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {Object.keys(customPresets || {}).length === 0 && (
                        <p className="subtitle" style={{ fontSize: '0.8rem', opacity: 0.6 }}>No tienes sesiones guardadas todavía.</p>
                    )}
                </div>
            </div>
        </aside>
    );
}
