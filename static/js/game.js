document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       GAME CONFIGURATION
    ========================================= */

    const TOTAL_ROUNDS = 5;
    const savedSpeed = KolorlyApp.getSetting(KolorlyApp.STORAGE_KEYS.gameSpeed, 30);
    const ROUND_TIME = parseInt(savedSpeed, 10);
    const TRANSITION_DURATION = 1500;

    const COLOR_FAMILIES = [
        "Red",
        "Orange",
        "Yellow",
        "Green",
        "Cyan",
        "Blue",
        "Purple",
        "Magenta"
    ];


    /* =========================================
       DOM ELEMENTS
    ========================================= */

    const accuracyElement = document.getElementById("accuracy");
    const roundElement = document.getElementById("round");
    const timerElement = document.getElementById("timer");

    const targetColorElement = document.getElementById("targetColor");
    const selectionColorElement = document.getElementById("selectionColor");
    const selectionStatusElement = document.getElementById("selectionStatus");

    const paletteCanvas = document.getElementById("colorPalette");
    const paletteContainer = document.querySelector(".palette-container");
    const paletteSelectionMarker = document.getElementById(
        "paletteSelectionMarker"
    );

    const submitGuessButton = document.getElementById("submitGuess");
    const backButton = document.getElementById("backButton");

    const roundResult = document.getElementById("roundResult");
    const roundResultAccuracy = document.getElementById(
        "roundResultAccuracy"
    );
    const roundResultMessage = document.getElementById(
        "roundResultMessage"
    );

    const roundTransition = document.getElementById(
        "roundTransition"
    );

    const transitionTargetColor = document.getElementById(
        "transitionTargetColor"
    );

    const transitionSelectionColor = document.getElementById(
        "transitionSelectionColor"
    );

    const roundAccuracyElement = document.getElementById(
        "roundAccuracy"
    );

    const roundFeedbackElement = document.getElementById(
        "roundFeedback"
    );

    const transitionMessage = document.getElementById(
        "transitionMessage"
    );

    const timeUpOverlay = document.getElementById(
        "timeUpOverlay"
    );

    const exitModal = document.getElementById(
        "exitModal"
    );

    const confirmExitButton = document.getElementById(
        "confirmExit"
    );

    const cancelExitButton = document.getElementById(
        "cancelExit"
    );

    const gameCompleteModal = document.getElementById(
        "gameCompleteModal"
    );

    const finalAccuracyElement = document.getElementById(
        "finalAccuracy"
    );

    const finalPerformanceMessage = document.getElementById(
        "finalPerformanceMessage"
    );

    const bestAccuracyElement = document.getElementById(
        "bestAccuracy"
    );

    const lowestAccuracyElement = document.getElementById(
        "lowestAccuracy"
    );

    const roundsPlayedElement = document.getElementById(
        "roundsPlayed"
    );

    const performanceBarFill = document.getElementById(
        "performanceBarFill"
    );

    const strongestColorElement = document.getElementById(
        "strongestColor"
    );

    const strongestColorAccuracyElement = document.getElementById(
        "strongestColorAccuracy"
    );

    const weakestColorElement = document.getElementById(
        "weakestColor"
    );

    const weakestColorAccuracyElement = document.getElementById(
        "weakestColorAccuracy"
    );

    const colorPerformanceList = document.getElementById(
        "colorPerformanceList"
    );

    const playAgainButton = document.getElementById(
        "playAgain"
    );

    const exitGameButton = document.getElementById(
        "exitGame"
    );


    /* =========================================
       GAME STATE
    ========================================= */

    let currentRound = 1;
    let timeRemaining = ROUND_TIME;
    let timerInterval = null;

    let targetColor = null;
    let selectedColor = null;

    let roundLocked = false;
    let gameComplete = false;

    const roundResults = [];


    /* =========================================
       CANVAS
    ========================================= */

    const ctx = paletteCanvas
        ? paletteCanvas.getContext("2d")
        : null;


    /* =========================================
       UTILITY FUNCTIONS
    ========================================= */

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }


    function randomInteger(min, max) {
        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    }


    function rgbToString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }


    function rgbToHex(color) {

        return "#" + [color.r, color.g, color.b]
            .map(value =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("");

    }


    function hexToRgb(hex) {

        const value = hex.replace("#", "");

        return {
            r: parseInt(value.substring(0, 2), 16),
            g: parseInt(value.substring(2, 4), 16),
            b: parseInt(value.substring(4, 6), 16)
        };

    }


    /* =========================================
       COLOR GENERATION
    ========================================= */

    function generateTargetColor() {

        const hue = randomInteger(0, 359);
        const saturation = randomInteger(55, 90);
        const lightness = randomInteger(35, 70);

        return hslToRgb(
            hue,
            saturation,
            lightness
        );

    }


    function hslToRgb(h, s, l) {

        s /= 100;
        l /= 100;

        const c =
            (1 - Math.abs(2 * l - 1)) * s;

        const x =
            c * (
                1 -
                Math.abs((h / 60) % 2 - 1)
            );

        const m = l - c / 2;

        let r = 0;
        let g = 0;
        let b = 0;


        if (h < 60) {
            r = c;
            g = x;
        } else if (h < 120) {
            r = x;
            g = c;
        } else if (h < 180) {
            g = c;
            b = x;
        } else if (h < 240) {
            g = x;
            b = c;
        } else if (h < 300) {
            r = x;
            b = c;
        } else {
            r = c;
            b = x;
        }


        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };

    }


    /* =========================================
       COLOR FAMILY
    ========================================= */

    function getColorFamily(color) {

        const max = Math.max(
            color.r,
            color.g,
            color.b
        );

        const min = Math.min(
            color.r,
            color.g,
            color.b
        );

        const delta = max - min;

        if (delta === 0) {
            return "Red";
        }


        let hue;


        if (max === color.r) {

            hue =
                60 *
                (
                    ((color.g - color.b) / delta) % 6
                );

        } else if (max === color.g) {

            hue =
                60 *
                (
                    (color.b - color.r) / delta + 2
                );

        } else {

            hue =
                60 *
                (
                    (color.r - color.g) / delta + 4
                );

        }


        if (hue < 0) {
            hue += 360;
        }


        if (hue < 15 || hue >= 345) {
            return "Red";
        }

        if (hue < 45) {
            return "Orange";
        }

        if (hue < 75) {
            return "Yellow";
        }

        if (hue < 165) {
            return "Green";
        }

        if (hue < 195) {
            return "Cyan";
        }

        if (hue < 255) {
            return "Blue";
        }

        if (hue < 315) {
            return "Purple";
        }

        return "Magenta";

    }


    /* =========================================
       ACCURACY
    ========================================= */

    function calculateAccuracy(target, selection) {

        const distance = Math.sqrt(
            Math.pow(target.r - selection.r, 2) +
            Math.pow(target.g - selection.g, 2) +
            Math.pow(target.b - selection.b, 2)
        );


        const maximumDistance =
            Math.sqrt(
                Math.pow(255, 2) * 3
            );


        const accuracy =
            100 -
            (distance / maximumDistance) * 100;


        return clamp(
            Math.round(accuracy * 100) / 100,
            0,
            100
        );

    }


    function getAccuracyMessage(accuracy) {

        if (accuracy >= 95) {
            return "Excellent Match";
        }

        if (accuracy >= 85) {
            return "Very Good Match";
        }

        if (accuracy >= 70) {
            return "Good Match";
        }

        if (accuracy >= 50) {
            return "Close Match";
        }

        return "Keep Practicing";

    }


    /* =========================================
       PALETTE
    ========================================= */

    function resizePalette() {

        if (!paletteCanvas || !paletteContainer) {
            return;
        }


        const rect =
            paletteContainer.getBoundingClientRect();

        const width =
            Math.max(
                Math.floor(rect.width),
                280
            );

        const height =
            window.innerWidth <= 450
                ? 260
                : window.innerWidth <= 700
                    ? 300
                    : 360;


        const devicePixelRatio =
            window.devicePixelRatio || 1;


        paletteCanvas.width =
            width * devicePixelRatio;

        paletteCanvas.height =
            height * devicePixelRatio;


        paletteCanvas.style.width =
            `${width}px`;

        paletteCanvas.style.height =
            `${height}px`;


        ctx.setTransform(
            devicePixelRatio,
            0,
            0,
            devicePixelRatio,
            0,
            0
        );


        drawPalette(
            width,
            height
        );

    }


    function drawPalette(width, height) {

        if (!ctx) {
            return;
        }


        const imageData =
            ctx.createImageData(
                width,
                height
            );

        const data = imageData.data;


        for (let y = 0; y < height; y++) {

            for (let x = 0; x < width; x++) {

                const hue =
                    (x / width) * 360;

                const saturation =
                    100;

                const lightness =
                    100 - (y / height) * 100;


                const color =
                    hslToRgb(
                        hue,
                        saturation,
                        lightness
                    );


                const index =
                    (y * width + x) * 4;


                data[index] = color.r;
                data[index + 1] = color.g;
                data[index + 2] = color.b;
                data[index + 3] = 255;

            }

        }


        ctx.putImageData(
            imageData,
            0,
            0
        );

    }


    function updateSelectionMarker(x, y) {

        if (!paletteSelectionMarker) {
            return;
        }


        paletteSelectionMarker.style.left =
            `${x}px`;

        paletteSelectionMarker.style.top =
            `${y}px`;

        paletteSelectionMarker.classList.add(
            "visible"
        );

    }


    function selectPaletteColor(event) {

        if (
            roundLocked ||
            gameComplete ||
            !paletteCanvas
        ) {
            return;
        }


        const rect =
            paletteCanvas.getBoundingClientRect();


        const x =
            clamp(
                event.clientX - rect.left,
                0,
                rect.width
            );

        const y =
            clamp(
                event.clientY - rect.top,
                0,
                rect.height
            );


        const hue =
            (x / rect.width) * 360;


        const saturation = 100;

        const lightness =
            100 -
            (y / rect.height) * 100;


        selectedColor =
            hslToRgb(
                hue,
                saturation,
                lightness
            );


        updateSelectionMarker(
            x,
            y
        );


        updateSelectionPreview();

    }


    function updateSelectionPreview() {

        if (!selectedColor) {
            return;
        }


        const color =
            rgbToString(selectedColor);


        selectionColorElement.style.backgroundColor =
            color;


        selectionColorElement.classList.add(
            "has-selection"
        );


        selectionStatusElement.textContent =
            "Color selected";


        selectionStatusElement.classList.add(
            "selected"
        );

    }


    /* =========================================
       ROUND INITIALIZATION
    ========================================= */

    function startRound() {

        roundLocked = false;

        selectedColor = null;

        timeRemaining = ROUND_TIME;


        targetColor =
            generateTargetColor();


        targetColorElement.style.backgroundColor =
            rgbToString(targetColor);


        selectionColorElement.style.backgroundColor =
            "#e5e7eb";


        selectionColorElement.classList.remove(
            "has-selection"
        );


        selectionStatusElement.textContent =
            "Select a color";


        selectionStatusElement.classList.remove(
            "selected"
        );


        if (paletteSelectionMarker) {

            paletteSelectionMarker.classList.remove(
                "visible"
            );

        }


        roundElement.textContent =
            `${currentRound}/${TOTAL_ROUNDS}`;


        accuracyElement.textContent =
            "--";


        timerElement.textContent =
            timeRemaining;


        resetTimerState();


        hideRoundResult();


        resizePalette();

        startTimer();

    }


    /* =========================================
       TIMER
    ========================================= */

    function startTimer() {

        stopTimer();


        timerInterval =
            setInterval(() => {

                if (roundLocked || gameComplete) {
                    return;
                }


                timeRemaining--;


                timerElement.textContent =
                    timeRemaining;


                updateTimerState();


                if (timeRemaining <= 0) {

                    stopTimer();

                    handleTimeUp();

                }

            }, 1000);

    }


    function stopTimer() {

        if (timerInterval !== null) {

            clearInterval(
                timerInterval
            );

            timerInterval = null;

        }

    }


    function updateTimerState() {

        const statusItem =
            timerElement.closest(
                ".status-item"
            );


        if (!statusItem) {
            return;
        }


        statusItem.classList.remove(
            "timer-warning",
            "timer-critical"
        );


        if (
            timeRemaining <= 5 &&
            timeRemaining > 0
        ) {

            statusItem.classList.add(
                "timer-critical"
            );

        } else if (
            timeRemaining <= 10
        ) {

            statusItem.classList.add(
                "timer-warning"
            );

        }

    }


    function resetTimerState() {

        const statusItem =
            timerElement.closest(
                ".status-item"
            );


        if (!statusItem) {
            return;
        }


        statusItem.classList.remove(
            "timer-warning",
            "timer-critical"
        );

    }


    /* =========================================
       SUBMIT / TIME UP
    ========================================= */

    function submitGuess() {

        if (
            roundLocked ||
            gameComplete ||
            !selectedColor
        ) {
            return;
        }


        stopTimer();

        completeRound(
            false
        );

    }


    function handleTimeUp() {

        if (
            roundLocked ||
            gameComplete
        ) {
            return;
        }


        roundLocked = true;


        showTimeUpOverlay();


        setTimeout(() => {

            hideTimeUpOverlay();

            completeRound(
                true
            );

        }, 900);

    }


    function completeRound(timeExpired) {

        if (roundLocked && !timeExpired) {
            return;
        }


        roundLocked = true;

        stopTimer();


        let accuracy = 0;


        if (selectedColor) {

            accuracy =
                calculateAccuracy(
                    targetColor,
                    selectedColor
                );

        }


        accuracyElement.textContent =
            `${Math.round(accuracy)}%`;


        const family =
            getColorFamily(
                targetColor
            );


        roundResults.push({
            round: currentRound,
            accuracy,
            family,
            target: { ...targetColor },
            selection: selectedColor
                ? { ...selectedColor }
                : null,
            timedOut: timeExpired
        });


        showRoundResult(
            accuracy,
            timeExpired
        );


        setTimeout(() => {

            hideRoundResult();


            if (
                currentRound >= TOTAL_ROUNDS
            ) {

                finishGame();

            } else {

                currentRound++;

                animateNextRound();

            }

        }, TRANSITION_DURATION);

    }


    /* =========================================
       ROUND RESULT UI
    ========================================= */

    function showRoundResult(
        accuracy,
        timeExpired
    ) {

        roundResultAccuracy.textContent =
            `${Math.round(accuracy)}%`;


        roundResultMessage.textContent =
            timeExpired
                ? "Time's Up"
                : getAccuracyMessage(
                    accuracy
                );


        roundResult.classList.add(
            "visible"
        );

        roundResult.setAttribute(
            "aria-hidden",
            "false"
        );


        transitionTargetColor.style.backgroundColor =
            rgbToString(targetColor);


        if (selectedColor) {

            transitionSelectionColor.style.backgroundColor =
                rgbToString(
                    selectedColor
                );

        } else {

            transitionSelectionColor.style.backgroundColor =
                "#e5e7eb";

        }


        roundAccuracyElement.textContent =
            `${Math.round(accuracy)}%`;


        roundFeedbackElement.textContent =
            timeExpired
                ? "Time's Up"
                : getAccuracyMessage(
                    accuracy
                );


        transitionMessage.textContent =
            currentRound < TOTAL_ROUNDS
                ? "Next Round..."
                : "Final Results...";


        openModal(
            roundTransition
        );

    }


    function hideRoundResult() {

        roundResult.classList.remove(
            "visible"
        );

        roundResult.setAttribute(
            "aria-hidden",
            "true"
        );

        closeModal(
            roundTransition
        );

    }


    function animateNextRound() {

        const gameLayout =
            document.querySelector(
                ".game-layout"
            );


        if (gameLayout) {

            gameLayout.classList.remove(
                "round-transition"
            );


            void gameLayout.offsetWidth;


            gameLayout.classList.add(
                "round-transition"
            );

        }


        startRound();

    }


    /* =========================================
       TIME UP UI
    ========================================= */

    function showTimeUpOverlay() {

        timerElement.classList.add(
            "timer-expired"
        );


        openModal(
            timeUpOverlay
        );

    }


    function hideTimeUpOverlay() {

        timerElement.classList.remove(
            "timer-expired"
        );


        closeModal(
            timeUpOverlay
        );

    }


    /* =========================================
       MODALS
    ========================================= */

    function openModal(modal) {

        if (!modal) {
            return;
        }


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* =========================================
       EXIT GAME
    ========================================= */

    function requestExit() {

        stopTimer();

        openModal(
            exitModal
        );

    }


    function cancelExit() {

        closeModal(
            exitModal
        );


        if (
            !gameComplete &&
            !roundLocked
        ) {

            startTimer();

        }

    }


    function confirmExit() {

        stopTimer();

        window.location.href = "/";

    }


    /* =========================================
       PERFORMANCE
    ========================================= */

    function calculateGamePerformance() {

        if (roundResults.length === 0) {
            return null;
        }


        const accuracies =
            roundResults.map(
                result => result.accuracy
            );


        const total =
            accuracies.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const average =
            total /
            accuracies.length;


        const best =
            Math.max(
                ...accuracies
            );


        const lowest =
            Math.min(
                ...accuracies
            );


        return {
            average,
            best,
            lowest
        };

    }


    function getPerformanceMessage(
        accuracy
    ) {

        if (accuracy >= 95) {
            return "Excellent Color Perception";
        }

        if (accuracy >= 85) {
            return "Very Good Color Perception";
        }

        if (accuracy >= 70) {
            return "Good Color Perception";
        }

        if (accuracy >= 50) {
            return "Developing Color Perception";
        }

        return "Keep Practicing";

    }


    /* =========================================
       COLOR PERFORMANCE
    ========================================= */

    function calculateColorPerformance() {

        const groups = {};


        COLOR_FAMILIES.forEach(
            family => {

                groups[family] = {
                    total: 0,
                    count: 0
                };

            }
        );


        roundResults.forEach(
            result => {

                if (
                    !groups[result.family]
                ) {

                    groups[result.family] = {
                        total: 0,
                        count: 0
                    };

                }


                groups[result.family].total +=
                    result.accuracy;


                groups[result.family].count++;

            }
        );


        return Object.entries(groups)
            .filter(
                ([, data]) =>
                    data.count > 0
            )
            .map(
                ([family, data]) => ({

                    family,

                    accuracy:
                        data.total /
                        data.count,

                    count:
                        data.count

                })
            )
            .sort(
                (a, b) =>
                    b.accuracy -
                    a.accuracy
            );

    }


    function renderColorPerformance() {

        const performance =
            calculateColorPerformance();


        colorPerformanceList.innerHTML =
            "";


        if (performance.length === 0) {

            strongestColorElement.textContent =
                "--";

            strongestColorAccuracyElement.textContent =
                "--";

            weakestColorElement.textContent =
                "--";

            weakestColorAccuracyElement.textContent =
                "--";

            return;

        }


        const strongest =
            performance[0];


        const weakest =
            performance[
                performance.length - 1
            ];


        strongestColorElement.textContent =
            strongest.family;


        strongestColorAccuracyElement.textContent =
            `${Math.round(
                strongest.accuracy
            )}%`;


        weakestColorElement.textContent =
            weakest.family;


        weakestColorAccuracyElement.textContent =
            `${Math.round(
                weakest.accuracy
            )}%`;


        performance.forEach(
            result => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "color-performance-row";


                row.innerHTML = `
                    <span class="color-performance-name">
                        ${result.family}
                    </span>

                    <div class="color-performance-bar">
                        <div
                            class="color-performance-fill"
                            style="width: ${result.accuracy}%">
                        </div>
                    </div>

                    <span class="color-performance-score">
                        ${Math.round(result.accuracy)}%
                    </span>
                `;


                colorPerformanceList.appendChild(
                    row
                );

            }
        );

    }


    /* =========================================
       GAME COMPLETE
    ========================================= */

    function finishGame() {

        gameComplete = true;

        roundLocked = true;

        stopTimer();


        const performance =
            calculateGamePerformance();


        if (!performance) {
            return;
        }


        finalAccuracyElement.textContent =
            `${Math.round(
                performance.average
            )}%`;


        finalPerformanceMessage.textContent =
            getPerformanceMessage(
                performance.average
            );


        bestAccuracyElement.textContent =
            `${Math.round(
                performance.best
            )}%`;


        lowestAccuracyElement.textContent =
            `${Math.round(
                performance.lowest
            )}%`;


        roundsPlayedElement.textContent =
            roundResults.length;


        requestAnimationFrame(() => {

            performanceBarFill.style.width =
                `${performance.average}%`;

        });


        renderColorPerformance();


        closeModal(
            roundTransition
        );


        openModal(
            gameCompleteModal
        );

    }


    /* =========================================
       RESTART GAME
    ========================================= */

    function restartGame() {

        closeModal(
            gameCompleteModal
        );

        closeModal(
            exitModal
        );


        currentRound = 1;

        timeRemaining = ROUND_TIME;

        gameComplete = false;

        roundLocked = false;


        roundResults.length = 0;


        performanceBarFill.style.width =
            "0%";


        startRound();

    }


    /* =========================================
       EVENT LISTENERS
    ========================================= */

    if (paletteCanvas) {

        paletteCanvas.addEventListener(
            "click",
            selectPaletteColor
        );


        paletteCanvas.addEventListener(
            "pointerdown",
            selectPaletteColor
        );

    }


    if (submitGuessButton) {

        submitGuessButton.addEventListener(
            "click",
            submitGuess
        );

    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            requestExit
        );

    }


    if (confirmExitButton) {

        confirmExitButton.addEventListener(
            "click",
            confirmExit
        );

    }


    if (cancelExitButton) {

        cancelExitButton.addEventListener(
            "click",
            cancelExit
        );

    }


    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            restartGame
        );

    }


    if (exitGameButton) {

        exitGameButton.addEventListener(
            "click",
            confirmExit
        );

    }


    window.addEventListener(
        "resize",
        resizePalette
    );


    /* =========================================
       MODAL BACKDROP HANDLING
    ========================================= */

    [
        exitModal,
        roundTransition,
        timeUpOverlay,
        gameCompleteModal
    ].forEach(modal => {

        if (!modal) {
            return;
        }


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target !== modal
                ) {
                    return;
                }


                if (
                    modal === exitModal
                ) {

                    cancelExit();

                }

            }
        );

    });


    /* =========================================
       KEYBOARD SUPPORT
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                exitModal.classList.contains(
                    "active"
                )
            ) {

                cancelExit();

            }

        }
    );


    /* =========================================
       INITIALIZE
    ========================================= */

    if (
        paletteCanvas &&
        targetColorElement &&
        selectionColorElement
    ) {

        startRound();

    }

});   LANDING PAGE
========================================= */

