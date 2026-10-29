import { drawText, drawRect, vec2, rgb } from 'littlejsengine';
import { getQuizData, PHASE_BETTING, PHASE_GUESSING, PHASE_RESULT } from './quiz.js';
import { getCoins } from './hud.js';


export function renderQuiz() {
    const data = getQuizData();
    const { sequence, revealed, targetIndex, hintColor, quizRound, quizPhase, resultMessage } = data;


    
    // 1. 左上角仅显示金币
    drawText('金币: ' + getCoins(), vec2(-22, 12), 1.5, rgb(1, 1, 1), 0, rgb(0,0,0), 'left');

    // 2. 顶部文字提示
    drawText(`你需要猜测颜色的方块是 ${targetIndex + 1} 号`, vec2(0, 9.5), 1.5, rgb(1, 1, 1));

    // 3. 统计剩余未揭示的方块数量
    let countBlue = 0, countPink = 0, countYellow = 0;
    for (let i = 0; i < sequence.length; i++) {
        if (!revealed[i]) {
            if (sequence[i] === 'blue') countBlue++;
            if (sequence[i] === 'pink') countPink++;
            if (sequence[i] === 'yellow') countYellow++;
        }
    }
    
    const colorNameCN = hintColor === 'blue' ? '蓝' : '粉';
    const hintCount = hintColor === 'blue' ? countBlue : countPink;
    
    drawText(`剩下的未揭示方块中，有 ${hintCount} 个${colorNameCN}方块`, vec2(0, 8), 1.2, rgb(0.8, 0.8, 0.8));
    
    // 如果有黄方块，额外显示黄块数量（可能为0）
    if (sequence.includes('yellow')) {
        drawText(`黄色方块的数量有 ${countYellow} 个`, vec2(0, 7), 1.2, rgb(255/255, 221/255, 0/255));
    }

    // 4. 绘制方块序列
    const total = sequence.length;
    // 根据方块数量自适应大小和间距，防止超出屏幕
    const blockSize = Math.min(2, 16 / total);
    const gap = blockSize * 0.5;
    const totalWidth = total * blockSize + (total - 1) * gap;
    let startX = -totalWidth / 2 + blockSize / 2;

    for (let i = 0; i < total; i++) {
        const x = startX + i * (blockSize + gap);
        const y = 2;
        
        let color = rgb(0.5, 0.5, 0.5); // 默认灰色遮挡
        // 如果已揭示，或者处于出结果阶段，显示真实颜色
        if (revealed[i] || quizPhase === PHASE_RESULT) {
            if (sequence[i] === 'blue') color = rgb(0.2, 0.4, 1);
            if (sequence[i] === 'pink') color = rgb(1, 0.4, 0.8);
            if (sequence[i] === 'yellow') color = rgb(255/255, 221/255, 0/255);
        }
        
        drawRect(vec2(x, y), vec2(blockSize, blockSize), color);

        // 如果当前方块是目标方块，画一个绿色实线框
        if (i === targetIndex) {
            const borderColor = rgb(0.2, 0.9, 0.2);
            const t = 0.15; // 边框粗细
            const hs = blockSize / 2; // 半宽
            // 上、下、左、右 四条边
            drawRect(vec2(x, y + hs), vec2(blockSize + t*2, t), borderColor);
            drawRect(vec2(x, y - hs), vec2(blockSize + t*2, t), borderColor);
            drawRect(vec2(x - hs, y), vec2(t, blockSize), borderColor);
            drawRect(vec2(x + hs, y), vec2(t, blockSize), borderColor);
        }
    }

    // 5. 底部按钮 / 提示
    if (quizPhase === PHASE_BETTING) {
        drawText('请选择操作:', vec2(0, -3), 1.2, rgb(0.8, 0.8, 0.8));
        drawButton(-12, -6, '弃权', '1');
        drawButton(0, -6, '下注一半', '2');
        drawButton(12, -6, '梭哈', '3');
    } 
    else if (quizPhase === PHASE_GUESSING) {
        drawText('请猜测目标方块的颜色:', vec2(0, -3), 1.2, rgb(1, 1, 1));
        drawButton(-12, -6, '蓝色', '1');
        drawButton(0, -6, '粉色', '2');
        drawButton(12, -6, '黄色', '3');
    } 
    else if (quizPhase === PHASE_RESULT) {
        // 结算提示
        const msgColor = data.isWin ? rgb(0.2, 0.9, 0.2) : rgb(1, 0.3, 0.3);
        drawText(resultMessage, vec2(0, -4), 1.5, msgColor);
        drawText('当前金币: ' + getCoins(), vec2(0, -6), 1.2, rgb(255/255, 221/255, 0/255));
        
        // 如果是弃权，或者梭哈猜错，或者到了第6轮，提示结束
        if (data.betType === 'fold' || (data.betType === 'all' && !data.isWin) || quizRound >= 6) {
            drawText('按下空格键进行最终结算', vec2(0, -9), 1.2, rgb(1, 1, 1));
        } else {
            drawText('按下空格键继续下一轮', vec2(0, -9), 1.2, rgb(1, 1, 1));
        }
    }
}

// 辅助函数：绘制金色按钮
function drawButton(x, y, text, key) {
    drawRect(vec2(x, y), vec2(7, 3), rgb(255/255, 221/255, 0/255, 0.9));
    drawText(text, vec2(x, y + 0.4), 1.1, rgb(0, 0, 0));
    drawText(`[按 ${key}]`, vec2(x, y - 1), 0.9, rgb(0.2, 0.2, 0.2));
}