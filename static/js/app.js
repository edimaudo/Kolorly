/*
    Kolorly Application Core

    Sprint 2 Finalized Version

    Responsibilities:
    - Global application initialization
    - Theme management
    - Font scaling
    - LocalStorage preferences
    - Shared settings access
    - Accessibility announcements
*/


"use strict";



const KolorlyApp = (() => {



    const STORAGE_KEYS = {


        theme:
            "kolorly-theme",


        fontSize:
            "kolorly-font-size",


        gameSpeed:
            "kolorly-game-speed"


    };







    const DEFAULTS = {


        theme:
            "light",


        fontSize:
            "medium",


        gameSpeed:
            25


    };








    function getSetting(key, fallback = null) {


        return (

            localStorage.getItem(
                key
            )

            ??

            fallback

        );


    }









    function saveSetting(
        key,
        value
    ) {


        localStorage.setItem(
            key,
            value
        );


    }









    function applyTheme(theme) {


        document.documentElement.dataset.theme =
            theme;



        saveSetting(
            STORAGE_KEYS.theme,
            theme
        );


    }









    function applyFontSize(size) {


        document.documentElement.dataset.fontSize =
            size;



        saveSetting(
            STORAGE_KEYS.fontSize,
            size
        );


    }









    function applyGameSpeed(speed) {


        saveSetting(
            STORAGE_KEYS.gameSpeed,
            speed
        );


    }









    function initializeSettings() {


        const theme =

            getSetting(
                STORAGE_KEYS.theme,
                DEFAULTS.theme
            );



        const fontSize =

            getSetting(
                STORAGE_KEYS.fontSize,
                DEFAULTS.fontSize
            );



        const gameSpeed =

            getSetting(
                STORAGE_KEYS.gameSpeed,
                DEFAULTS.gameSpeed
            );





        applyTheme(
            theme
        );


        applyFontSize(
            fontSize
        );


        applyGameSpeed(
            gameSpeed
        );



    }









    function announce(message) {


        let region =
            document.getElementById(
                "accessibility-announcement"
            );



        if (!region) {


            region =
                document.createElement(
                    "div"
                );



            region.id =
                "accessibility-announcement";



            region.className =
                "sr-only";



            region.setAttribute(
                "aria-live",
                "polite"
            );



            document.body.appendChild(
                region
            );


        }






        region.textContent =
            "";



        setTimeout(
            () => {


                region.textContent =
                    message;



            },

            50

        );



    }









    function initialize() {


        initializeSettings();


    }









    return {


        initialize,


        applyTheme,


        applyFontSize,


        applyGameSpeed,


        getSetting,


        saveSetting,


        announce,


        STORAGE_KEYS,


        DEFAULTS



    };



})();









document.addEventListener(
    "DOMContentLoaded",
    () => {


        KolorlyApp.initialize();


    }
);