.hero {
    width: min(760px, 90%);
    min-height: 100vh;
    margin: 0 auto;
    padding: 40px 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
}

.hero h1 {
    margin: 0 0 14px;

    font-size: clamp(2rem, 5vw, 3.4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
}

.hero p {
    max-width: 540px;
    margin: 0;

    font-size: 1.05rem;
    color: #5b6573;
}

.hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;

    margin-top: 34px;
}


/* =========================================
   BUTTONS
========================================= */

.btn {
    min-width: 150px;
    min-height: 44px;

    padding: 10px 22px;

    border: 1px solid transparent;
    border-radius: 8px;

    font-size: 0.95rem;
    font-weight: 600;

    transition:
        transform 160ms ease,
        background-color 160ms ease,
        border-color 160ms ease,
        box-shadow 160ms ease;
}

.btn:hover {
    transform: translateY(-1px);
}

.btn:focus-visible {
    outline: 3px solid #9aa7b8;
    outline-offset: 3px;
}

.btn-primary {
    background: #243447;
    color: #ffffff;
}

.btn-primary:hover {
    background: #1b2836;
}

.btn-secondary {
    background: #ffffff;
    color: #243447;
    border-color: #c9ced6;
}

.btn-secondary:hover {
    background: #eef1f4;
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
}


