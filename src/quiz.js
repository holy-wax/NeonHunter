import { getCoins, setCoins } from './hud.js';

// ================= 猜谜状态 =================
export const PHASE_BETTING = 'betting';   // 下注阶段
export const PHASE_GUESSING = 'guessing'; // 猜颜色阶段
export const PHASE_RESULT = 'result';     // 揭晓/结算阶段

let quizPhase = PHASE_BETTING;
let quizRound = 1;
const MAX_QUIZ_ROUND = 6;

// 当前这轮的数据
let sequence = [];        // 颜色数组，如 ['blue', 'pink', 'yellow']
let revealed = [];        // 布尔数组，标记是否已被揭示
let targetIndex = 0;      // 目标方块索引
let hintColor = 'blue';   // 本轮提示的颜色（'blue' 或 'pink'）
let betType = 'none';     // 'half' 或 'all' 或 'fold'
let isWin = false;
let resultMessage = '';

// 记录进入本轮/本局时的金币，用于计算梭哈赔率
let startCoins = 0;       // 记录进入整场猜谜时的钱（用于梭哈计算）
let roundStartCoins = 0;  // 记录进入当前这一轮时的钱（用于一半计算）

// ================= 初始化 =================
export function initQuiz() {
    startCoins = getCoins();
    quizRound = 1;
    initRound();
}

function initRound() {
    quizPhase = PHASE_BETTING;
    betType = 'none';
    isWin = false;
    resultMessage = '';
    roundStartCoins = getCoins(); // 记录本轮开始前的钱
    
    // 1. 决定方块总数 (第1轮4个，每轮+1，第6轮9个)
    const totalBlocks = 3 + quizRound; 
    
    // 2. 决定黄块数量
    let yellowCount = 0;
    if (quizRound >= 3 && quizRound <= 5) yellowCount = 1;
    if (quizRound === 6) yellowCount = 2;
    
    // 3. 决定蓝粉数量（限制波动范围，让比例平均）
    const availableBlocks = totalBlocks - yellowCount; // 剩下给蓝粉的位置
    const halfCount = Math.floor(availableBlocks / 2); // 一半的位置
    
    // 随机波动范围（-1, 0, 1）
    const variance = Math.floor(Math.random() * 3) - 1; 
    let pinkCount = halfCount + variance;
    
    // 安全限制：确保粉色数量不会小于 0，也不会超过总可用位置
    pinkCount = Math.max(0, Math.min(availableBlocks, pinkCount));
    
    let blueCount = availableBlocks - pinkCount;
    
    // 4. 生成并打乱数组
    sequence = [];
    for(let i=0; i<blueCount; i++) sequence.push('blue');
    for(let i=0; i<pinkCount; i++) sequence.push('pink');
    for(let i=0; i<yellowCount; i++) sequence.push('yellow');
    sequence.sort(() => Math.random() - 0.5); // 洗牌
    
    revealed = new Array(totalBlocks).fill(false);
    targetIndex = Math.floor(Math.random() * totalBlocks); // 随机目标
    
    // 5. 随机决定提示颜色
    hintColor = Math.random() < 0.5 ? 'blue' : 'pink';
    
    // 6. 初始揭示逻辑 (排除目标，随机挑一个未揭示的)
    revealOneRandom();
}

// 随机揭示一个非目标的未揭示方块
function revealOneRandom() {
    const availableToReveal = [];
    for(let i=0; i<sequence.length; i++) {
        if (i !== targetIndex && !revealed[i]) availableToReveal.push(i);
    }
    if (availableToReveal.length > 0) {
        const randIdx = availableToReveal[Math.floor(Math.random() * availableToReveal.length)];
        revealed[randIdx] = true;
    }
}

// ================= 玩家操作与逻辑 =================
export function playerBet(type) {
    if (quizPhase !== PHASE_BETTING) return;
    
    betType = type;
    const currentCoins = getCoins();
    
    if (type === 'half') {
        const betAmt = Math.floor(currentCoins / 2);
        setCoins(currentCoins - betAmt); // 先扣除一半
        
        if (quizRound <= 2) revealOneRandom(); // 前两轮额外揭示
        quizPhase = PHASE_GUESSING;
    } 
    else if (type === 'all') {
        setCoins(0); // 梭哈直接清零
        if (quizRound <= 2) revealOneRandom(); // 前两轮额外揭示
        quizPhase = PHASE_GUESSING;
    }
    else if (type === 'fold') {
        // 弃权，失去70%（即保留30%）
        const keepAmt = Math.floor(currentCoins * 0.3);
        setCoins(keepAmt);
        resultMessage = '已弃权，扣除70%金币并结束猜谜';
        isWin = false;
        quizPhase = PHASE_RESULT;
    }
}

export function playerGuess(color) {
    if (quizPhase !== PHASE_GUESSING) return;
    
    const correctColor = sequence[targetIndex];
    isWin = (color === correctColor);
    
    if (isWin) {
        let winAmount = 0;
        if (betType === 'half') {
            const betAmt = Math.floor(roundStartCoins / 2); // 下注额是当前的一半
            winAmount = betAmt * 1.5;
            if (correctColor === 'yellow') winAmount *= 4;
            setCoins(Math.floor(getCoins() + winAmount)); // 加上赢回的钱
        }
         else if (betType === 'all') {
            // 梭哈赢了，拿回本轮下注金额的 2 倍
            winAmount = roundStartCoins * 2; 
            if (correctColor === 'yellow') winAmount *= 4;
            setCoins(Math.floor(winAmount));
        }
        resultMessage = `猜对啦！正确颜色是 ${correctColor === 'blue' ? '蓝' : correctColor === 'pink' ? '粉' : '黄'}`;
    } else {
        resultMessage = `猜错了...正确颜色是 ${correctColor === 'blue' ? '蓝' : correctColor === 'pink' ? '粉' : '黄'}`;
    }
    
    quizPhase = PHASE_RESULT;
}

export function nextQuizRound() {
    quizRound++;
    if (quizRound > MAX_QUIZ_ROUND) {
        // 实际上如果超过6轮，main.js会通过判断直接进结算，这里做个兜底
        quizPhase = PHASE_RESULT;
        resultMessage = '已完成所有轮次';
    } else {
        initRound();
    }
}

export function getQuizData() {
    return {
        sequence, 
        revealed, 
        targetIndex, 
        hintColor, 
        quizRound,
        quizPhase, 
        isWin,
        betType,
        resultMessage
    };
}