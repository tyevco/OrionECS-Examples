import React, { useState, useEffect } from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import { game } from './ecs';
import { KeyboardControls } from './controls';
import * as THREE from 'three';

function GameEntities() {
    const [entities, setEntities] = useState([]);

    useFrame(() => {
        game.perform();
        setEntities([...game.entities]);
    });

    return (
        <>
            {entities.map((entity, index) => {
                if (entity.hasComponent('Position') && entity.hasComponent('Renderable')) {
                    const position = entity.components.Position;
                    const renderable = entity.components.Renderable;
                    let geometry, material;

                    switch (renderable.type) {
                        case 'player':
                            geometry = new THREE.ConeGeometry(0.5, 1, 3);
                            material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                            break;
                        case 'enemy':
                            geometry = new THREE.CircleGeometry(0.25, 32);
                            material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                            break;
                        case 'bullet':
                            geometry = new THREE.CircleGeometry(0.1, 32);
                            material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
                            break;
                    }

                    return (
                        <mesh key={index} position={[position.x, position.y, 0]} rotation={renderable.type === 'player' ? [Math.PI, 0, 0] : [0, 0, 0]}>
                            <primitive object={geometry} />
                            <primitive object={material} />
                        </mesh>
                    );
                }
                return null;
            })}
        </>
    );
}

export default function App() {
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const scoreInterval = setInterval(() => {
            setScore(game.score);
            setGameOver(game.gameOver);
        }, 100);

        return () => clearInterval(scoreInterval);
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <KeyboardControls />
            <Canvas style={{ position: "absolute", inset: "0", touchAction: "none" }} orthographic camera={{ zoom: 40, position: [0, 0, 100] }}>
                <GameEntities />
            </Canvas>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'white', fontSize: '24px' }}>
                    Score: {score}
                </div>
                {gameOver && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ color: 'white', fontSize: '48px' }}>Game Over</div>
                    </div>
                )}
            </div>
        </div>
    );
}