/* =========================================
   GAME LAYOUT
========================================= */

.game-layout {
    width: min(900px, 94%);
    min-height: calc(100vh - 20px);

    margin: 0 auto;
    padding: 18px 0 24px;

    display: flex;
    flex-direction: column;
}


/* =========================================
   GAME STATUS
========================================= */

.status-bar {
    width: min(560px, 100%);
    margin: 0 auto 18px;

    display: grid;
    grid-template-columns: repeat(3, 1fr);

    border: 1px solid #d9dde3;
    border-radius: 9px;

    background: #ffffff;

    flex-shrink: 0;
}

.status-item {
    min-width: 0;

    padding: 8px 10px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
}

.status-item + .status-item {
    border-left: 1px solid #e2e5e9;
}

.status-label {
    margin-bottom: 1px;

    color: #687383;

    font-size: 0.68rem;
    font-weight: 600;

    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.status-value {
    font-size: 1rem;
    font-weight: 700;
}


/* =========================================
   TIMER STATES
========================================= */

.status-item.timer-warning .status-value {
    animation: timerPulse 900ms ease-in-out infinite;
}

.status-item.timer-critical .status-value {
    animation: timerCritical 500ms ease-in-out infinite;
}

@keyframes timerPulse {
    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.08);
    }
}

@keyframes timerCritical {
    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.16);
    }
}


