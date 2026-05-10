"use strict";
/**
 * 骑手头像组件
 * 圆形头像，居中显示 emoji，支持边框与配色
 */
Component({
    properties: {
        emoji: { type: String, value: '🚴' },
        color: { type: String, value: 'rgba(79,209,197,0.15)' },
        size: { type: Number, value: 60 },
        bordered: { type: Boolean, value: false },
    },
    observers: {
        'size': function (val) {
            this.setData({ emojiSize: Math.floor(val * 0.52) });
        },
    },
    data: {
        emojiSize: 32,
        borderColor: 'var(--accent)',
    },
    lifetimes: {
        attached() {
            this.setData({ emojiSize: Math.floor(this.data.size * 0.52) });
        },
    },
});
