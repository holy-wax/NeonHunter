// 管理游戏的全局状态：状态机、生命值、连击、本局总收益、轮次、Buff

import * as greenBuff from './buffs/greenBuff.js';
import * as purpleBuff from './buffs/purpleBuff.js';
import * as goldBuff from './buffs/goldBuff.js';

const MAX_LIVES = 5;

// ============ 状态常量 ============
export const STATE_MENU = 'menu';
export const STATE_PLAYING = 'playing';
export const STATE_PAUSED = 'paused';
export const STATE_GAMEOVER = 'gameover';
export const STATE_ROUND_END = 'round_end';
export const STATE_BUFF_SELECT = 'buff_select';
export const STATE_QUIZ_TUTORIAL = 'quiz_tutorial';
export const STATE_QUIZ = 'quiz';
export const STATE_TUTORIAL = 'tutorial';

export const MAX_ROUNDS = 10;
export const ROUND_TIME = 40;

// ============ 连击参数 ============
export let comboThreshold = 4;
export let comboMultiplier = 1.1;

// ============ Buff 系统 ============
export let greenChance = 50;
export let purpleChance = 30;
export let goldChance = 20;

const BUFF_POOL = {
      green: [
        { id: 'combo_lv1', name: '#连击大师Lv1', desc: '连击倍率 +0.1\n(同类效果可叠加)', level: 'green' ,unique:true},
        { id: 'blue_lv1',  name: '高规格-蓝Lv1', desc: '蓝块单价 +20', level: 'green' },
        { id: 'pink_lv1',  name: '高规格-粉Lv1', desc: '粉块单价 +20', level: 'green' },
        { id: 'time_lv1',  name: '时间管理Lv1', desc: '时长 +5s', level: 'green' },
        { id: 'freq_lv1',  name: '提效-频率Lv1', desc: '生成间隔 -0.1s', level: 'green' },
        { id: 'speed_lv1', name: '提效-速率Lv1', desc: '下落速度 +1', level: 'green' },
        { id: 'paddle_lv1', name: '变答辩糕Lv1', desc: '挡板长度 +1.5', level: 'green' },
        { id: 'locust_lv1', name: '#蝗虫过境Lv1', desc: '黄块生成概率提升至0.25\n(同类效果取最高)', level: 'green' ,unique:true}
    ],
    purple: [
        { id: 'combo_lv2', name: '#连击大师Lv2', desc: '连击倍率 +0.15\n(同类效果可叠加)', level: 'purple' ,unique:true},
        { id: 'blue_lv2',  name: '高规格-蓝Lv2', desc: '蓝块单价 +30', level: 'purple' },
        { id: 'pink_lv2',  name: '高规格-粉Lv2', desc: '粉块单价 +30', level: 'purple' },
        { id: 'time_lv2',  name: '时间管理Lv2', desc: '时长 +10s', level: 'purple' },
        { id: 'freq_lv2',  name: '提效-频率Lv2', desc: '生成间隔 -0.15s', level: 'purple' },
        { id: 'speed_lv2', name: '提效-速率Lv2', desc: '下落速度 +1.5', level: 'purple' },
        { id: 'recycle', name: '#变废成宝', desc: '可接取黄色方块\n(无颜色限制)\n(不接也不会掉血)', level: 'purple' ,unique:true},
        { id: 'paddle_lv2', name: '变答辩糕Lv2', desc: '挡板长度 +2.5', level: 'purple' },
        { id: 'locust_lv2', name: '#蝗虫过境Lv2', desc: '黄块生成概率提升至0.4\n(同类效果取最高)', level: 'purple' ,unique:true},
        { id: 'combo_threshold_lv2', name: '#手感火热', desc: '倍率提升触发门槛降至3\n(所需连击数减少)\n(同类效果取最高)', level: 'purple', unique: true },
    ],
    gold: [
        { id: 'combo_lv3', name: '#连击大师Lv3', desc: '连击倍率 +0.2\n(同类效果可叠加)', level: 'gold' ,unique:true},
        { id: 'blue_lv3',  name: '高规格-蓝Lv3', desc: '蓝块单价 +50', level: 'gold' },
        { id: 'pink_lv3',  name: '高规格-粉Lv3', desc: '粉块单价 +50', level: 'gold' },
        { id: 'time_lv3',  name: '时间管理Lv3', desc: '时长 +20s', level: 'gold' },
        { id: 'freq_lv3',  name: '提效-频率Lv3', desc: '生成间隔 -0.25s', level: 'gold' },
        { id: 'speed_lv3', name: '提效-速率Lv3', desc: '下落速度 +2', level: 'gold' },
        { id: 'yellow_x3', name: '点石成金', desc: '黄块价格 x3', level: 'gold' },
        { id: 'locust_lv3', name: '#蝗虫过境Lv3', desc: '黄块生成概率提升至0.6\n(同类效果取最高)', level: 'gold' ,unique:true},
        { id: 'combo_threshold_lv3', name: '#手感爆棚Lv3', desc: '倍率提升触发门槛降至2\n(所需连击数减少)\n(同类效果取最高)', level: 'gold', unique: true }
    ]
};

let currentBuffOptions = [];
let activeBuffs = [];
// ====================================

let state = STATE_MENU;
let lives = MAX_LIVES;
let comboCount = 0;
let collectCoins = 0;
let finalIncome = 0;

let hasPlayedBefore = false;
let currentRound = 1;
let roundTimeLeft = ROUND_TIME;

// ---- 状态切换与基础信息 ----

export function initGameState() {
    state = STATE_MENU;
    lives = MAX_LIVES;
    comboCount = 0;
    collectCoins = 0;
    finalIncome = 0;
    currentRound = 1;
    roundTimeLeft = ROUND_TIME;
    currentBuffOptions = [];
    activeBuffs = [];
}

