// --- State & Config ---
const state = {
    theme: 'light',
    fontSize: 'medium',
    mode: 'menu', // menu, daily, practice
    dailyColor: { h: 0, s: 0, l: 0 },
    targetColor: { h: 0, s: 0, l: 0 },
    currentGuess: { h: 180, s: 50, l: 50 },
    timeLimit: 25,
    timeLeft: 25,
    timerInt: null,
    streak: 0,
    hasPlayedDaily: false
};

const uiLayer = document.getElementById('ui-layer');
const root = document.documentElement;

// --- Devvit Communication ---
window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.type === 'INIT_DATA') {
        state.dailyColor = msg.dailyColor;
        state.streak = msg.streak;
        
        const today = new Date().toISOString().split('T')[0];
        if (msg.lastPlayed === today) {
            state.hasPlayedDaily = true;
        }

        document.getElementById('streak-count').innerText = state.streak;
        document.getElementById('streak-display').classList.remove('hidden');
        renderMainMenu();
    }
    
    if (msg.type === 'STREAK_UPDATED') {
        state.streak = msg.streak;
        document.getElementById('streak-count').innerText = state.streak;
    }
});

// Request initial data from Devvit on load
window.parent.postMessage({ type: 'INIT_REQUEST' }, '*');

// --- HSL Utilities ---
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function calculateDelta(c1, c2) {
    // Basic perceptual delta mapping HSL
    const hDiff = Math.min(Math.abs(c1.h - c2.h), 360 - Math.abs(c1.h - c2.h)) / 360;
    const sDiff = Math.abs(c1.s - c2.s) / 100;
    const lDiff = Math.abs(c1.l - c2.l) / 100;
    return Math.round((hDiff + sDiff + lDiff) * 1000);
}

// --- UI Rendering ---
function applySettings() {
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-font-size', state.fontSize);
}

function renderMainMenu() {
    gameScene.resetCanvas();
    const dailyBtnText = state.hasPlayedDaily ? "DAILY (COMPLETED)" : "DAILY CHALLENGE";
    const dailyBtnClass = state.hasPlayedDaily ? "btn" : "btn btn-primary";
    
    uiLayer.innerHTML = `
        <div class="screen menu-screen">
            <button class="${dailyBtnClass}" id="btn-daily" ${state.hasPlayedDaily ? 'disabled' : ''}>${dailyBtnText}</button>
            <button class="btn" id="btn-practice">PRACTICE MODE</button>
            <button class="btn" id="btn-settings">SETTINGS</button>
        </div>
    `;

    document.getElementById('btn-daily')?.addEventListener('click', () => startGame('daily'));
    document.getElementById('btn-practice').addEventListener('click', () => startGame('practice'));
    document.getElementById('btn-settings').addEventListener('click', renderSettings);
}

function renderSettings() {
    uiLayer.innerHTML = `
        <div class="screen menu-screen">
            <div class="settings-form">
                <label>THEME</label>
                <select id="sel-theme">
                    <option value="light" ${state.theme === 'light' ? 'selected' : ''}>LIGHT</option>
                    <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>DARK</option>
                </select>
                
                <label>TEXT SIZE</label>
                <select id="sel-font">
                    <option value="small" ${state.fontSize === 'small' ? 'selected' : ''}>SMALL</option>
                    <option value="medium" ${state.fontSize === 'medium' ? 'selected' : ''}>MEDIUM</option>
                    <option value="large" ${state.fontSize === 'large' ? 'selected' : ''}>LARGE</option>
                </select>
            </div>
            <button class="btn" id="btn-back">BACK</button>
        </div>
    `;

    const updateUI = () => {
        state.theme = document.getElementById('sel-theme').value;
        state.fontSize = document.getElementById('sel-font').value;
        applySettings();
    };

    document.getElementById('sel-theme').addEventListener('change', updateUI);
    document.getElementById('sel-font').addEventListener('change', updateUI);
    document.getElementById('btn-back').addEventListener('click', renderMainMenu);
}

function renderGameControls() {
    uiLayer.innerHTML = `
        <div class="screen">
            <div class="game-top-spacer"></div>
            <div class="game-controls">
                <div class="stats-bar">
                    <span id="ui-mode">${state.mode.toUpperCase()}</span>
                    <span>TIME: <span id="ui-time">${state.timeLeft}</span>s</span>
                </div>
                
                <div class="slider-group">
                    <div class="slider-row">
                        <span class="slider-label">HUE</span>
                        <input type="range" id="hue-slider" min="0" max="360" value="${state.currentGuess.h}">
                    </div>
                    <div class="slider-row">
                        <span class="slider-label">SAT</span>
                        <input type="range" id="sat-slider" min="0" max="100" value="${state.currentGuess.s}">
                    </div>
                    <div class="slider-row">
                        <span class="slider-label">LGT</span>
                        <input type="range" id="lgt-slider" min="0" max="100" value="${state.currentGuess.l}">
                    </div>
                </div>

                <button class="btn btn-primary" id="btn-submit" style="width: 100%;">LOCK COLOR</button>
            </div>
        </div>
    `;

    const updateColor = () => {
        state.currentGuess = {
            h: parseInt(document.getElementById('hue-slider').value),
            s: parseInt(document.getElementById('sat-slider').value),
            l: parseInt(document.getElementById('lgt-slider').value)
        };
        // Update user color rect in Phaser, but keep it hidden until reveal
    };

    document.getElementById('hue-slider').addEventListener('input', updateColor);
    document.getElementById('sat-slider').addEventListener('input', updateColor);
    document.getElementById('lgt-slider').addEventListener('input', updateColor);
    document.getElementById('btn-submit').addEventListener('click', submitGuess);
}

