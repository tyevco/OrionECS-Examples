import { Engine } from "orion-ecs";

// Components
class Position {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Velocity {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Renderable {
  constructor(type) {
    this.type = type; // 'player', 'enemy', 'bullet'
  }
}

class PlayerControlled {}

class Enemy {}

class Bullet {}

// Create the game engine
const game = new Engine();

// Movement System
game.createSystem([Position, Velocity], {
  act: function(entity, [position, velocity]) {
    position.x += velocity.x * 0.016; // Assume 60 FPS, scale by time
    position.y += velocity.y * 0.016;

    // Keep entities within bounds
    position.x = Math.max(-10, Math.min(10, position.x));
    position.y = Math.max(-7.5, Math.min(7.5, position.y));
  }
});

// Player Control System
game.createSystem([Position, PlayerControlled], {
  act: function(entity, [position, _]) {
    const speed = 5;
    if (game.input.left) position.x -= speed * 0.016;
    if (game.input.right) position.x += speed * 0.016;
    if (game.input.up) position.y += speed * 0.016;
    if (game.input.down) position.y -= speed * 0.016;
  }
});

// Shooting System
game.createSystem([Position, PlayerControlled], {
  act: function(entity, [position, _]) {
    const currentTime = Date.now();
    if (game.input.shoot && currentTime - game.values.lastShot > 500) { // 500ms cooldown
      const bullet = game.createEntity();
      bullet.addComponent(new Position(position.x, position.y + 0.5));
      bullet.addComponent(new Velocity(0, 5)); // Reduced bullet speed
      bullet.addComponent(new Renderable('bullet'));
      bullet.addComponent(new Bullet());
      game.values.lastShot = currentTime;
    }
  }
});

// Enemy Spawning System
game.createSystem([], {
  act: function() {
    const currentTime = Date.now();
    if (currentTime - game.values.lastSpawn > 2000) { // Spawn enemy every 2 seconds
      const enemy = game.createEntity();
      enemy.addComponent(new Position(Math.random() * 18 - 9, 7.5));
      enemy.addComponent(new Velocity(0, -1)); // Reduced enemy speed
      enemy.addComponent(new Renderable('enemy'));
      enemy.addComponent(new Enemy());
      game.values.lastSpawn = currentTime;
    }
  }
});

// Collision System
game.createSystem([Position, Renderable], {
  act: function(entity, [position, renderable]) {
    game.entities.forEach(other => {
      if (entity !== other && other.hasComponent('Position') && other.hasComponent('Renderable')) {
        const otherPos = other.components.Position;
        const otherRenderable = other.components.Renderable;
        
        if (Math.abs(position.x - otherPos.x) < 0.5 && Math.abs(position.y - otherPos.y) < 0.5) {
          if (renderable.type === 'bullet' && otherRenderable.type === 'enemy') {
            game.entities.splice(game.entities.indexOf(entity), 1);
            game.entities.splice(game.entities.indexOf(other), 1);
            game.score += 10;
          } else if (renderable.type === 'player' && otherRenderable.type === 'enemy') {
            game.gameOver = true;
          }
        }
      }
    });
  }
});

// Create player
const player = game.createEntity();
player.addComponent(new Position(0, -6));
player.addComponent(new Velocity(0, 0));
player.addComponent(new Renderable('player'));
player.addComponent(new PlayerControlled());

// Initialize game properties
game.input = { left: false, right: false, up: false, down: false, shoot: false, shootCooldown: false };
game.values = { lastSpawn: Date.now(), lastShot: Date.now() };
game.score = 0;
game.gameOver = false;

export { game };