export function startGame() {
    state = STATE_PLAYING;
    lives = MAX_LIVES;
    comboCount = 0;
    collectCoins = 0;
    finalIncome = 0;
    currentRound = 1;
    roundTimeLeft = getRoundTimeLimit();
    currentBuffOptions = [];
    activeBuffs = [];
}

// 新增：主菜单按下空格后的逻辑
export function handleMenuStart() {
    if (hasPlayedBefore) {
        startGame(); // 玩过了，直接开始
    } else {
        state = STATE_TUTORIAL; // 没玩过，进教程
    }
}

// 新增：教程看完按下空格后的逻辑
export function finishTutorial() {
    hasPlayedBefore = true; // 标记为已玩过
    startGame();            // 正式开始游戏
}

export function returnToMenu() {
    state = STATE_MENU;
}

export function getState() { return state; }
export function getLives() { return lives; }
export function getMaxLives() { return MAX_LIVES; }
export function getCollectCoins() { return collectCoins; }
export function getFinalIncome() { return finalIncome; }

export function pauseGame() {
    if (state === STATE_PLAYING) state = STATE_PAUSED;
}
export function resumeGame() {
    if (state === STATE_PAUSED) state = STATE_PLAYING;
}

export function takePenalty() {
    if (state !== STATE_PLAYING) return;
    lives--;
    comboCount = 0;
    if (lives < 0) lives = 0;
}

// ---- 结束与结算相关 ----

export function endGame(coins) {
    if (state !== STATE_PLAYING) return;
    collectCoins = coins;
    finalIncome = coins;
    state = STATE_GAMEOVER;
}

export function endGameDirectly(coins) {
    collectCoins = coins;
    finalIncome = coins;
    state = STATE_GAMEOVER;
}

export function enterQuiz(coins) {
    if (state === STATE_ROUND_END) {
        collectCoins = coins;
        state = STATE_QUIZ_TUTORIAL; 
    }
}

export function startQuizGame() {
    if (state === STATE_QUIZ_TUTORIAL) {
        state = STATE_QUIZ; 
    }
}

export function finishQuiz(coins) {
    finalIncome = coins;
    state = STATE_GAMEOVER;
}

// ---- 连击与倍率 ----

export function addCombo() { comboCount++; }
export function resetCombo() { comboCount = 0; }
export function getComboCount() { return comboCount; }

export function getPriceMultiplier() {
    
    const purpleThreshold = purpleBuff.getComboThreshold(activeBuffs);
    const goldThreshold = goldBuff.getComboThreshold(activeBuffs);
      
    const actualThreshold = Math.min(comboThreshold, purpleThreshold, goldThreshold);

    const tiers = Math.floor(comboCount / actualThreshold);
    const baseMultiplier = comboMultiplier ** tiers;
    
    const bonus = greenBuff.getComboBonus(activeBuffs) 
                + purpleBuff.getComboBonus(activeBuffs) 
                + goldBuff.getComboBonus(activeBuffs);
                
    return baseMultiplier + bonus;
}

// ---- 轮次与计时 ----

export function getRoundInfo() {
    return { current: currentRound, max: MAX_ROUNDS, timeLeft: roundTimeLeft };
}

export function getRoundTimeLimit() {
    const bonus = greenBuff.getTimeBonus(activeBuffs) 
                + purpleBuff.getTimeBonus(activeBuffs) 
                + goldBuff.getTimeBonus(activeBuffs);
    return ROUND_TIME + bonus;
}

export function updateTimer(dt) {
    if (state !== STATE_PLAYING) return false;
    roundTimeLeft -= dt;
    if (roundTimeLeft <= 0) {
        roundTimeLeft = 0;
        state = STATE_BUFF_SELECT;
        generateBuffOptions();
        return true;
    }
    return false;
}

export function startNextRound() {
    if (currentRound < MAX_ROUNDS) {
        currentRound++;
        roundTimeLeft = getRoundTimeLimit();
        lives = MAX_LIVES;
        comboCount = 0;
        state = STATE_PLAYING;
    }
}

// ---- Buff 系统 ----

function generateBuffOptions() {
    currentBuffOptions = [];
    const totalChance = greenChance + purpleChance + goldChance;

    for (let i = 0; i < 3; i++) {
        const rand = Math.random() * totalChance;
        let level = 'green';
        if (rand >= greenChance + purpleChance) level = 'gold';
        else if (rand >= greenChance) level = 'purple';

        let pool = BUFF_POOL[level];
        pool = pool.filter(buff => {
            if (buff.unique) {
                return !activeBuffs.some(b => b.id === buff.id);
            }
            return true;
        });

        if (pool.length === 0) pool = BUFF_POOL[level];

        const randomIndex = Math.floor(Math.random() * pool.length);
        currentBuffOptions.push({ ...pool[randomIndex] });
    }
}

export function getBuffOptions() { return currentBuffOptions; }

export function selectBuff(index) {
    if (state === STATE_BUFF_SELECT && currentBuffOptions[index]) {
        const buff = currentBuffOptions[index];
        activeBuffs.push(buff);

        // 即时生效的逻辑（例如挡板加长）
        if (buff.id === 'paddle_lv1') {
            // 这里为了避免循环依赖，导入放在了函数内或通过其他方式处理
            // 如果直接在 gameState.js 顶部 import 会有循环依赖，建议后续用事件总线或在 main.js 处理
            // 目前暂时保留代码结构，如果之前能跑通就不影响。
        }

        state = STATE_ROUND_END;
    }
}

export function getActiveBuffs() { return activeBuffs; }




  