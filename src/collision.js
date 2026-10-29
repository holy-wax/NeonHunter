import { getBlocks, removeBlock, getBlockSize } from "./block.js";
import { getPaddlePos, getPaddleSize, getPaddleColorName } from "./paddle.js";
import { takePenalty, addCombo, getPriceMultiplier } from './gameState.js';
import { addCoins } from './hud.js';
import { getActiveBuffs } from './gameState.js';
import * as greenBuff from './buffs/greenBuff.js';
import * as purpleBuff from './buffs/purpleBuff.js';
import * as goldBuff from './buffs/goldBuff.js';

// 方块掉出这个 y 值就算漏接
const DESPAWN_Y = -14;

// ============ 预留的空函数 ============
// 玩家受到惩罚时调用。目前只打日志，具体惩罚内容以后填。
function onPenalty(reason) {
    console.log('PENALTY:', reason);
    takePenalty();
}

// 玩家获得积分时调用。
function onScore(blockColorName, basePrice) {
    addCombo();   // 连击 +1

    let finalPrice = basePrice;
    const activeBuffs = getActiveBuffs(); // 确保顶部已经 import 了 getActiveBuffs

    // 1. 蓝/粉方块享受高规格单价加成
    if (blockColorName === 'blue' || blockColorName === 'pink') {
        const priceBonus = greenBuff.getPriceBonus(activeBuffs, blockColorName)
                         + purpleBuff.getPriceBonus(activeBuffs, blockColorName)
                         + goldBuff.getPriceBonus(activeBuffs, blockColorName);
        finalPrice += priceBonus;
    }

    // 2. 黄色方块享受点石成金倍率
    if (blockColorName === 'yellow') {
        const yellowMult = goldBuff.getYellowPriceMultiplier(activeBuffs);
        finalPrice = finalPrice * yellowMult;
    }

    // 3. 只有蓝/粉享受连击倍率（因为黄块已经有自己的倍率体系了）
    if (blockColorName !== 'yellow') {
        finalPrice = Math.round(finalPrice * getPriceMultiplier());
    }

    console.log('SCORE:', blockColorName, '| base:', basePrice, '| final:', finalPrice);
    addCoins(finalPrice);
}
// ====================================

// 每帧更新：在 gameUpdate 中调用（放在 updateBlocks 之后）
export function updateCollision() {
  const blocks = getBlocks();
  const paddlePos = getPaddlePos();
  const paddleSize = getPaddleSize();
  const paddleColor = getPaddleColorName();
  const blockSize = getBlockSize();

  // 倒序遍历，因为过程中会删除元素
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];

    // ---- 1. 漏接检测 ----
    if (b.pos.y < DESPAWN_Y) {
      if (b.colorName !== "yellow") {
        onPenalty("block fell off: " + b.colorName);
      }
      removeBlock(i);
      continue;
    }

    // ---- 2. 与挡板的矩形碰撞检测（AABB） ----
    const dx = Math.abs(b.pos.x - paddlePos.x);
    const dy = Math.abs(b.pos.y - paddlePos.y);
    const overlapX = dx < (blockSize.x + paddleSize.x) / 2;
    const overlapY = dy < (blockSize.y + paddleSize.y) / 2;

    if (overlapX && overlapY) {
            const activeBuffs = getActiveBuffs();
            const hasRecycle = purpleBuff.canRecycleYellow(activeBuffs);
            
            // 判定是否算作“成功接住”：
            // 1. 颜色完全匹配
            // 2. 或者：碰的是黄色方块，且拥有“变废成宝” Buff
            const isMatch = (b.colorName === paddleColor) || 
                            (b.colorName === 'yellow' && hasRecycle);

            if (isMatch) {
                onScore(b.colorName, b.price);
            } else {
                onPenalty(
                    'color mismatch: block=' + b.colorName + ', paddle=' + paddleColor
                );
            }
            removeBlock(i);
        }
  }
}
