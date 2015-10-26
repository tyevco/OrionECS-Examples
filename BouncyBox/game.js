
var orion = require("../../orion/src/orion");

// components
var PositionComponent = function Position(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

var VelocityComponent = function Velocity(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

var RectangleComponent = function Rectangle(w, h) {
	this.width = w || 5;
	this.height = h || 5;
};

var ColorComponent = function Color(clr) {
	this.value = clr || "green";
};

// export 
module.exports = function (io) {
	// initialize engine and systems
	var game = new orion.Engine();
	
	var phys = game.createSystem([PositionComponent, VelocityComponent, RectangleComponent], {
		act: function (e, pos, vel, rect) {
			pos.x += vel.x;
			pos.y += vel.y;
		}
	});
	
	var bounds = game.createSystem([PositionComponent, VelocityComponent, RectangleComponent], {
		act: function (e, pos, vel, rect) {
			if (pos.x + rect.width > 100 || pos.x < 0) {
				vel.x = (pos.x + rect.width > 100 ? -1 : 1) * Math.random() * 2;
			}
			if (pos.y + rect.height > 100 || pos.y < 0) {
				vel.y = (pos.y + rect.height > 100 ? -1 : 1) * Math.random() * 2;
			}
		}
	});
	
	var network = game.createSystem([PositionComponent, RectangleComponent], {
		before: function () {
			io.emit('clear');
		},
		act: function (e, pos, rect) {
			io.emit('update', { p: pos, r: rect });
		}
	});
	
	// create an entity
	var e = game.createEntity()
		.addComponent(new VelocityComponent(3, 1))
		.addComponent(new PositionComponent(5, 6))
		.addComponent(new RectangleComponent(5, 10))
		.addComponent(new ColorComponent());
	
	// return run game function
	return function () {
		game.run(25);
	};
}