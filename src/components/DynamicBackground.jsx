import React, { useEffect, useState } from 'react';
import './DynamicBackground.css';

export default function DynamicBackground({ activeNodes }) {
    // Array.from preserves insertion order, so the last element is the most recent
    const activeArray = Array.from(activeNodes);

    // Determine the most recently activated concept
    const lastActive = activeArray.length > 0 ? activeArray[activeArray.length - 1] : 'default';

    // We can still show rain particles purely if 'lluvia' is anywhere active, 
    // to give it that "overlay" extra dimension even if it's not the main background image.
    const showRain = activeNodes.has('lluvia');

    const backgrounds = ['default', 'lluvia', 'forest', 'fuego', 'jazz', 'cafe', 'keyboard', 'trueno', 'viento', 'piano'];

    return (
        <div className="dynamic-bg-container">
            {/* Render all backgrounds as absolute layers for cross-fading */}
            {backgrounds.map(bg => (
                <div
                    key={bg}
                    className={`bg-layer bg-${bg} ${lastActive === bg ? 'active' : ''}`}
                />
            ))}

            {/* Ambient overlay to help with glassmorphism contrast */}
            <div className="bg-overlay"></div>

            {/* Realistic Rain Overlay Video */}
            {showRain && (
                <div className="rain-container">
                    <video
                        className="rain-video-overlay"
                        src="/rain.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        disablePictureInPicture
                    />
                </div>
            )}
        </div>
    );
}
