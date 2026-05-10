/**
 * Canvas 绘制工具函数
 * 封装常用的绘制操作
 */
/** 绘制圆角矩形 */
export function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
/** 绘制填充圆角矩形 */
export function fillRoundRect(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
}
/** 绘制圆形 */
export function fillCircle(ctx, cx, cy, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
}
/** 绘制进度条 */
export function drawProgressBar(ctx, x, y, w, h, progress, bgColor, fillColor) {
    // 背景
    fillRoundRect(ctx, x, y, w, h, h / 2, bgColor);
    // 填充
    const fillW = Math.max(h, w * Math.min(progress, 1));
    fillRoundRect(ctx, x, y, fillW, h, h / 2, fillColor);
}
/** 绘制文字（居中） */
export function drawCenteredText(ctx, text, cx, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, y);
}
/** 绘制线性渐变背景 */
export function drawGradientBg(ctx, w, h, colors) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    colors.forEach(c => grad.addColorStop(c.stop, c.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
}
