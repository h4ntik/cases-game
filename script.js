"use strict";

/*
==========================================================
    КЕЙСЫ ПОБЕД

    Основная логика приложения

    Разделы:
    1. Конфигурация
    2. Состояние игры
    3. LocalStorage
    4. Инициализация
    5. Создание кейсов
==========================================================
*/


/* ==========================================================
   1. CONFIGURATION
========================================================== */


const GAME_CONFIG = {

    storageKey: "casesVictoryGame",

    storageVersion: 2,

    prizes: [

        500,
        500,

        1000,
        1000,
        1000,

        1500,
        1500,

        2000,

        3000,

        8000

    ],

    legendaryPrize:8000,

    casesCount:10

};



/* ==========================================================
   2. DOM ELEMENTS
========================================================== */


const DOM = {


    casesGrid:
        document.getElementById("casesGrid"),

    receivedBank:
        document.getElementById("receivedBank"),


    resetButton:
        document.getElementById("resetButton"),


    overlay:
        document.getElementById("overlay"),


    openingScene:
        document.getElementById("openingScene"),


    rewardModal:
        document.getElementById("rewardModal"),


    rewardCard:
        document.getElementById("rewardCard"),


    rewardIcon:
        document.getElementById("rewardIcon"),


    rewardTitle:
        document.getElementById("rewardTitle"),


    rewardAmount:
        document.getElementById("rewardAmount"),


    closeReward:
        document.getElementById("closeReward"),


    confettiContainer:
        document.getElementById("confettiContainer"),


    caseTemplate:
        document.getElementById("caseTemplate"),


    clickSound:
        document.getElementById("clickSound"),


    openSound:
        document.getElementById("openSound"),


    legendarySound:
        document.getElementById("legendarySound")

};



/* ==========================================================
   3. GAME STATE
========================================================== */


let gameState = {

    version:
        GAME_CONFIG.storageVersion,

    prizes: [],

    openedCases: [
        null,
        1500,
        null
    ],

    received:0,

};



/* ==========================================================
   4. HELPERS
========================================================== */


/*
    Перемешивание массива
*/

function shuffle(array){


    const copy = [...array];


    for(
        let i = copy.length - 1;
        i > 0;
        i--
    ){

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            copy[i],
            copy[randomIndex]
        ] =
        [
            copy[randomIndex],
            copy[i]
        ];

    }


    return copy;

}



/*
    Форматирование денег
*/

function formatMoney(value){


    if(
        typeof value !== "number"
    ){

        value = 0;

    }


    return value
        .toLocaleString("ru-RU")
        + " ₽";

}



/*
    Сохранение состояния
*/

function saveGame(){


    localStorage.setItem(

        GAME_CONFIG.storageKey,

        JSON.stringify(gameState)

    );

}



/*
    Загрузка состояния
*/

function loadGame(){


    const saved =

        localStorage.getItem(
            GAME_CONFIG.storageKey
        );


    if(!saved){

        createNewGame();

        return;

    }


    try{


        gameState =
            JSON.parse(saved);


    }
    catch(error){


        console.error(
            "Ошибка загрузки сохранения",
            error
        );


        createNewGame();


    }

}



/*
    Создание новой игры
*/

function createNewGame(){


    gameState = {

        version:
            GAME_CONFIG.storageVersion,
    
    
        prizes:
            shuffle(
                GAME_CONFIG.prizes
            ),


            openedCases:
            Array(
                GAME_CONFIG.casesCount
            )
            .fill(null),


            received:0,


        currentOpening:null

    };


    saveGame();

}



/* ==========================================================
   5. INITIALIZATION
========================================================== */


function init(){


    loadGame();


    renderCases();


    updateBank();


    setupEvents();


}



/* ==========================================================
   6. CASE RENDERING
========================================================== */


function renderCases(){


    DOM.casesGrid.innerHTML="";


    gameState.openedCases.forEach(

        (opened,index)=>{


            const clone =

                DOM.caseTemplate
                .content
                .cloneNode(true);



            const caseElement =

                clone.querySelector(
                    ".case-card"
                );



            caseElement.dataset.index =
                index;



            if(opened){


                caseElement.classList.add(
                    "opened"
                );


            }



            DOM.casesGrid.appendChild(
                clone
            );


        }

    );


}

/* ==========================================================
   7. EVENTS
========================================================== */


function setupEvents(){


    DOM.resetButton
        .addEventListener(
            "click",
            resetGame
        );



    DOM.closeReward
        .addEventListener(
            "click",
            closeRewardModal
        );



    DOM.casesGrid
        .addEventListener(
            "click",
            handleCaseClick
        );



}



/* ==========================================================
   8. CASE CLICK
========================================================== */


function handleCaseClick(event){


    const caseCard =

        event.target.closest(
            ".case-card"
        );



    if(!caseCard){

        return;

    }



    const index =

        Number(
            caseCard.dataset.index
        );



        if(
            gameState.openedCases[index] !== null
        ){
        
            return;
        
        }



    openCase(index);


}



/* ==========================================================
   9. BANK UPDATE
========================================================== */


function updateBank(){


    DOM.receivedBank.textContent =

        formatMoney(
            gameState.received
        );


}



/* ==========================================================
   10. OPEN CASE
========================================================== */


async function openCase(index){


    if(
        gameState.currentOpening !== null
    ){

        return;

    }



    gameState.currentOpening = index;



    playSound(
        DOM.clickSound
    );



    const caseElement =

        document.querySelector(
            `[data-index="${index}"]`
        );



    showOpeningScene();



    await wait(700);



    playSound(
        DOM.openSound
    );



    await wait(1200);



    const reward =

        gameState.prizes[index];



    hideOpeningScene();



    gameState.openedCases[index] =
        reward;



    gameState.received += reward;



    gameState.currentOpening = null;



    saveGame();



    updateBank();



    caseElement
        .classList
        .add(
            "opened"
        );



    await wait(500);



    showReward(reward);



}



