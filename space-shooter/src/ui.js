import * as THREE from 'three';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { reversePainterSortStable, Container, Root, Text } from '@pmndrs/uikit';

// Setup Three.js scene
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.z = 10;
const scene = new Scene();
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup uikit root
const root = new Root(camera, renderer, undefined, {
  flexDirection: "column",
  padding: 10,
  gap: 10
});
scene.add(root);

// Create score display
const scoreContainer = new Container(root, {
  flexDirection: "row",
  justifyContent: "flex-end",
  width: "100%",
  height: 50
});
root.add(scoreContainer);

const scoreText = new Text(scoreContainer, {
  text: "Score: 0",
  fontSize: 24,
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
  fontSize: 48,
  color: "white"
});
gameOverContainer.add(gameOverText);

// Setup render loop
function animate() {
  requestAnimationFrame(animate);
  root.update();
  renderer.render(scene, camera);
}
animate();

export { scoreText, gameOverContainer };