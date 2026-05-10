/**
 * 游戏数值计算工具
 */

/** 限定范围 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/** 线性插值 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** 加权随机（返回索引） */
export function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return i;
  }
  return weights.length - 1;
}

/** 格式化公里数 */
export function formatKm(km: number): string {
  return km >= 1000 ? `${(km / 1000).toFixed(1)}k` : `${km}`;
}

/** 格式化海拔 */
export function formatElev(elev: number): string {
  return `${elev}m`;
}

/** 碰撞检测（矩形） */
export function rectCollision(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** 随机整数 [min, max] */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 随机数组元素 */
export function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