/* =========================================
   COLOR COMPARISON
========================================= */

.comparison-section {
    width: min(700px, 100%);
    margin: 0 auto;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;

    align-items: start;

    flex-shrink: 0;
}

.comparison-card {
    min-width: 0;

    padding: 12px 16px 14px;

    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;

    background: #ffffff;
    border: 1px solid #d9dde3;
    border-radius: 9px;
}

.section-title {
    margin: 0 0 9px;

    color: #293442;

    font-size: 0.76rem;
    font-weight: 700;

    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.target-color,
.selection-preview {
    width: 145px;
    height: 145px;

    flex-shrink: 0;

    border-radius: 7px;
    border: 1px solid rgba(31, 41, 51, 0.14);

    background: #e5e7eb;
}

.selection-preview {
    transition:
        transform 180ms ease,
        box-shadow 180ms ease;
}

.selection-preview.has-selection {
    transform: scale(1.02);

    box-shadow:
        0 0 0 3px #d9dde3;
}

.selection-status {
    min-height: 18px;

    margin-top: 5px;

    color: #687383;

    font-size: 0.75rem;
}

.selection-status.selected {
    color: #293442;
    font-weight: 600;
}



/* =========================================
   PALETTE
========================================= */

.palette-section {
    width: min(700px, 100%);
    margin: 16px auto 0;

    text-align: center;

    flex-shrink: 0;
}

.palette-section .section-title {
    margin-bottom: 8px;
}

.palette-wrapper {
    width: 100%;
}

.palette-container {
    position: relative;

    width: 100%;
    max-width: 700px;
    height: 250px;

    margin: 0 auto;

    overflow: hidden;

    border: 1px solid #cfd5dc;
    border-radius: 9px;

    background: #ffffff;

    box-shadow:
        0 2px 7px rgba(31, 41, 51, 0.06);
}

.palette-canvas {
    display: block;

    width: 100%;
    height: 250px;

    cursor: crosshair;
}

.palette-canvas:focus-visible {
    outline: 3px solid #9aa7b8;
    outline-offset: -3px;
}


/* =========================================
   PALETTE SELECTION MARKER
========================================= */

.palette-selection-marker {
    position: absolute;

    width: 17px;
    height: 17px;

    display: none;

    border: 3px solid #ffffff;
    border-radius: 50%;

    box-shadow:
        0 0 0 2px rgba(31, 41, 51, 0.65),
        0 2px 5px rgba(31, 41, 51, 0.25);

    pointer-events: none;

    transform: translate(-50%, -50%);

    transition:
        left 120ms ease,
        top 120ms ease;
}

.palette-selection-marker.visible {
    display: block;

    animation: markerAppear 160ms ease-out;
}

@keyframes markerAppear {
    from {
        opacity: 0;

        transform:
            translate(-50%, -50%)
            scale(0.65);
    }

    to {
        opacity: 1;

        transform:
            translate(-50%, -50%)
            scale(1);
    }
}


/* =========================================
   GAME ACTIONS
========================================= */

.game-actions {
    margin: 14px auto 0;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 14px;

    flex-shrink: 0;
}


/* =========================================
   ROUND RESULT
========================================= */

.round-result {
    width: min(500px, 100%);

    margin: 14px auto 0;
    padding: 14px 18px;

    text-align: center;

    background: #ffffff;
    border: 1px solid #d9dde3;
    border-radius: 9px;

    opacity: 0;

    transform: translateY(8px);

    pointer-events: none;

    transition:
        opacity 220ms ease,
        transform 220ms ease;
}

.round-result.visible {
    opacity: 1;

    transform: translateY(0);
}

.round-result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.round-result-label {
    margin-bottom: 3px;

    color: #687383;

    font-size: 0.7rem;
    font-weight: 700;

    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.round-result-accuracy {
    font-size: 1.8rem;
    line-height: 1.1;
}

.round-result-message {
    margin-top: 3px;

    color: #5b6573;

    font-size: 0.82rem;
}


/* =========================================
   MODALS
========================================= */

.modal-overlay {
    position: fixed;
    inset: 0;

    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(20, 27, 36, 0.52);

    opacity: 0;
    visibility: hidden;

    pointer-events: none;

    transition:
        opacity 180ms ease,
        visibility 180ms ease;
}

.modal-overlay.active {
    opacity: 1;

    visibility: visible;

    pointer-events: auto;
}

.modal {
    width: min(520px, 100%);
    max-height: 90vh;

    overflow-y: auto;

    padding: 26px;

    background: #ffffff;

    border: 1px solid #d9dde3;
    border-radius: 11px;

    box-shadow:
        0 16px 45px rgba(20, 27, 36, 0.18);

    transform:
        translateY(12px)
        scale(0.98);

    transition:
        transform 180ms ease;
}

.modal-overlay.active .modal {
    transform:
        translateY(0)
        scale(1);
}

.modal-title {
    margin: 0 0 18px;

    color: #293442;

    font-size: 1.25rem;
    font-weight: 700;

    text-align: center;
}

.modal-content {
    text-align: center;
}

.text-muted {
    color: #687383;

    text-align: center;
}


/* =========================================
   RESULT STATISTICS
========================================= */

.result-stats {
    display: grid;
    gap: 8px;
}

.result-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 9px 12px;

    background: #f4f5f7;

    border-radius: 7px;
}

.result-stat span {
    color: #5b6573;

    font-size: 0.85rem;
}

.result-stat strong {
    color: #293442;

    font-size: 0.95rem;
}

.modal-actions {
    margin-top: 20px;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 12px;
}


/* =========================================
   RESULT COLORS
========================================= */

.result-colors {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    margin-bottom: 16px;
}

.result-color-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 6px;

    color: #687383;

    font-size: 0.76rem;
}