// --- Game Logic ---
function startGame(mode) {
    state.mode = mode;
    state.timeLeft = state.timeLimit;
    state.currentGuess = { h: 180, s: 50, l: 50 };

    if (mode === 'daily') {
        state.targetColor = { ...state.dailyColor };
    } else {
        state.targetColor = { h: Math.floor(Math.random() * 360), s: Math.floor(Math.random() * 60) + 40, l: Math.floor(Math.random() * 60) + 20 };
    }

    gameScene.setupRound(state.targetColor);
    renderGameControls();
    
    clearInterval(state.timerInt);
    state.timerInt = setInterval(() => {
        state.timeLeft--;
        const timeEl = document.getElementById('ui-time');
        if (timeEl) timeEl.innerText = state.timeLeft;

        if (state.timeLeft <= 0) submitGuess();
    }, 1000);
}

function submitGuess() {
    clearInterval(state.timerInt);
    const score = calculateDelta(state.targetColor, state.currentGuess);
    
    // Trigger Phaser Reveal Animation
    gameScene.reveal(state.currentGuess, score, () => {
        // Callback after animation
        uiLayer.innerHTML = `
            <div class="screen menu-screen">
                <h2>DELTA SCORE: ${score}</h2>
                <p>Target: H${state.targetColor.h} S${state.targetColor.s} L${state.targetColor.l}</p>
                <p>Guess: H${state.currentGuess.h} S${state.currentGuess.s} L${state.currentGuess.l}</p>
                <button class="btn" id="btn-done">CONTINUE</button>
            </div>
        `;
        
        document.getElementById('btn-done').addEventListener('click', () => {
            if (state.mode === 'daily') {
                state.hasPlayedDaily = true;
                window.parent.postMessage({ type: 'SUBMIT_DAILY_SCORE', score: score }, '*');
            }
            renderMainMenu();
        });
    });
}

// --- Phaser Engine Integration ---
let gameScene;

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.targetRect = null;
        this.guessRect = null;
        this.deltaText = null;
    }

    create() {
        gameScene = this;
        this.cameras.main.setBackgroundColor('#00000000');
        
        // Target takes full width initially
        this.targetRect = this.add.rectangle(0, 0, 0, 0, 0xffffff).setOrigin(0, 0);
        
        // Guess rect starts hidden off-screen
        this.guessRect = this.add.rectangle(0, 0, 0, 0, 0xffffff).setOrigin(0, 0);
        this.guessRect.setVisible(false);

        // Delta visualization text
        this.deltaText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '', {
            fontFamily: 'monospace',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.scale.on('resize', this.resize, this);
    }

    resetCanvas() {
        this.targetRect.setVisible(false);
        this.guessRect.setVisible(false);
        this.deltaText.setAlpha(0);
    }

    setupRound(targetHSL) {
        const hex = hslToHex(targetHSL.h, targetHSL.s, targetHSL.l);
        this.targetRect.setFillStyle(parseInt(hex.replace('#', '0x')));
        
        // Fill full width for target color observation
        this.targetRect.setPosition(0, 0);
        this.targetRect.setSize(this.scale.width, this.scale.height);
        this.targetRect.setVisible(true);
        
        this.guessRect.setVisible(false);
        this.deltaText.setAlpha(0);
    }

    reveal(guessHSL, deltaScore, onComplete) {
        const guessHex = hslToHex(guessHSL.h, guessHSL.s, guessHSL.l);
        this.guessRect.setFillStyle(parseInt(guessHex.replace('#', '0x')));
        this.guessRect.setVisible(true);

        const halfWidth = this.scale.width / 2;
        
        // Setup positions for sliding in
        this.guessRect.setPosition(this.scale.width, 0);
        this.guessRect.setSize(halfWidth, this.scale.height);

        // Tween 1: Split screen
        this.tweens.add({
            targets: this.targetRect,
            width: halfWidth,
            duration: 600,
            ease: 'Cubic.easeOut'
        });

        this.tweens.add({
            targets: this.guessRect,
            x: halfWidth,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // Tween 2: Pop the Delta Score text
                this.deltaText.setText(deltaScore.toString());
                this.deltaText.setPosition(this.scale.width / 2, this.scale.height / 2);
                
                this.tweens.add({
                    targets: this.deltaText,
                    alpha: 1,
                    scale: { from: 0.5, to: 1.2 },
                    yoyo: true,
                    hold: 1000,
                    duration: 400,
                    ease: 'Back.easeOut',
                    onComplete: onComplete
                });
            }
        });
    }

    resize(gameSize) {
        if (this.targetRect && this.targetRect.visible && !this.guessRect.visible) {
            this.targetRect.setSize(gameSize.width, gameSize.height);
        } else if (this.targetRect && this.guessRect.visible) {
            const halfWidth = gameSize.width / 2;
            this.targetRect.setSize(halfWidth, gameSize.height);
            this.guessRect.setPosition(halfWidth, 0);
            this.guessRect.setSize(halfWidth, gameSize.height);
        }
    }
}

const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-canvas-container',
    width: '100%',
    height: '100%',
    transparent: true,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: MainScene
};

new Phaser.Game(phaserConfig);
applySettings();
