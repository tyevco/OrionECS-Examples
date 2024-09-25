import { game } from './ecs';
import { scoreText, gameOverContainer } from './ui';

// Update UI and render game in the game loop
function gameLoop() {
  if (!game.gameOver) {
    game.perform();

    // Update score
    scoreText.setProperties({ text: `Score: ${game.score}` });

    requestAnimationFrame(gameLoop);
  } else {
    // Show game over screen
    gameOverContainer.setProperties({ visible: true });
  }
}

// Setup input handling
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft': game.input.left = true; break;
    case 'ArrowRight': game.input.right = true; break;
    case 'ArrowUp': game.input.up = true; break;
    case 'ArrowDown': game.input.down = true; break;
    case ' ': game.input.shoot = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowLeft': game.input.left = false; break;
    case 'ArrowRight': game.input.right = false; break;
    case 'ArrowUp': game.input.up = false; break;
    case 'ArrowDown': game.input.down = false; break;
    case ' ': game.input.shoot = false; break;
  }
});

// Start the game
gameLoop();