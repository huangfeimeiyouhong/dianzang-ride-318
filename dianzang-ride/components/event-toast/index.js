"use strict";
/**
 * 事件触发弹窗组件
 * 居中覆盖层，展示事件信息并提供"接受挑战"按钮
 */
Component({
    properties: {
        show: { type: Boolean, value: false },
        icon: { type: String, value: '' },
        title: { type: String, value: '' },
        desc: { type: String, value: '' },
    },
    methods: {
        handleAccept() {
            this.triggerEvent('accept');
        },
        /** 阻止蒙层下方滚动 */
        noop() { },
    },
});
