import { drawText, drawCircle, drawLineList, drawRect, vec2, rgb } from 'littlejsengine';
import { getLives, getMaxLives, getComboCount, getCollectCoins, getFinalIncome, getRoundInfo, getBuffOptions } from './gameState.js';

// 等级对应的半透明背景色
const COLOR_BUFF_GREEN  = rgb(0.2, 0.8, 0.3, 0.6);  // 绿色
const COLOR_BUFF_PURPLE = rgb(0.6, 0.2, 0.8, 0.6);  // 紫色
const COLOR_BUFF_GOLD   = rgb(0.9, 0.7, 0.1, 0.6);  // 金色

// ============ 金币数值（后续接入分数系统时使用）============
let coins = 0;

export function setCoins(value) {
    coins = value;
}

export function addCoins(amount) {
    coins += amount;
}

export function getCoins() {
    return coins;
}
// ============================================================

// ---- 生命值参数 ----
const LIFE_CIRCLE_DIAMETER = 0.8;  // 圆圈直径
const LIFE_X = -24;                // 一列圆圈共用的 x
const LIFE_TOP_Y = -8;             // 最上面圆圈的 y
const LIFE_SPACING = 1.0;          // 圆圈之间的间距
const COLOR_LIFE_RED = rgb(1, 0.2, 0.2);
const COLOR_LIFE_GRAY = rgb(0.4, 0.4, 0.4);

// ---- 金币参数 ----
const COIN_ICON_CENTER = vec2(-24, 11.5);  // 三角形中心
const COIN_ICON_HALF_SIZE = 0.6;           // 三角形半宽/半高
const COIN_TEXT_GAP = 1.2;                 // 数值与三角形的水平距离
const COLOR_COIN_GREEN = rgb(0.2, 0.8, 0.3);
const COLOR_COIN_SYMBOL = rgb(255, 221, 0);    // ￥ 字符（金色）
const COLOR_COIN_VALUE = rgb(1, 1, 1);     // 金币数值（白色）

// ---- 连击参数 ----
const COMBO_LABEL_POS = vec2(24, 11.5);   // "连击数"文字位置（右上角）
const COMBO_VALUE_POS = vec2(24, 10.5); // 数值位置（标签下方）
const COLOR_COMBO_TEXT = rgb(1, 1, 1);  // 白色

// ---- 对外接口：在 gameRenderPost 中调用 ----
export function renderHUD() {
    renderLives();
    renderCoins();
    renderCombo();
    renderRoundInfo();
}

// ---- 内部实现 ----

function renderLives() {
    const total = getMaxLives();
    const lost = total - getLives();   // 已熄灭的圆圈数

    for (let i = 0; i < total; i++) {
        const y = LIFE_TOP_Y - i * LIFE_SPACING;
        const isLost = i < lost;
        drawCircle(
            vec2(LIFE_X, y),
            LIFE_CIRCLE_DIAMETER,
            isLost ? COLOR_LIFE_GRAY : COLOR_LIFE_RED
        );
    }
}

function renderCoins() {
    const s = COIN_ICON_HALF_SIZE;
    const trianglePoints = [
        vec2(0, s),      // 顶部
        vec2(-s, -s),    // 左下
        vec2(s, -s),     // 右下
    ];

    // 用 drawLineList 绘制封闭的绿色三角形
    drawLineList(trianglePoints, 0.20, COLOR_COIN_GREEN, true, COIN_ICON_CENTER);

    // 三角形中心的 ￥（金色）
    drawText('￥', COIN_ICON_CENTER, 1.0, COLOR_COIN_SYMBOL);

    // 三角形右侧的数值（白色）
    const valuePos = vec2(
        COIN_ICON_CENTER.x + COIN_TEXT_GAP,
        COIN_ICON_CENTER.y
    );
    drawText(String(coins), valuePos, 1.0, COLOR_COIN_VALUE, 0, rgb(0, 0, 0), 'left');
}

function renderCombo() {
    drawText('连击数', COMBO_LABEL_POS, 1.0, COLOR_COMBO_TEXT);
    drawText(String(getComboCount()), COMBO_VALUE_POS, 1.1, COLOR_COMBO_TEXT);
}

// ---- 主菜单 ----
const COLOR_MENU_TITLE = rgb(255/255, 221/255, 0/255);   // 金色，和金币￥一致
const COLOR_MENU_HINT = rgb(0.7, 0.7, 0.7);              // 灰色提示

export function renderMenu() {
    drawText('霓虹捕手NeonHunter', vec2(0, 4), 3, COLOR_MENU_TITLE);
    drawText('by:Holywaxcat',vec2(0,1),1.0,COLOR_MENU_TITLE)
    drawText('按下空格键开始游戏', vec2(0, -2), 1.5, COLOR_MENU_HINT);
}

// ---- 暂停界面 ----
const COLOR_PAUSE_TITLE = rgb(255/255, 221/255, 0/255);  // 金色，和标题一致
const COLOR_PAUSE_HINT  = rgb(0.7, 0.7, 0.7);            // 灰色提示

export function renderPauseOverlay() {
    drawText('已暂停', vec2(0, 3), 3, COLOR_PAUSE_TITLE);
    
    // 去掉了多出来的那个 0，把描边颜色设为 rgb(0,0,0)
    drawText('按下 ESC 继续游戏', vec2(-6, -1), 1.2, COLOR_PAUSE_HINT, 0, rgb(0,0,0), 'left');
    drawText('按下 Q 键返回主菜单', vec2(-6, -3), 1.0, COLOR_PAUSE_HINT, 0, rgb(0,0,0), 'left');
}

