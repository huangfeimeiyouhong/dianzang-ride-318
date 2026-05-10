/**
 * 关卡游戏基类
 * 提供 Canvas 初始化、游戏循环、生命周期管理
 */
export class BaseGame {
    constructor(canvas, width, height, dpr) {
        this.running = false;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.dpr = dpr;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        this.ctx.scale(dpr, dpr);
    }
    start() {
        this.running = true;
        this.onInit();
        let last = 0;
        const loop = (time) => {
            if (!this.running)
                return;
            const dt = last ? time - last : 16;
            last = time;
            this.onUpdate(dt);
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.onRender();
            const nextFrame = wx.requestAnimationFrame ? wx.requestAnimationFrame.bind(wx) : (cb) => setTimeout(cb, 16);
            nextFrame(loop);
        };
        const nextFrame = wx.requestAnimationFrame ? wx.requestAnimationFrame.bind(wx) : (cb) => setTimeout(cb, 16);
        nextFrame(loop);
    }
    stop() {
        this.running = false;
    }
}
