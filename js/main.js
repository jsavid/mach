import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { AudioSystem } from './audio.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    // Ensure canvas size matches CSS size for 1:1 pixel mapping if needed, 
    // or use fixed internal resolution
    canvas.width = 800;
    canvas.height = 600;

    const renderer = new Renderer(canvas);
    const audio = new AudioSystem();
    const game = new Game(renderer, audio, canvas.width, canvas.height);

    // Pilot Face Element
    const pilotFaceContainer = document.getElementById('pilot-face-container');

    // Input Handling
    window.addEventListener('keydown', e => game.handleInput(e.key, true));
    window.addEventListener('keyup', e => game.handleInput(e.key, false));

    // User interaction required for AudioContext
    window.addEventListener('click', () => {
        if (audio.ctx.state === 'suspended') {
            audio.ctx.resume();
        }
    }, { once: true });

    let lastTime = 0;
    function loop(timestamp) {
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        game.update(dt);
        game.draw();

        // Update Pilot Face
        const faceCanvas = renderer.getPilotFace(game.pilotState);
        if (pilotFaceContainer.firstChild !== faceCanvas) {
            pilotFaceContainer.innerHTML = '';
            pilotFaceContainer.appendChild(faceCanvas);
        }

        // Update Score UI
        document.getElementById('score-val').innerText = game.score.toString().padStart(6, '0');

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
});
