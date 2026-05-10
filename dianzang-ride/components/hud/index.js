"use strict";
/**
 * 顶部状态栏组件
 * 横排显示体能、已骑行、心情、耐久四项数据
 */
Component({
    properties: {
        energy: { type: Number, value: 0 },
        km: { type: Number, value: 0 },
        mood: { type: Number, value: 100 },
        durability: { type: Number, value: 100 },
    },
    observers: {
        'energy': function (val) {
            // 体能百分比：假设满值 100
            this.setData({ energyPct: Math.min(val, 100) });
        },
        'km': function (val) {
            // 全程 2100km
            this.setData({ kmPct: Math.min((val / 2100) * 100, 100) });
        },
        'mood': function (val) {
            this.setData({
                moodColor: val > 60 ? '#68d391' : val > 30 ? '#f6ad55' : '#fc8181',
            });
        },
        'durability': function (val) {
            this.setData({
                durabilityColor: val > 50 ? '#4fd1c5' : val > 20 ? '#f6ad55' : '#fc8181',
            });
        },
    },
    data: {
        energyPct: 0,
        kmPct: 0,
        moodColor: '#68d391',
        durabilityColor: '#4fd1c5',
    },
});
