import { useDraggable } from '@dnd-kit/core';
import { CloudRain, TreePine, Coffee, Keyboard, Waves, Music, Flame, CloudLightning, Wind, Piano } from 'lucide-react';
import React from 'react';

const iconMap = {
    CloudRain,
    TreePine,
    Coffee,
    Keyboard,
    Waves,
    Music,
    Flame,
    CloudLightning,
    Wind,
    Piano
};

export default function SoundNode({ id, name, iconName, color, x, y, engine }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const Icon = iconMap[iconName] || Music;

    // We combine the base x, y with the current drag transform for immediate feedback
    const left = x + (transform ? transform.x : 0);
    const top = y + (transform ? transform.y : 0);

    // Calculate relative distance or simply query engine state for visual feedback
    // For now we just add a class
    const nodeState = engine.soundNodesRef?.current?.get(id);
    const isPlaying = engine.isPlaying && nodeState?.isPlaying;

    // Visual glow based on playing status AND we should ideally get volume, 
    // but let's just make it glow while playing.
    const style = {
        position: 'absolute',
        left: `calc(50% + ${left}px)`,
        top: `calc(50% + ${top}px)`,
        transform: 'translate(-50%, -50%)',
        '--node-color': color,
        zIndex: isDragging ? 100 : 10,
    };

    return (
        <div
            id={`node-${id}`}
            ref={setNodeRef}
            style={style}
            className={`sound-node ${isDragging ? 'dragging' : ''} ${isPlaying ? 'playing' : ''}`}
            {...listeners}
            {...attributes}
            title={name}
        >
            <div className="node-icon-wrapper">
                <Icon size={24} color={color} />
            </div>
            <span className="node-label">{name}</span>
        </div>
    );
}
