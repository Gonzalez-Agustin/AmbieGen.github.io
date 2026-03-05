import React, { useRef, useState, useEffect } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import SoundNode from './SoundNode';
import './Board.css';

export default function Board({ engine, nodes, setNodes, isZenMode }) {
    // El área de escucha central es 450px por CSS en PC, 300px en móvil.
    // Ajustamos dinámicamente el radio activo para que la lógica coincida con el CSS.
    const isMobile = window.innerWidth <= 768;
    const RADIUS = isMobile ? 150 : 225;

    // Sincronizar coordenadas al cambiar presets
    useEffect(() => {
        if (nodes.length === 0) return;
        nodes.forEach(n => {
            updateEngineWithPosition(n.id, n.x, n.y);
        });
        // eslint-disable-next-line
    }, [nodes]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 2, // 2px de arrastre para registrar
            },
        })
    );

    const handleDragMove = (e) => {
        // Despertar contexto de audio en interacción
        if (!engine.isReady) engine.init();

        const { id } = e.active;
        const { delta } = e;

        // Encontrar nodo actual para cálculo relativo
        const nodeIndex = nodes.findIndex(n => n.id === id);
        if (nodeIndex === -1) return;
        const node = nodes[nodeIndex];

        const currentX = node.x + delta.x;
        const currentY = node.y + delta.y;

        updateEngineWithPosition(id, currentX, currentY);
    };

    const handleDragEnd = (e) => {
        const { id } = e.active;
        const { delta } = e;

        setNodes(prev => prev.map(n => {
            if (n.id === id) {
                const newX = n.x + delta.x;
                const newY = n.y + delta.y;
                updateEngineWithPosition(id, newX, newY);
                return { ...n, x: newX, y: newY };
            }
            return n;
        }));
    };

    const updateEngineWithPosition = (id, x, y) => {
        // X e Y son la distancia desde el centro del escenario.
        // Calcular distancia relativa (-1 a 1)
        // 225px es el radio codificado del círculo de escucha
        const xRel = x / RADIUS || 0;
        const yRel = y / RADIUS || 0;

        // Distancia Euclidiana para confirmar zona activa
        const distance = Math.sqrt(Math.pow(xRel, 2) + Math.pow(yRel, 2)) || 0;
        const isInsideBoard = distance <= 1;

        engine.updateNodePosition(id, xRel, yRel, isInsideBoard);
    };

    return (
        <div className="board-wrapper">
            <DndContext sensors={sensors} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
                {/* Área Circular Central */}
                <div className="listener-circle glass-panel">
                    <div className="center-dot"></div>
                    {/* Anillos Minimalistas */}
                    <div className="ring ring-1"></div>
                    <div className="ring ring-2"></div>
                </div>

                {/* Bounds flotantes sueltos, permitiendo elementos afuera */}
                {nodes.map(node => (
                    <SoundNode
                        key={node.id}
                        id={node.id}
                        name={node.name}
                        iconName={node.icon}
                        color={node.color}
                        x={node.x}
                        y={node.y}
                        engine={engine}
                    />
                ))}
            </DndContext>
        </div>
    );
}
