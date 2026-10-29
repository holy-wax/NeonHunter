import {
  vec2,
  drawRect,
  mousePos,
  keyWasPressed,
  mouseWasPressed,
  rgb,
} from "littlejsengine";

// 挡板的位置和尺寸（模块内部私有变量）
let paddlePos = vec2(0, -10);
let paddleSize = vec2(3, 1);

const INITIAL_WIDTH = 3;

// 状态：true = 蓝色，false = 粉色
let isBlueState = true;

// 两种状态的颜色（rgb 参数范围 0-1，用 xxx/255 的形式表示）
export const COLOR_BLUE = rgb(51 / 255, 102 / 255, 255 / 255); // #3366ff
export const COLOR_PINK = rgb(255 / 255, 102 / 255, 204 / 255); // #ff66cc

// 初始化：在 gameInit 中调用
export function initPaddle() {
  paddlePos.y = -10;
  paddleSize.x = INITIAL_WIDTH;
  isBlueState = true; // 游戏开始时默认蓝色
}

export function addPaddleWidth(amount) {
    paddleSize.x += amount;
}

// 每帧更新：在 gameUpdate 中调用
export function updatePaddle() {
  // 水平位置跟随鼠标
  paddlePos.x = mousePos.x;

  // 空格键 或 鼠标左键 → 切换状态
  if (keyWasPressed("Space") || mouseWasPressed(0)) {
    isBlueState = !isBlueState;
  }
}

// 渲染：在 gameRenderPost 中调用
export function renderPaddle() {
  const color = isBlueState ? COLOR_BLUE : COLOR_PINK;
  drawRect(paddlePos, paddleSize, color);
}

export function getPaddlePos() {
  return paddlePos;
}

export function getPaddleSize() {
  return paddleSize;
}

// 返回 'blue' 或 'pink'
export function getPaddleColorName() {
  return isBlueState ? "blue" : "pink";
}

