import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { reversePainterSortStable, Container, Root, Text } from '@pmndrs/uikit';

// Setup Three.js scene for UI
const uiCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
uiCamera.position.z = 10;
const uiScene = new Scene();
const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Make background transparent
document.body.appendChild(renderer.domElement);

// Setup uikit root
const root = new Root(uiCamera, renderer, undefined, {
  flexDirection: "column",
  padding: 10,
  gap: 10,
  width: 20, // Match game width
  height: 15, // Match game height
});
uiScene.add(root);

// Create score display
const scoreContainer = new Container(root, {
  flexDirection: "row",
  justifyContent: "flex-end",
  width: "100%",
  height: 1
});
root.add(scoreContainer);

const scoreText = new Text(scoreContainer, {
  text: "Score: 0",
  fontSize: 0.5,
  color: "white"
});
scoreContainer.add(scoreText);

// Create game over screen
const gameOverContainer = new Container(root, {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  visible: false
});
root.add(gameOverContainer);

const gameOverText = new Text(gameOverContainer, {
  text: "Game Over",
  fontSize: 1,
  color: "white"
});
gameOverContainer.add(gameOverText);

// Setup render loop
function animate() {
  requestAnimationFrame(animate);
  root.update();
  renderer.render(uiScene, uiCamera);
}
animate();

export { scoreText, gameOverContainer };