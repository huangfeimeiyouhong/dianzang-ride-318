/**
 * 关卡游戏基类
 * 提供 Canvas 初始化、游戏循环、生命周期管理
 */
export abstract class BaseGame {
  protected ctx: any;
  protected width: number;
  protected height: number;
  protected running = false;
  protected dpr: number;

  /** 子类实现：初始化游戏状态 */
  abstract onInit(): void;
  /** 子类实现：每帧更新逻辑，dt 为毫秒 */
  abstract onUpdate(dt: number): void;
  /** 子类实现：每帧渲染 */
  abstract onRender(): void;

  constructor(canvas: any, width: number, height: number, dpr: number) {
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
    const loop = (time: number) => {
      if (!this.running) return;
      const dt = last ? time - last : 16;
      last = time;
      this.onUpdate(dt);
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.onRender();
      const nextFrame = (wx as any).requestAnimationFrame ? (wx as any).requestAnimationFrame.bind(wx) : (cb: any) => setTimeout(cb, 16);
      nextFrame(loop);
    };
    const nextFrame = (wx as any).requestAnimationFrame ? (wx as any).requestAnimationFrame.bind(wx) : (cb: any) => setTimeout(cb, 16);
    nextFrame(loop);
  }

  stop() {
    this.running = false;
  }
}
