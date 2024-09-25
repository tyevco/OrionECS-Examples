import React, { useEffect } from 'react';
import { game } from './ecs';

export function KeyboardControls() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch(event.key) {
        case 'ArrowLeft': game.input.left = true; break;
        case 'ArrowRight': game.input.right = true; break;
        case 'ArrowUp': game.input.up = true; break;
        case 'ArrowDown': game.input.down = true; break;
        case ' ': game.input.shoot = true; break;
      }
    };

    const handleKeyUp = (event) => {
      switch(event.key) {
        case 'ArrowLeft': game.input.left = false; break;
        case 'ARrowRight': game.input.right = false; break;
        case 'ArrowUp': game.input.up = false; break;
        case 'ArrowDown': game.input.down = false; break;
        case ' ': game.input.shoot = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
}