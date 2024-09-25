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

class PlayerControlled { }

class Enemy { }

class Bullet { }

class Renderable {
  constructor(type) {
    this.type = type; // 'player', 'enemy', 'bullet'
    this.mesh = null; // Will store the Three.js mesh
  }
}

// Create the game engine
const game = new Engine();

// Movement System
game.createSystem([Position, Velocity], {
  act: function (entity, [position, velocity]) {
    position.x += velocity.x;
    position.y += velocity.y;
  }
});

// Player Control System
game.createSystem([Position, PlayerControlled], {
  act: function (entity, [position, _]) {
    // Update player position based on input
    // This would be connected to actual input handling
    if (game.input.left) position.x -= 5;
    if (game.input.right) position.x += 5;
    if (game.input.up) position.y -= 5;
    if (game.input.down) position.y += 5;
  }
});

// Shooting System
game.createSystem([Position, PlayerControlled], {
  act: function (entity, [position, _]) {
    if (game.input.shoot) {
      const bullet = game.createEntity();
      bullet.addComponent(new Position(position.x, position.y - 10));
      bullet.addComponent(new Velocity(0, -10));
      bullet.addComponent(new Renderable('bullet'));
      bullet.addComponent(new Bullet());
    }
  }
});

// Enemy Spawning System
let enemySpawnTimer = 0;
game.createSystem([], {
  act: function () {
    enemySpawnTimer++;
    if (enemySpawnTimer >= 60) { // Spawn enemy every 60 frames
      const enemy = game.createEntity();
      enemy.addComponent(new Position(Math.random() * 800, 0));
      enemy.addComponent(new Velocity(0, 2));
      enemy.addComponent(new Renderable('enemy'));
      enemy.addComponent(new Enemy());
      enemySpawnTimer = 0;
    }
  }
});

// Collision System
game.createSystem([Position, Renderable], {
  act: function (entity, [position, renderable]) {
    // Simple collision detection
    game.entities.forEach(other => {
      if (entity !== other && other.hasComponent('Position') && other.hasComponent('Renderable')) {
        const otherPos = other.components.Position;
        const otherRenderable = other.components.Renderable;

        if (Math.abs(position.x - otherPos.x) < 20 && Math.abs(position.y - otherPos.y) < 20) {
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
    // This will be called once before processing entities
    if (!this.scene) {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 5;
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
    }
  },
  act: function(entity, [position, renderable]) {
    if (!renderable.mesh) {
      // Create mesh if it doesn't exist
      let geometry;
      let material;
      switch (renderable.type) {
        case 'player':
          geometry = new THREE.ConeGeometry(0.5, 1, 3); // Triangle-like shape
          geometry.rotateX(Math.PI); // Rotate to point upwards
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
    
    // Update mesh position
    renderable.mesh.position.set(position.x, position.y, 0);
  },
  after: function() {
    // This will be called once after processing all entities
    this.renderer.render(this.scene, this.camera);
  }
});

// Create player
const player = game.createEntity();
player.addComponent(new Position(400, 550));
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
game.input = { left: false, right: false, up: false, down: false, shoot: false };
game.score = 0;
game.gameOver = false;
gameLoop();

export { game };