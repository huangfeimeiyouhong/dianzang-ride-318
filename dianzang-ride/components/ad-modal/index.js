"use strict";
/**
 * 广告复活弹窗组件
 * 挑战失败后展示，提供"看广告复活"和"接受惩罚"两个选项
 */
Component({
    properties: {
        show: { type: Boolean, value: false },
        title: { type: String, value: '挑战失败' },
        penalty: { type: String, value: '' },
    },
    methods: {
        /** 选择看广告 */
        handleAd() {
            this.triggerEvent('ad');
        },
        /** 选择跳过，接受惩罚 */
        handleSkip() {
            this.triggerEvent('skip');
        },
        /** 阻止蒙层下方滚动 */
        noop() { },
    },
});
