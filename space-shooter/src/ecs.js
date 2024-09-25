import { Engine } from "orion-ecs";
import * as THREE from 'three';

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
    this.mesh = null; // Will store the Three.js mesh
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

// Cleanup System
game.createSystem([Position, Renderable], {
  act: function(entity, [position, renderable]) {
    // Remove bullets that go off screen
    if (renderable.type === 'bullet' && position.y > 8) {
      game.entities.splice(game.entities.indexOf(entity), 1);
      if (renderable.mesh) {
        this.scene.remove(renderable.mesh);
      }
    }
    // Remove enemies that go off screen
    if (renderable.type === 'enemy' && position.y < -8) {
      game.entities.splice(game.entities.indexOf(entity), 1);
      if (renderable.mesh) {
        this.scene.remove(renderable.mesh);
      }
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

// Rendering System
game.createSystem([Position, Renderable], {
  before: function() {
    if (!this.scene) {
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-10, 10, 7.5, -7.5, 0.1, 1000);
      this.camera.position.z = 10;
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
    }
  },
  act: function(entity, [position, renderable]) {
    if (!renderable.mesh) {
      let geometry;
      let material;
      switch (renderable.type) {
        case 'player':
          geometry = new THREE.ConeGeometry(0.5, 1, 3);
          geometry.rotateX(Math.PI);
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
      renderable.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(renderable.mesh);
    }
    
    renderable.mesh.position.set(position.x, position.y, 0);
  },
  after: function() {
    this.renderer.render(this.scene, this.camera);
  }
});

// Create player
const player = game.createEntity();
player.addComponent(new Position(0, -6));
player.addComponent(new Velocity(0, 0));
player.addComponent(new Renderable('player'));
player.addComponent(new PlayerControlled());

// Game loop
function gameLoop() {
  if (!game.gameOver) {
    game.perform();
    requestAnimationFrame(gameLoop);
  }
}

// Start the game
game.input = { left: false, right: false, up: false, down: false, shoot: false, shootCooldown: false };
game.values = { lastSpawn: Date.now(), lastShot: Date.now() };
game.score = 0;
game.gameOver = false;
gameLoop();

export { game };