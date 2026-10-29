import { vec2, drawRect, timeDelta, rgb } from "littlejsengine";
import { COLOR_BLUE, COLOR_PINK } from "./paddle.js";
import { getActiveBuffs } from './gameState.js';
import * as greenBuff from './buffs/greenBuff.js';
import * as purpleBuff from './buffs/purpleBuff.js';
import * as goldBuff from './buffs/goldBuff.js';

// ============ 可调试参数 ============
export let spawnInterval = 2.0; // 生成间隔（秒）  默认为2.0
export let fallSpeed = 4.0; // 下落速度（单位/秒）  默认为4.0
export let yellowChance = 0.15; // 生成黄色方块的概率（0~1）
export let normalBlockPrice = 10; // 蓝/粉方块单价
export let yellowBlockPrice = 100;// 黄色方块单价
// ====================================

// 方块尺寸
const BLOCK_SIZE = vec2(0.8, 0.8);

// 生成位置：从屏幕顶部稍上方进入视野
const SPAWN_Y = 16;

// x 方向随机范围：[-SPAWN_X_RANGE, +SPAWN_X_RANGE]
const SPAWN_X_RANGE = 22;

// 黄色方块的颜色（金色）
const COLOR_YELLOW = rgb(255 / 255, 221 / 255, 0 / 255);

// 颜色名 → Color 对象
const COLOR_MAP = {
  blue: COLOR_BLUE,
  pink: COLOR_PINK,
  yellow: COLOR_YELLOW,
};

// 当前所有存活方块的列表
const blocks = [];

// 生成计时器：累计了多少秒没生成过新方块
let spawnTimer = 0;

// 初始化：在 gameInit 中调用
export function initBlocks() {
  blocks.length = 0;
  spawnTimer = 0;
}

// 每帧更新：在 gameUpdate 中调用
export function updateBlocks() {
    const activeBuffs = getActiveBuffs();
    
    // 计算动态生成间隔（基础值 - 所有缩减加成）
    const freqBonus = greenBuff.getFreqBonus(activeBuffs) 
                    + purpleBuff.getFreqBonus(activeBuffs) 
                    + goldBuff.getFreqBonus(activeBuffs);
    // 设定最小间隔限制，防止间隔变成 0 或负数导致卡死
    const currentSpawnInterval = Math.max(0.2, spawnInterval - freqBonus);

    // 计算动态下落速度（基础值 + 所有提速加成）
    const speedBonus = greenBuff.getSpeedBonus(activeBuffs) 
                     + purpleBuff.getSpeedBonus(activeBuffs) 
                     + goldBuff.getSpeedBonus(activeBuffs);
    const currentFallSpeed = fallSpeed + speedBonus;

    // 1. 生成计时
    if (currentSpawnInterval > 0) {
        spawnTimer += timeDelta;
        if (spawnTimer >= currentSpawnInterval) {
            spawnTimer -= currentSpawnInterval;
            spawnBlock();
        }
    }

    // 2. 所有方块下落
    for (const b of blocks) {
        b.pos.y -= currentFallSpeed * timeDelta;
    }
}

// 渲染：在 gameRenderPost 中调用
export function renderBlocks() {
  for (const b of blocks) {
    drawRect(b.pos, BLOCK_SIZE, COLOR_MAP[b.colorName]);
  }
}

// ---- 供 collision.js 使用的接口 ----

export function getBlocks() {
  return blocks;
}

export function removeBlock(index) {
  blocks.splice(index, 1);
}

export function clearBlocks() {
    blocks.length = 0;
}

export function getBlockSize() {
  return BLOCK_SIZE;
}

// ---- 内部函数 ----

// 随机选择一个颜色名
function pickColorName() {
    const activeBuffs = getActiveBuffs();
    
    // 获取各个等级提供的黄块概率覆盖值
    const g = greenBuff.getYellowChanceOverride(activeBuffs);
    const p = purpleBuff.getYellowChanceOverride(activeBuffs);
    const go = goldBuff.getYellowChanceOverride(activeBuffs);

    // 取 基础概率 和 所有Buff覆盖值 中的最大值
    const currentChance = Math.max(yellowChance, g, p, go);

    if (Math.random() < currentChance) return 'yellow';
    return Math.random() < 0.5 ? 'blue' : 'pink';
}

// 生成一个新方块
function spawnBlock() {
    const x = (Math.random() * 2 - 1) * SPAWN_X_RANGE;
    const colorName = pickColorName();
    const price = colorName === 'yellow' ? yellowBlockPrice : normalBlockPrice;
    blocks.push({
        pos: vec2(x, SPAWN_Y),
        colorName: colorName,
        price: price,
    });
}
