"use strict";
/**
 * 站点信息卡片组件
 * 展示站点图标、名称、距离、海拔，以及骑友数量
 */
Component({
    properties: {
        /** 站点对象 { icon, name, km, elev, ... } */
        station: { type: Object, value: {} },
        /** 当前站点的骑友数量 */
        riderCount: { type: Number, value: 0 },
        /** 是否已到达 */
        reached: { type: Boolean, value: false },
        /** 是否为当前站点 */
        current: { type: Boolean, value: false },
    },
});
