import { engineInit, setTileDefaultPadding, keyWasPressed, timeDelta } from 'littlejsengine';
import { initPaddle, updatePaddle, renderPaddle } from './paddle.js';
import { initBlocks, updateBlocks, renderBlocks, clearBlocks } from './block.js';
import { updateCollision } from './collision.js';
import { 
    initGameState, startGame, returnToMenu, endGame, endGameDirectly, finishQuiz,
    pauseGame, resumeGame, startNextRound, enterQuiz, updateTimer, startQuizGame,
    getState, getLives, getRoundInfo, selectBuff,
    STATE_MENU, STATE_PLAYING, STATE_PAUSED, STATE_GAMEOVER, 
    STATE_ROUND_END, STATE_QUIZ, STATE_QUIZ_TUTORIAL, STATE_BUFF_SELECT
} from './gameState.js';
import { 
    renderHUD, renderMenu, renderGameOver, renderPauseOverlay, 
    renderRoundEnd, renderBuffSelect, renderQuizTutorial, 
    setCoins, getCoins 
} from './hud.js';
import { 
    initQuiz, getQuizData, playerBet, playerGuess, nextQuizRound, 
    PHASE_BETTING, PHASE_GUESSING, PHASE_RESULT 
} from './quiz.js';
import { renderQuiz } from './quizUI.js'; // 注意这里文件名如果是全小写请对应修改

setTileDefaultPadding(1);

function gameInit() {
    initGameState();
    initPaddle();
    initBlocks();
    setCoins(0);
}

function gameUpdate() {
    const state = getState();

    // ================= 主菜单 =================
    if (state === STATE_MENU) {
        if (keyWasPressed('Space')) {
            startGame();
            setCoins(0);
            initBlocks();
        }
        return;
    }

    // ================= 游戏中 =================
    if (state === STATE_PLAYING) {
        if (keyWasPressed('Escape')) {
            pauseGame();
            return;
        }

        const isTimeUp = updateTimer(timeDelta);
        if (isTimeUp) {
            clearBlocks();
            return; // 时间到，切到了 BUFF_SELECT
        }

        updatePaddle();
        updateBlocks();
        updateCollision();

        if (getLives() <= 0) {
            endGame(getCoins());
            clearBlocks();
        }
        return;
    }

    // ================= 暂停 =================
    if (state === STATE_PAUSED) {
        if (keyWasPressed('Escape')) {
            resumeGame();
        } else if (keyWasPressed('KeyQ')) {
            returnToMenu();
            clearBlocks();
        }
        return;
    }

    // ================= Buff 选择 =================
    if (state === STATE_BUFF_SELECT) {
        if (keyWasPressed('Digit1') || keyWasPressed('Numpad1')) {
            selectBuff(0);
        } else if (keyWasPressed('Digit2') || keyWasPressed('Numpad2')) {
            selectBuff(1);
        } else if (keyWasPressed('Digit3') || keyWasPressed('Numpad3')) {
            selectBuff(2);
        }
        return;
    }

    // ================= 轮次结束 =================
    if (state === STATE_ROUND_END) {
        if (keyWasPressed('KeyA')) {
            const info = getRoundInfo();
            if (info.current >= info.max) {
                endGameDirectly(getCoins()); // 第10轮打完按A直接进结算
            } else {
                startNextRound();
            }
        } else if (keyWasPressed('KeyD')) {
            enterQuiz(getCoins()); // 把收集阶段金币传进去
            initQuiz(); 
            clearBlocks();
        }
        return;
    }

    // ================= 猜谜教程 =================
    if (state === STATE_QUIZ_TUTORIAL) {
        if (keyWasPressed('Space')) {
            startQuizGame();
        }
        return;
    }

    // ================= 猜谜环节 =================
    if (state === STATE_QUIZ) {
        const data = getQuizData();
        
        if (data.quizPhase === PHASE_BETTING) {
            if (keyWasPressed('Digit1') || keyWasPressed('Numpad1')) {
                playerBet('fold');
                finishQuiz(getCoins()); // 弃权直接进结算
            } else if (keyWasPressed('Digit2') || keyWasPressed('Numpad2')) {
                playerBet('half');
            } else if (keyWasPressed('Digit3') || keyWasPressed('Numpad3')) {
                playerBet('all');
            }
        } 
        else if (data.quizPhase === PHASE_GUESSING) {
            if (keyWasPressed('Digit1') || keyWasPressed('Numpad1')) {
                playerGuess('blue');
            } else if (keyWasPressed('Digit2') || keyWasPressed('Numpad2')) {
                playerGuess('pink');
            } else if (keyWasPressed('Digit3') || keyWasPressed('Numpad3')) {
                playerGuess('yellow');
            }
        } 
        else if (data.quizPhase === PHASE_RESULT) {
            if (keyWasPressed('Space')) {
                // 梭哈猜错、到了第6轮、或主动弃权，直接结算
                if ((data.betType === 'all' && !data.isWin) || data.quizRound >= 6 || data.betType === 'fold') {
                    finishQuiz(getCoins());
                } else {
                    nextQuizRound();
                }
            }
        }
        return;
    }

    // ================= 游戏结束/结算 =================
    if (state === STATE_GAMEOVER) {
        if (keyWasPressed('Space')) {
            returnToMenu();
            clearBlocks();
        }
        return;
    }
}

function gameUpdatePost() {}
function gameRender() {}

function gameRenderPost() {
    const state = getState();

    if (state === STATE_MENU) {
        renderMenu();
    } 
    else if (state === STATE_PLAYING || state === STATE_PAUSED) {
        renderBlocks();
        renderPaddle();
        renderHUD();
        if (state === STATE_PAUSED) {
            renderPauseOverlay();
        }
    } 
    else if (state === STATE_BUFF_SELECT) {
        renderPaddle(); 
        renderBuffSelect();
    } 
    else if (state === STATE_ROUND_END) {
        renderPaddle();
        renderRoundEnd();
    } 
    else if (state === STATE_QUIZ_TUTORIAL) {
        renderQuizTutorial();
    } 
    else if (state === STATE_QUIZ) {
        renderQuiz(); 
    } 
    else if (state === STATE_GAMEOVER) {
        renderGameOver();
    }
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);
