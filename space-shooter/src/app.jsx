import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { Fullscreen, Container, Text } from "@react-three/uikit";
import { game } from './ecs';
import { KeyboardControls } from './controls';

function GameScene() {
    const sceneRef = useRef();

    useEffect(() => {
        if (sceneRef.current) {
            // Add the game's Three.js scene to our React Three Fiber scene
            sceneRef.current.add(game.scene);
        }

        // Start the game loop
        function gameLoop() {
            if (!game.gameOver) {
                game.perform();
                requestAnimationFrame(gameLoop);
            }
        }
        gameLoop();

        // Clean up
        return () => {
            if (sceneRef.current) {
                sceneRef.current.remove(game.scene);
            }
        };
    }, []);

    return <scene ref={sceneRef} />;
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
        <>
            <KeyboardControls />
            <Canvas style={{ position: "absolute", inset: "0", touchAction: "none" }} gl={{ localClippingEnabled: true }} camera={game.camera}>
                <GameScene />
                <Fullscreen flexDirection="column" padding={1} gap={1}>
                    <Container flexDirection="row" justifyContent="flex-end" width="100%" height={2}>
                        <Text fontSize={0.5} color="white">Score: {score}</Text>
                    </Container>
                    {gameOver && (
                        <Container flexDirection="column" justifyContent="center" alignItems="center" width="100%" height="100%" backgroundColor="rgba(0,0,0,0.5)">
                            <Text fontSize={1} color="white">Game Over</Text>
                        </Container>
                    )}
                </Fullscreen>
            </Canvas>
        </>);
}