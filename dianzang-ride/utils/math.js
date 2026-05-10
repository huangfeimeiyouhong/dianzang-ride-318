/**
 * 游戏数值计算工具
 */
/** 限定范围 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
/** 线性插值 */
export function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}
/** 加权随机（返回索引） */
export function weightedRandomIndex(weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0)
            return i;
    }
    return weights.length - 1;
}
/** 格式化公里数 */
export function formatKm(km) {
    return km >= 1000 ? `${(km / 1000).toFixed(1)}k` : `${km}`;
}
/** 格式化海拔 */
export function formatElev(elev) {
    return `${elev}m`;
}
/** 碰撞检测（矩形） */
export function rectCollision(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
/** 随机整数 [min, max] */
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** 随机数组元素 */
export function randPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
