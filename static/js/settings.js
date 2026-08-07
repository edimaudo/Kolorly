/*
    Kolorly Settings Controller

    Sprint 2 Finalized Version

    Handles:
    - Theme selection
    - Font size selection
    - Game speed selection
    - Preference loading
*/


"use strict";



document.addEventListener(
    "DOMContentLoaded",
    () => {


        initializeSettingsPage();


    }
);








function initializeSettingsPage() {



    const themeOptions =
        document.querySelectorAll(
            'input[name="theme"]'
        );



    const fontOptions =
        document.querySelectorAll(
            'input[name="font-size"]'
        );



    const speedOptions =
        document.querySelectorAll(
            'input[name="game-speed"]'
        );





    loadSavedSettings(
        themeOptions,
        fontOptions,
        speedOptions
    );





    bindThemeEvents(
        themeOptions
    );



    bindFontEvents(
        fontOptions
    );



    bindSpeedEvents(
        speedOptions
    );



}









function loadSavedSettings(
    themeOptions,
    fontOptions,
    speedOptions
) {



    const theme =

        KolorlyApp.getSetting(

            KolorlyApp.STORAGE_KEYS.theme,

            KolorlyApp.DEFAULTS.theme

        );





    const fontSize =

        KolorlyApp.getSetting(

            KolorlyApp.STORAGE_KEYS.fontSize,

            KolorlyApp.DEFAULTS.fontSize

        );





    const gameSpeed =

        KolorlyApp.getSetting(

            KolorlyApp.STORAGE_KEYS.gameSpeed,

            KolorlyApp.DEFAULTS.gameSpeed

        );









    themeOptions.forEach(
        option => {


            option.checked =
                option.value === theme;


        }
    );









    fontOptions.forEach(
        option => {


            option.checked =
                option.value === fontSize;


        }
    );









    speedOptions.forEach(
        option => {


            option.checked =
                option.value === String(gameSpeed);


        }
    );



}









function bindThemeEvents(
    options
) {



    options.forEach(
        option => {



            option.addEventListener(
                "change",
                event => {



                    const theme =
                        event.target.value;




                    KolorlyApp.applyTheme(
                        theme
                    );





                    KolorlyApp.announce(

                        `${theme} mode enabled`

                    );



                }
            );



        }
    );



}









function bindFontEvents(
    options
) {



    options.forEach(
        option => {



            option.addEventListener(
                "change",
                event => {



                    const size =
                        event.target.value;




                    KolorlyApp.applyFontSize(
                        size
                    );





                    KolorlyApp.announce(

                        `${size} text size enabled`

                    );



                }
            );



        }
    );



}









function bindSpeedEvents(
    options
) {



    options.forEach(
        option => {



            option.addEventListener(
                "change",
                event => {



                    const speed =
                        event.target.value;




                    KolorlyApp.applyGameSpeed(
                        speed
                    );





                    KolorlyApp.announce(

                        `${speed} second game speed selected`

                    );



                }
            );



        }
    );



}
