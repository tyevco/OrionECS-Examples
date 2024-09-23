
// Import the Orion ECS engine
import { Engine } from '../../../src/engine';

// Define components
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Health {
    constructor(hp) {
        this.hp = hp;
    }
}

class Damage {
    constructor(amount) {
        this.amount = amount;
    }
}

class Movement {
    constructor(speed) {
        this.speed = speed;
    }
}

class Tower {
    constructor(range, fireRate) {
        this.range = range;
        this.fireRate = fireRate;
        this.lastFired = 0;
    }
}

class Enemy {
    constructor() {
        // Enemy-specific properties
    }
}

class Projectile {
    constructor(targetId) {
        this.targetId = targetId;
    }
}

// Add a new component for rendering
class Renderable {
    constructor(color, size) {
        this.color = color;
        this.size = size;
    }
}

// Create the game engine
const game = new Engine();

// Movement System
game.createSystem([Position, Movement], {
    act: function(entity, [position, movement]) {
        // Simple movement along x-axis
        position.x += movement.speed;
    }
});

// Tower Firing System
game.createSystem([Tower, Position], {
    act: function(entity, [tower, position]) {
        if (game.steps - tower.lastFired >= tower.fireRate) {
            // Find closest enemy in range
            const enemies = game.entities.filter(e => e.hasComponent('Enemy') && e.hasComponent('Position'));
            const target = enemies.find(e => {
                const enemyPos = e.components.Position;
                const distance = Math.sqrt(Math.pow(enemyPos.x - position.x, 2) + Math.pow(enemyPos.y - position.y, 2));
                return distance <= tower.range;
            });

            if (target) {
                const projectile = game.createEntity();
                projectile.addComponent(new Position(position.x, position.y));
                projectile.addComponent(new Projectile(target.id));
                projectile.addComponent(new Damage(10));
                projectile.addComponent(new Renderable('black', 5));
                tower.lastFired = game.steps;
            }
        }
    }
});

// Projectile Movement System
game.createSystem([Projectile, Position], {
    act: function(entity, [projectile, position]) {
        const target = game.entities.find(e => e.id === projectile.targetId);
        if (target && target.hasComponent('Position')) {
            const targetPos = target.components.Position;
            const dx = targetPos.x - position.x;
            const dy = targetPos.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                // Hit the target
                if (target.hasComponent('Health')) {
                    target.components.Health.hp -= entity.components.Damage.amount;
                }
                game.entities = game.entities.filter(e => e !== entity);
            } else {
                // Move towards target
                position.x += dx / distance * 5;
                position.y += dy / distance * 5;
            }
        } else {
            // Target is gone, remove projectile
            game.entities = game.entities.filter(e => e !== entity);
        }
    }
});

// Health System
game.createSystem([Health], {
    act: function(entity, [health]) {
        if (health.hp <= 0) {
            game.entities = game.entities.filter(e => e !== entity);
        }
    }
});

// Rendering System
let ctx;
game.createSystem([Position, Renderable], {
    before: function() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    act: function(entity, [position, renderable]) {
        ctx.fillStyle = renderable.color;
        ctx.fillRect(position.x - renderable.size / 2, position.y - renderable.size / 2, renderable.size, renderable.size);
    }
});

// Game setup
function setupGame() {
    const tower1 = game.createEntity();
    tower1.addComponent(new Position(100, 100));
    tower1.addComponent(new Tower(100, 30));
    tower1.addComponent(new Renderable('blue', 20));

    const tower2 = game.createEntity();
    tower2.addComponent(new Position(300, 100));
    tower2.addComponent(new Tower(120, 40));
    tower2.addComponent(new Renderable('blue', 20));

    // Spawn enemies periodically
    setInterval(() => {
        const enemy = game.createEntity();
        enemy.addComponent(new Enemy());
        enemy.addComponent(new Position(0, Math.random() * ctx.canvas.height));
        enemy.addComponent(new Movement(1));
        enemy.addComponent(new Health(50));
        enemy.addComponent(new Renderable('red', 15));
    }, 2000);
}

// Initialize the game
function init() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    setupGame();
    game.run(16, 0);
}

// Start the game when the window loads
window.onload = init;

console.log("Tower Defense Demo started!");