/* ==========================================================
   11. OPENING SCENE
========================================================== */


function showOpeningScene(){


    DOM.overlay
        .classList
        .remove(
            "hidden"
        );



    DOM.openingScene
        .classList
        .remove(
            "hidden"
        );



    requestAnimationFrame(()=>{


        DOM.openingScene
            .classList
            .add(
                "active"
            );


    });


}



/*
    Скрытие сцены открытия
*/

function hideOpeningScene(){


    DOM.openingScene
        .classList
        .remove(
            "active"
        );


    DOM.openingScene
        .classList
        .add(
            "hidden"
        );


}



/* ==========================================================
   12. REWARD DISPLAY
========================================================== */


function showReward(amount){


    DOM.rewardCard
        .classList
        .remove(
            "legendary"
        );



    DOM.rewardIcon.textContent =
        "💰";



    DOM.rewardTitle.textContent =

        "Поздравляем";



    DOM.rewardAmount.textContent =

        formatMoney(
            amount
        );



    if(
        amount === GAME_CONFIG.legendaryPrize
    ){


        showLegendaryReward();


    }



    DOM.rewardModal
        .classList
        .remove(
            "hidden"
        );


}



/* ==========================================================
   13. LEGENDARY REWARD
========================================================== */


function showLegendaryReward(){


    DOM.rewardCard
        .classList
        .add(
            "legendary"
        );



    DOM.rewardIcon.textContent =
        "👑";



    DOM.rewardTitle.textContent =

        "ЛЕГЕНДАРНЫЙ ПРИЗ";



    playSound(
        DOM.legendarySound
    );



    createConfetti();


}



/* ==========================================================
   14. CLOSE REWARD
========================================================== */


function closeRewardModal(){


    DOM.rewardModal
        .classList
        .add(
            "hidden"
        );


    DOM.overlay
        .classList
        .add(
            "hidden"
        );


}



/* ==========================================================
   15. RESET GAME
========================================================== */


function resetGame(){


    const confirmReset =

        confirm(
            "Вы действительно хотите обновить страницу? Все открытые кейсы будут сброшены."
        );



    if(!confirmReset){

        return;

    }



    createNewGame();


    renderCases();


    updateBank();



}



/* ==========================================================
   16. SOUND
========================================================== */


function playSound(audio){


    if(!audio){

        return;

    }



    audio.currentTime = 0;



    audio.play()
        .catch(
            ()=>{}
        );


}



/* ==========================================================
   17. WAIT
========================================================== */


function wait(ms){


    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );


}

/* ==========================================================
   18. CONFETTI SYSTEM
========================================================== */


function createConfetti(){


    const pieces = 120;



    for(
        let i = 0;
        i < pieces;
        i++
    ){


        const element =

            document.createElement(
                "div"
            );



        element.className =
            "confetti";



        element.style.left =

            Math.random() * 100
            + "%";



        element.style.animationDelay =

            Math.random() * 1.5
            + "s";



        element.style.animationDuration =

            2
            +
            Math.random() * 2
            +
            "s";



        element.style.transform =

            `
            rotate(
                ${Math.random()*360}deg
            )
            `;



        const colors = [

            "#ffd24d",

            "#ffffff",

            "#5f7cff",

            "#2fe7ff",

            "#ff7b7b"

        ];



        element.style.background =

            colors[
                Math.floor(
                    Math.random()
                    *
                    colors.length
                )
            ];



        DOM.confettiContainer
            .appendChild(
                element
            );



        setTimeout(()=>{


            element.remove();



        },4000);


    }


}



/* ==========================================================
   19. VISUAL HELPERS
========================================================== */


/*
    Добавление временного класса

    Используется для анимаций
*/

function addTemporaryClass(
    element,
    className,
    duration
){


    if(!element){

        return;

    }



    element.classList.add(
        className
    );



    setTimeout(()=>{


        element.classList.remove(
            className
        );


    },duration);


}



/*
    Получение текущего открытых кейсов

    Может использоваться для
    будущей статистики
*/

function getOpenedCount(){


    return gameState.openedCases
        .filter(
            item => item
        )
        .length;


}



/*
    Получение оставшихся кейсов
*/

function getRemainingCases(){


    return GAME_CONFIG.casesCount
        -
        getOpenedCount();


}



/*
    Проверка окончания игры
*/

function isGameFinished(){


    return getOpenedCount()
        ===
        GAME_CONFIG.casesCount;


}



/* ==========================================================
   20. DEBUG HELPERS
========================================================== */


/*
    Оставляем небольшой набор
    функций для будущего расширения.

    Например:
    - панель администратора
    - Twitch интеграция
    - команды чата
*/


window.CasesGame = {


    getState(){

        return gameState;

    },


    reset(){

        resetGame();

    },


    open(index){

        openCase(index);

    }


};

/* ==========================================================
   21. APPLICATION START
========================================================== */


/*
    Запуск приложения

    Ждем полной загрузки DOM,
    затем создаем интерфейс.
*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        try{


            init();



        }
        catch(error){


            console.error(

                "Ошибка запуска приложения:",

                error

            );


        }


    }

);



/* ==========================================================
   22. GLOBAL ERROR PROTECTION
========================================================== */


window.addEventListener(

    "error",

    event => {


        console.error(

            "Runtime error:",

            event.error

        );


    }

);



/* ==========================================================
   END SCRIPT
========================================================== */