// ---- 游戏结束 ----
const COLOR_GAMEOVER_TITLE = rgb(1, 0.3, 0.3);           // 红色
const COLOR_GAMEOVER_VALUE = rgb(1, 1, 1);               // 白色
const COLOR_GAMEOVER_HINT  = rgb(0.7, 0.7, 0.7);         // 灰色

export function renderGameOver() {
    drawText('GAME OVER', vec2(0, 6), 3, COLOR_GAMEOVER_TITLE);
    
    // 使用新的函数名获取数值
    drawText('收集阶段总收入: ' + getCollectCoins(), vec2(0, 1.5), 1.5, COLOR_COIN_SYMBOL);
    drawText('最终收获: ' + getFinalIncome(), vec2(0, -1.5), 2, COLOR_GAMEOVER_VALUE);
    
    drawText('按下空格键返回主菜单', vec2(0, -6), 1.0, COLOR_GAMEOVER_HINT);
}


function renderRoundInfo() {
    const info = getRoundInfo();
    // 把时间放在稍上方，字号 1.2
    drawText('剩余时间: ' + Math.ceil(info.timeLeft) + 's', vec2(0, 12), 1.2, rgb(0.8, 0.8, 0.8));
    // 把轮次信息放在下方，格式 "1 / 10"，字号调小为 1.0
    drawText(info.current + ' / ' + info.max, vec2(0, 11), 1.0, rgb(1, 1, 1));
}


// ---- 轮次结束选择 ----
const COLOR_ROUND_END_TITLE = rgb(1, 0.8, 0.2);
const COLOR_ROUND_END_HINT = rgb(1, 1, 1);

export function renderRoundEnd() {
    drawText('本轮结束！', vec2(0, 4), 3, COLOR_ROUND_END_TITLE);
    
    // 同样去掉多出来的 0
    drawText('按 A 进入下一轮', vec2(-6, 0), 1.5, COLOR_ROUND_END_HINT, 0, rgb(0,0,0), 'left');
    drawText('按 D 进入猜谜环节', vec2(-6, -2), 1.5, COLOR_ROUND_END_HINT, 0, rgb(0,0,0), 'left');
}

// ---- 猜谜环节（占位）----
export function renderQuiz() {
    drawText('猜谜环节开发中...', vec2(0, 2), 2, rgb(1, 1, 1));
    drawText('按下空格键返回主菜单', vec2(0, -2), 1.2, rgb(0.7, 0.7, 0.7));
}

export function renderBuffSelect() {
    const options = getBuffOptions();
    const xPositions = [-14, 0, 14]; 

    for (let i = 0; i < 3; i++) {
        if (!options[i]) continue;
        const x = xPositions[i];
        const level = options[i].level;

        // 1. 根据等级选择半透明底色
        let boxColor = COLOR_BUFF_GREEN;
        if (level === 'purple') boxColor = COLOR_BUFF_PURPLE;
        if (level === 'gold') boxColor = COLOR_BUFF_GOLD;

        drawRect(vec2(x, 2), vec2(12, 12), boxColor);

        // 2. Buff 名称（稍微往上提一点，给下面腾出空间）
        drawText(options[i].name, vec2(x, 6), 1.2, rgb(1, 1, 1));

        // 3. 功能描述（即使有 \n 换行，也会在 y=1 这个中心点居中显示）
        drawText(options[i].desc, vec2(x, 1), 0.9, rgb(1, 1, 1));

        // 4. 数字标识（保持不变）
        drawText(String(i + 1), vec2(x, -6), 1.2, rgb(1, 1, 1));
    }

    drawText("(若buff的名字前有'#'号，则代表此buff在获得后将不会再出现)", vec2(0, -7.5), 1.0, rgb(0.6, 0.6, 0.6));
    drawText('按下对应的数字键选择 Buff', vec2(0, -9.5), 1.2, rgb(0.8, 0.8, 0.8));
}

// ---- 猜谜教程页面 ----
export function renderQuizTutorial() {
    // 1. 绘制半透明黑底遮罩，保证文字清晰
    drawRect(vec2(0, 2), vec2(46, 24), rgb(0, 0, 0, 0.85));

    // 2. 标题
    drawText('猜谜环节规则', vec2(0, 10), 2.5, rgb(255/255, 221/255, 0/255));

    // 3. 规则文本（左对齐）
    const textColor = rgb(0.9, 0.9, 0.9);
    const x = -18;
    
    drawText('猜谜环节中，每轮会生成若干个方块，系统会指定一个方块', vec2(x, 4), 1.0, textColor, 0, rgb(0,0,0), 'left');
    drawText('屏幕上面会显示剩余未揭示的方块中，有几个蓝方块或几个粉方块，\n以及各个颜色方块的总数\n根据信息进行猜测选中方块的颜色是什么', vec2(x, 2), 1.0, textColor, 0, rgb(0,0,0), 'left');
    drawText('你可以在最开始按数字键进行下注，下注一半赢1.5倍，梭哈赢2倍，\n若猜中黄方块则额外赢4倍', vec2(x, -2), 1.0, textColor, 0, rgb(0,0,0), 'left');
    drawText('猜错则失去所有下注钱财，并选择是否进入下一轮猜谜', vec2(x, -4), 1.0, textColor, 0, rgb(0,0,0), 'left');
    drawText('玩家也可以选择主动交纳当前金币数的70%主动退出', vec2(x, -5), 1.0, textColor, 0, rgb(0,0,0), 'left');
    drawText('主动结束或金币归零游戏结束，进行结算', vec2(x, -6), 1.0, textColor, 0, rgb(0,0,0), 'left');

    // 4. 底部提示
    drawText('按下空格键表示我已知晓规则并正式开始', vec2(0, -10), 1.2, rgb(255/255, 221/255, 0/255));
}
