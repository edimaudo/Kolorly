document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       GAME CONFIGURATION
    ========================================= */

    const TOTAL_ROUNDS = 5;
    const ROUND_TIME = 30;
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

});