.result-color {
    width: 90px;
    height: 90px;

    border: 1px solid rgba(31, 41, 51, 0.14);

    border-radius: 7px;
}

.round-feedback {
    margin-top: 10px;

    font-weight: 600;
}

.time-up-modal {
    text-align: center;
}

.time-up-modal .modal-title {
    margin-bottom: 8px;
}


/* =========================================
   GAME COMPLETE
========================================= */

.game-complete-modal {
    width: min(600px, 100%);
}

.performance-summary {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 14px;

    text-align: center;
}

.performance-label {
    color: #687383;

    font-size: 0.72rem;
    font-weight: 700;

    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.performance-message {
    margin-top: 3px;

    font-size: 1.05rem;
}

.final-accuracy {
    margin-top: 7px;

    font-size: 2.5rem;
    line-height: 1;
}


/* =========================================
   PERFORMANCE BAR
========================================= */

.performance-bar {
    width: 100%;
    height: 8px;

    margin-bottom: 20px;

    overflow: hidden;

    background: #e3e6ea;

    border-radius: 999px;
}

.performance-bar-fill {
    width: 0;
    height: 100%;

    border-radius: inherit;

    background: #293442;

    transition:
        width 700ms ease;
}


/* =========================================
   COLOR PERCEPTION
========================================= */

.color-performance {
    margin-top: 22px;
    padding-top: 20px;

    border-top: 1px solid #e1e4e8;
}

.color-performance .section-title {
    text-align: center;
}

.perception-highlight {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;

    margin-bottom: 15px;
}

.perception-result {
    padding: 11px;

    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;

    background: #f4f5f7;

    border-radius: 8px;
}

.perception-label {
    color: #687383;

    font-size: 0.68rem;
    font-weight: 700;

    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.perception-value {
    margin-top: 3px;

    font-size: 0.95rem;
}

.perception-score {
    margin-top: 1px;

    color: #5b6573;

    font-size: 0.8rem;
}

.color-performance-list {
    display: flex;
    flex-direction: column;

    gap: 7px;
}

.color-performance-row {
    display: grid;

    grid-template-columns:
        70px
        1fr
        45px;

    align-items: center;

    gap: 9px;

    font-size: 0.78rem;
}

.color-performance-name {
    color: #4e5968;
}

.color-performance-bar {
    height: 6px;

    overflow: hidden;

    background: #e3e6ea;

    border-radius: 999px;
}

.color-performance-fill {
    height: 100%;

    background: #293442;

    border-radius: inherit;

    transition:
        width 500ms ease;
}

.color-performance-score {
    text-align: right;

    font-weight: 600;
}


/* =========================================
   TRANSITION ANIMATION
========================================= */

.game-layout.round-transition {
    animation:
        roundTransition
        450ms ease;
}

@keyframes roundTransition {
    0% {
        opacity: 1;

        transform:
            scale(1);
    }

    40% {
        opacity: 0.45;

        transform:
            scale(0.985);
    }

    100% {
        opacity: 1;

        transform:
            scale(1);
    }
}

.timer-expired {
    animation:
        timerExpired
        500ms ease;
}

@keyframes timerExpired {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    35% {
        transform: scale(1.15);
        opacity: 0.65;
    }

    70% {
        transform: scale(0.95);
        opacity: 0.85;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}


/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 700px) {

    .hero {
        min-height: 100vh;
        padding: 40px 18px;
    }

    .hero-actions {
        width: 100%;

        flex-direction: column;

        gap: 12px;

        margin-top: 28px;
    }

    .hero-actions .btn {
        width: min(280px, 100%);
    }

    .game-layout {
        width: 94%;
        min-height: auto;

        padding-top: 14px;
        padding-bottom: 24px;
    }

    .comparison-section {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .comparison-card {
        padding: 10px 14px;
    }

    .target-color,
    .selection-preview {
        width: 125px;
        height: 125px;
    }

    .palette-section {
        margin-top: 13px;
    }

    .palette-container,
    .palette-canvas {
        height: 260px;
    }

    .game-actions {
        flex-direction: column;

        margin-top: 12px;
    }

    .game-actions .btn {
        width: min(280px, 100%);
    }

    .modal {
        padding: 22px 18px;
    }

    .modal-actions {
        flex-direction: column;
    }

    .modal-actions .btn {
        width: min(280px, 100%);
    }

    .perception-highlight {
        grid-template-columns: 1fr;
    }

    .color-performance-row {
        grid-template-columns:
            65px
            1fr
            42px;

        gap: 7px;
    }
}


/* =========================================
   SMALL MOBILE
========================================= */

@media (max-width: 450px) {

    .status-bar {
        width: 100%;
    }

    .status-item {
        padding: 7px 6px;
    }

    .status-label {
        font-size: 0.62rem;
    }

    .status-value {
        font-size: 0.92rem;
    }

    .target-color,
    .selection-preview {
        width: 110px;
        height: 110px;
    }

    .palette-container,
    .palette-canvas {
        height: 230px;
    }

    .result-colors {
        gap: 8px;
    }

    .result-color {
        width: 75px;
        height: 75px;
    }
}


/* =========================================
   SHORT DESKTOP VIEWPORT
========================================= */

@media (min-width: 701px) and (max-height: 800px) {

    .game-layout {
        padding-top: 10px;
        padding-bottom: 14px;
    }

    .status-bar {
        margin-bottom: 12px;
    }

    .comparison-card {
        padding: 9px 14px 10px;
    }

    .target-color,
    .selection-preview {
        width: 120px;
        height: 120px;
    }

    .palette-section {
        margin-top: 11px;
    }

    .palette-container,
    .palette-canvas {
        height: 210px;
    }

    .game-actions {
        margin-top: 10px;
    }

    .btn {
        min-height: 40px;
        padding: 8px 20px;
    }
}


/* =========================================
   ACCESSIBILITY
========================================= */

@media (prefers-reduced-motion: reduce) {

    *,
    *::before,
    *::after {
        scroll-behavior: auto !important;

        animation-duration: 0.01ms !important;

        animation-iteration-count: 1 !important;

        transition-duration: 0.01ms !important;
    }
}

/* Dark Mode Styles */
[data-theme="dark"] body {
    background: #121824;
    color: #f4f5f7;
}
[data-theme="dark"] .comparison-card,
[data-theme="dark"] .status-bar,
[data-theme="dark"] .palette-container,
[data-theme="dark"] .modal {
    background: #1e293b;
    border-color: #334155;
    color: #f4f5f7;
}

/* Font Size Rules */
[data-font-size="small"] { font-size: 14px; }
[data-font-size="medium"] { font-size: 16px; }
[data-font-size="large"] { font-size: 18px; }    const paletteSelectionMarker = document.getElementById(
        "paletteSelectionMarker"
    );

    const submitGuessButton = document.getElementById("submitGuess");
    const backButton = document.getElementById("backButton");

    const roundResult = document.getElementById("roundResult");
    const roundResultAccuracy = document.getElementById(
        "roundResultAccuracy"
    );
    const roundResultMessage = document.getElementById(
        "roundResultMessage"
    );

    const roundTransition = document.getElementById(
        "roundTransition"
    );

    const transitionTargetColor = document.getElementById(
        "transitionTargetColor"
    );

    const transitionSelectionColor = document.getElementById(
        "transitionSelectionColor"
    );

    const roundAccuracyElement = document.getElementById(
        "roundAccuracy"
    );

    const roundFeedbackElement = document.getElementById(
        "roundFeedback"
    );

    const transitionMessage = document.getElementById(
        "transitionMessage"
    );

    const timeUpOverlay = document.getElementById(
        "timeUpOverlay"
    );

    const exitModal = document.getElementById(
        "exitModal"
    );

    const confirmExitButton = document.getElementById(
        "confirmExit"
    );

    const cancelExitButton = document.getElementById(
        "cancelExit"
    );

    const gameCompleteModal = document.getElementById(
        "gameCompleteModal"
    );

    const finalAccuracyElement = document.getElementById(
        "finalAccuracy"
    );

    const finalPerformanceMessage = document.getElementById(
        "finalPerformanceMessage"
    );

    const bestAccuracyElement = document.getElementById(
        "bestAccuracy"
    );

    const lowestAccuracyElement = document.getElementById(
        "lowestAccuracy"
    );

    const roundsPlayedElement = document.getElementById(
        "roundsPlayed"
    );

    const performanceBarFill = document.getElementById(
        "performanceBarFill"
    );

    const strongestColorElement = document.getElementById(
        "strongestColor"
    );

    const strongestColorAccuracyElement = document.getElementById(
        "strongestColorAccuracy"
    );

    const weakestColorElement = document.getElementById(
        "weakestColor"
    );

    const weakestColorAccuracyElement = document.getElementById(
        "weakestColorAccuracy"
    );

    const colorPerformanceList = document.getElementById(
        "colorPerformanceList"
    );

    const playAgainButton = document.getElementById(
        "playAgain"
    );

    const exitGameButton = document.getElementById(
        "exitGame"
    );


    /* =========================================
       GAME STATE
    ========================================= */

    let currentRound = 1;
    let timeRemaining = ROUND_TIME;
    let timerInterval = null;

    let targetColor = null;
    let selectedColor = null;

    let roundLocked = false;
    let gameComplete = false;

    const roundResults = [];


    /* =========================================
       CANVAS
    ========================================= */

    const ctx = paletteCanvas
        ? paletteCanvas.getContext("2d")
        : null;


    /* =========================================
       UTILITY FUNCTIONS
    ========================================= */

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }


    function randomInteger(min, max) {
        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    }


    function rgbToString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }


    function rgbToHex(color) {

        return "#" + [color.r, color.g, color.b]
            .map(value =>
                value
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("");

    }


    function hexToRgb(hex) {

        const value = hex.replace("#", "");

        return {
            r: parseInt(value.substring(0, 2), 16),
            g: parseInt(value.substring(2, 4), 16),
            b: parseInt(value.substring(4, 6), 16)
        };

    }


    /* =========================================
       COLOR GENERATION
    ========================================= */

    function generateTargetColor() {

        const hue = randomInteger(0, 359);
        const saturation = randomInteger(55, 90);
        const lightness = randomInteger(35, 70);

        return hslToRgb(
            hue,
            saturation,
            lightness
        );

    }


    function hslToRgb(h, s, l) {

        s /= 100;
        l /= 100;

        const c =
            (1 - Math.abs(2 * l - 1)) * s;

        const x =
            c * (
                1 -
                Math.abs((h / 60) % 2 - 1)
            );

        const m = l - c / 2;

        let r = 0;
        let g = 0;
        let b = 0;


        if (h < 60) {
            r = c;
            g = x;
        } else if (h < 120) {
            r = x;
            g = c;
        } else if (h < 180) {
            g = c;
            b = x;
        } else if (h < 240) {
            g = x;
            b = c;
        } else if (h < 300) {
            r = x;
            b = c;
        } else {
            r = c;
            b = x;
        }


        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };

    }


    /* =========================================
       COLOR FAMILY
    ========================================= */

    function getColorFamily(color) {

        const max = Math.max(
            color.r,
            color.g,
            color.b
        );

        const min = Math.min(
            color.r,
            color.g,
            color.b
        );

        const delta = max - min;

        if (delta === 0) {
            return "Red";
        }


        let hue;


        if (max === color.r) {

            hue =
                60 *
                (
                    ((color.g - color.b) / delta) % 6
                );

        } else if (max === color.g) {

            hue =
                60 *
                (
                    (color.b - color.r) / delta + 2
                );

        } else {

            hue =
                60 *
                (
                    (color.r - color.g) / delta + 4
                );

        }


        if (hue < 0) {
            hue += 360;
        }


        if (hue < 15 || hue >= 345) {
            return "Red";
        }

        if (hue < 45) {
            return "Orange";
        }

        if (hue < 75) {
            return "Yellow";
        }

        if (hue < 165) {
            return "Green";
        }

        if (hue < 195) {
            return "Cyan";
        }

        if (hue < 255) {
            return "Blue";
        }

        if (hue < 315) {
            return "Purple";
        }

        return "Magenta";

    }


    /* =========================================
       ACCURACY
    ========================================= */

    function calculateAccuracy(target, selection) {

        const distance = Math.sqrt(
            Math.pow(target.r - selection.r, 2) +
            Math.pow(target.g - selection.g, 2) +
            Math.pow(target.b - selection.b, 2)
        );


        const maximumDistance =
            Math.sqrt(
                Math.pow(255, 2) * 3
            );


        const accuracy =
            100 -
            (distance / maximumDistance) * 100;


        return clamp(
            Math.round(accuracy * 100) / 100,
            0,
            100
        );

    }


    function getAccuracyMessage(accuracy) {

        if (accuracy >= 95) {
            return "Excellent Match";
        }

        if (accuracy >= 85) {
            return "Very Good Match";
        }

        if (accuracy >= 70) {
            return "Good Match";
        }

        if (accuracy >= 50) {
            return "Close Match";
        }

        return "Keep Practicing";

    }


    /* =========================================
       PALETTE
    ========================================= */

    function resizePalette() {

        if (!paletteCanvas || !paletteContainer) {
            return;
        }


        const rect =
            paletteContainer.getBoundingClientRect();

        const width =
            Math.max(
                Math.floor(rect.width),
                280
            );

        const height =
            window.innerWidth <= 450
                ? 260
                : window.innerWidth <= 700
                    ? 300
                    : 360;


        const devicePixelRatio =
            window.devicePixelRatio || 1;


        paletteCanvas.width =
            width * devicePixelRatio;

        paletteCanvas.height =
            height * devicePixelRatio;


        paletteCanvas.style.width =
            `${width}px`;

        paletteCanvas.style.height =
            `${height}px`;


        ctx.setTransform(
            devicePixelRatio,
            0,
            0,
            devicePixelRatio,
            0,
            0
        );


        drawPalette(
            width,
            height
        );

    }


    function drawPalette(width, height) {

        if (!ctx) {
            return;
        }


        const imageData =
            ctx.createImageData(
                width,
                height
            );

        const data = imageData.data;


        for (let y = 0; y < height; y++) {

            for (let x = 0; x < width; x++) {

                const hue =
                    (x / width) * 360;

                const saturation =
                    100;

                const lightness =
                    100 - (y / height) * 100;


                const color =
                    hslToRgb(
                        hue,
                        saturation,
                        lightness
                    );


                const index =
                    (y * width + x) * 4;


                data[index] = color.r;
                data[index + 1] = color.g;
                data[index + 2] = color.b;
                data[index + 3] = 255;

            }

        }


        ctx.putImageData(
            imageData,
            0,
            0
        );

    }


    function updateSelectionMarker(x, y) {

        if (!paletteSelectionMarker) {
            return;
        }


        paletteSelectionMarker.style.left =
            `${x}px`;

        paletteSelectionMarker.style.top =
            `${y}px`;

        paletteSelectionMarker.classList.add(
            "visible"
        );

    }


    function selectPaletteColor(event) {

        if (
            roundLocked ||
            gameComplete ||
            !paletteCanvas
        ) {
            return;
        }


        const rect =
            paletteCanvas.getBoundingClientRect();


        const x =
            clamp(
                event.clientX - rect.left,
                0,
                rect.width
            );

        const y =
            clamp(
                event.clientY - rect.top,
                0,
                rect.height
            );


        const hue =
            (x / rect.width) * 360;


        const saturation = 100;

        const lightness =
            100 -
            (y / rect.height) * 100;


        selectedColor =
            hslToRgb(
                hue,
                saturation,
                lightness
            );


        updateSelectionMarker(
            x,
            y
        );


        updateSelectionPreview();

    }


    function updateSelectionPreview() {

        if (!selectedColor) {
            return;
        }


        const color =
            rgbToString(selectedColor);


        selectionColorElement.style.backgroundColor =
            color;


        selectionColorElement.classList.add(
            "has-selection"
        );


        selectionStatusElement.textContent =
            "Color selected";


        selectionStatusElement.classList.add(
            "selected"
        );

    }


    /* =========================================
       ROUND INITIALIZATION
    ========================================= */

    function startRound() {

        roundLocked = false;

        selectedColor = null;

        timeRemaining = ROUND_TIME;


        targetColor =
            generateTargetColor();


        targetColorElement.style.backgroundColor =
            rgbToString(targetColor);


        selectionColorElement.style.backgroundColor =
            "#e5e7eb";


        selectionColorElement.classList.remove(
            "has-selection"
        );


        selectionStatusElement.textContent =
            "Select a color";


        selectionStatusElement.classList.remove(
            "selected"
        );


        if (paletteSelectionMarker) {

            paletteSelectionMarker.classList.remove(
                "visible"
            );

        }


        roundElement.textContent =
            `${currentRound}/${TOTAL_ROUNDS}`;


        accuracyElement.textContent =
            "--";


        timerElement.textContent =
            timeRemaining;


        resetTimerState();


        hideRoundResult();


        resizePalette();

        startTimer();

    }


    /* =========================================
       TIMER
    ========================================= */

    function startTimer() {

        stopTimer();


        timerInterval =
            setInterval(() => {

                if (roundLocked || gameComplete) {
                    return;
                }


                timeRemaining--;


                timerElement.textContent =
                    timeRemaining;


                updateTimerState();


                if (timeRemaining <= 0) {

                    stopTimer();

                    handleTimeUp();

                }

            }, 1000);

    }


    function stopTimer() {

        if (timerInterval !== null) {

            clearInterval(
                timerInterval
            );

            timerInterval = null;

        }

    }


    function updateTimerState() {

        const statusItem =
            timerElement.closest(
                ".status-item"
            );


        if (!statusItem) {
            return;
        }


        statusItem.classList.remove(
            "timer-warning",
            "timer-critical"
        );


        if (
            timeRemaining <= 5 &&
            timeRemaining > 0
        ) {

            statusItem.classList.add(
                "timer-critical"
            );

        } else if (
            timeRemaining <= 10
        ) {

            statusItem.classList.add(
                "timer-warning"
            );

        }

    }


    function resetTimerState() {

        const statusItem =
            timerElement.closest(
                ".status-item"
            );


        if (!statusItem) {
            return;
        }


        statusItem.classList.remove(
            "timer-warning",
            "timer-critical"
        );

    }


    /* =========================================
       SUBMIT / TIME UP
    ========================================= */

    function submitGuess() {

        if (
            roundLocked ||
            gameComplete ||
            !selectedColor
        ) {
            return;
        }


        stopTimer();

        completeRound(
            false
        );

    }


    function handleTimeUp() {

        if (
            roundLocked ||
            gameComplete
        ) {
            return;
        }


        roundLocked = true;


        showTimeUpOverlay();


        setTimeout(() => {

            hideTimeUpOverlay();

            completeRound(
                true
            );

        }, 900);

    }


    function completeRound(timeExpired) {

        if (roundLocked && !timeExpired) {
            return;
        }


        roundLocked = true;

        stopTimer();


        let accuracy = 0;


        if (selectedColor) {

            accuracy =
                calculateAccuracy(
                    targetColor,
                    selectedColor
                );

        }


        accuracyElement.textContent =
            `${Math.round(accuracy)}%`;


        const family =
            getColorFamily(
                targetColor
            );


        roundResults.push({
            round: currentRound,
            accuracy,
            family,
            target: { ...targetColor },
            selection: selectedColor
                ? { ...selectedColor }
                : null,
            timedOut: timeExpired
        });


        showRoundResult(
            accuracy,
            timeExpired
        );


        setTimeout(() => {

            hideRoundResult();


            if (
                currentRound >= TOTAL_ROUNDS
            ) {

                finishGame();

            } else {

                currentRound++;

                animateNextRound();

            }

        }, TRANSITION_DURATION);

    }


    /* =========================================
       ROUND RESULT UI
    ========================================= */

    function showRoundResult(
        accuracy,
        timeExpired
    ) {

        roundResultAccuracy.textContent =
            `${Math.round(accuracy)}%`;


        roundResultMessage.textContent =
            timeExpired
                ? "Time's Up"
                : getAccuracyMessage(
                    accuracy
                );


        roundResult.classList.add(
            "visible"
        );

        roundResult.setAttribute(
            "aria-hidden",
            "false"
        );


        transitionTargetColor.style.backgroundColor =
            rgbToString(targetColor);


        if (selectedColor) {

            transitionSelectionColor.style.backgroundColor =
                rgbToString(
                    selectedColor
                );

        } else {

            transitionSelectionColor.style.backgroundColor =
                "#e5e7eb";

        }


        roundAccuracyElement.textContent =
            `${Math.round(accuracy)}%`;


        roundFeedbackElement.textContent =
            timeExpired
                ? "Time's Up"
                : getAccuracyMessage(
                    accuracy
                );


        transitionMessage.textContent =
            currentRound < TOTAL_ROUNDS
                ? "Next Round..."
                : "Final Results...";


        openModal(
            roundTransition
        );

    }


    function hideRoundResult() {

        roundResult.classList.remove(
            "visible"
        );

        roundResult.setAttribute(
            "aria-hidden",
            "true"
        );

        closeModal(
            roundTransition
        );

    }


    function animateNextRound() {

        const gameLayout =
            document.querySelector(
                ".game-layout"
            );


        if (gameLayout) {

            gameLayout.classList.remove(
                "round-transition"
            );


            void gameLayout.offsetWidth;


            gameLayout.classList.add(
                "round-transition"
            );

        }


        startRound();

    }


    /* =========================================
       TIME UP UI
    ========================================= */

    function showTimeUpOverlay() {

        timerElement.classList.add(
            "timer-expired"
        );


        openModal(
            timeUpOverlay
        );

    }


    function hideTimeUpOverlay() {

        timerElement.classList.remove(
            "timer-expired"
        );


        closeModal(
            timeUpOverlay
        );

    }


    /* =========================================
       MODALS
    ========================================= */

    function openModal(modal) {

        if (!modal) {
            return;
        }


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* =========================================
       EXIT GAME
    ========================================= */

    function requestExit() {

        stopTimer();

        openModal(
            exitModal
        );

    }


    function cancelExit() {

        closeModal(
            exitModal
        );


        if (
            !gameComplete &&
            !roundLocked
        ) {

            startTimer();

        }

    }


    function confirmExit() {

        stopTimer();

        window.location.href = "/";

    }


    /* =========================================
       PERFORMANCE
    ========================================= */

    function calculateGamePerformance() {

        if (roundResults.length === 0) {
            return null;
        }


        const accuracies =
            roundResults.map(
                result => result.accuracy
            );


        const total =
            accuracies.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const average =
            total /
            accuracies.length;


        const best =
            Math.max(
                ...accuracies
            );


        const lowest =
            Math.min(
                ...accuracies
            );


        return {
            average,
            best,
            lowest
        };

    }


    function getPerformanceMessage(
        accuracy
    ) {

        if (accuracy >= 95) {
            return "Excellent Color Perception";
        }

        if (accuracy >= 85) {
            return "Very Good Color Perception";
        }

        if (accuracy >= 70) {
            return "Good Color Perception";
        }

        if (accuracy >= 50) {
            return "Developing Color Perception";
        }

        return "Keep Practicing";

    }


    /* =========================================
       COLOR PERFORMANCE
    ========================================= */

    function calculateColorPerformance() {

        const groups = {};


        COLOR_FAMILIES.forEach(
            family => {

                groups[family] = {
                    total: 0,
                    count: 0
                };

            }
        );


        roundResults.forEach(
            result => {

                if (
                    !groups[result.family]
                ) {

                    groups[result.family] = {
                        total: 0,
                        count: 0
                    };

                }


                groups[result.family].total +=
                    result.accuracy;


                groups[result.family].count++;

            }
        );


        return Object.entries(groups)
            .filter(
                ([, data]) =>
                    data.count > 0
            )
            .map(
                ([family, data]) => ({

                    family,

                    accuracy:
                        data.total /
                        data.count,

                    count:
                        data.count

                })
            )
            .sort(
                (a, b) =>
                    b.accuracy -
                    a.accuracy
            );

    }


    function renderColorPerformance() {

        const performance =
            calculateColorPerformance();


        colorPerformanceList.innerHTML =
            "";


        if (performance.length === 0) {

            strongestColorElement.textContent =
                "--";

            strongestColorAccuracyElement.textContent =
                "--";

            weakestColorElement.textContent =
                "--";

            weakestColorAccuracyElement.textContent =
                "--";

            return;

        }


        const strongest =
            performance[0];


        const weakest =
            performance[
                performance.length - 1
            ];


        strongestColorElement.textContent =
            strongest.family;


        strongestColorAccuracyElement.textContent =
            `${Math.round(
                strongest.accuracy
            )}%`;


        weakestColorElement.textContent =
            weakest.family;


        weakestColorAccuracyElement.textContent =
            `${Math.round(
                weakest.accuracy
            )}%`;


        performance.forEach(
            result => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "color-performance-row";


                row.innerHTML = `
                    <span class="color-performance-name">
                        ${result.family}
                    </span>

                    <div class="color-performance-bar">
                        <div
                            class="color-performance-fill"
                            style="width: ${result.accuracy}%">
                        </div>
                    </div>

                    <span class="color-performance-score">
                        ${Math.round(result.accuracy)}%
                    </span>
                `;


                colorPerformanceList.appendChild(
                    row
                );

            }
        );

    }


    /* =========================================
       GAME COMPLETE
    ========================================= */

    function finishGame() {

        gameComplete = true;

        roundLocked = true;

        stopTimer();


        const performance =
            calculateGamePerformance();


        if (!performance) {
            return;
        }


        finalAccuracyElement.textContent =
            `${Math.round(
                performance.average
            )}%`;


        finalPerformanceMessage.textContent =
            getPerformanceMessage(
                performance.average
            );


        bestAccuracyElement.textContent =
            `${Math.round(
                performance.best
            )}%`;


        lowestAccuracyElement.textContent =
            `${Math.round(
                performance.lowest
            )}%`;


        roundsPlayedElement.textContent =
            roundResults.length;


        requestAnimationFrame(() => {

            performanceBarFill.style.width =
                `${performance.average}%`;

        });


        renderColorPerformance();


        closeModal(
            roundTransition
        );


        openModal(
            gameCompleteModal
        );

    }


    /* =========================================
       RESTART GAME
    ========================================= */

    function restartGame() {

        closeModal(
            gameCompleteModal
        );

        closeModal(
            exitModal
        );


        currentRound = 1;

        timeRemaining = ROUND_TIME;

        gameComplete = false;

        roundLocked = false;


        roundResults.length = 0;


        performanceBarFill.style.width =
            "0%";


        startRound();

    }


    /* =========================================
       EVENT LISTENERS
    ========================================= */

    if (paletteCanvas) {

        paletteCanvas.addEventListener(
            "click",
            selectPaletteColor
        );


        paletteCanvas.addEventListener(
            "pointerdown",
            selectPaletteColor
        );

    }


    if (submitGuessButton) {

        submitGuessButton.addEventListener(
            "click",
            submitGuess
        );

    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            requestExit
        );

    }


    if (confirmExitButton) {

        confirmExitButton.addEventListener(
            "click",
            confirmExit
        );

    }


    if (cancelExitButton) {

        cancelExitButton.addEventListener(
            "click",
            cancelExit
        );

    }


    if (playAgainButton) {

        playAgainButton.addEventListener(
            "click",
            restartGame
        );

    }


    if (exitGameButton) {

        exitGameButton.addEventListener(
            "click",
            confirmExit
        );

    }


    window.addEventListener(
        "resize",
        resizePalette
    );


    /* =========================================
       MODAL BACKDROP HANDLING
    ========================================= */

    [
        exitModal,
        roundTransition,
        timeUpOverlay,
        gameCompleteModal
    ].forEach(modal => {

        if (!modal) {
            return;
        }


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target !== modal
                ) {
                    return;
                }


                if (
                    modal === exitModal
                ) {

                    cancelExit();

                }

            }
        );

    });


    /* =========================================
       KEYBOARD SUPPORT
    ========================================= */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                exitModal.classList.contains(
                    "active"
                )
            ) {

                cancelExit();

            }

        }
    );


    /* =========================================
       INITIALIZE
    ========================================= */

    if (
        paletteCanvas &&
        targetColorElement &&
        selectionColorElement
    ) {

        startRound();

    }

});
