export interface Drink {
    id: string;
    category: 'Spirits' | 'Wine' | 'Beer' | 'Prizes' | 'RedEnvelope' | 'Materials';
    name: string;
    unit: string;
    spec: string;
    price: number;
}

export const drinks: Drink[] = [
    // White Spirits (白酒)
    { id: 'kouzi-5', category: 'Spirits', name: '五年口子窖', unit: '瓶', spec: '400ml', price: 95.00 },
    { id: 'kouzi-6-red', category: 'Spirits', name: '六年口子窖 (红)', unit: '瓶', spec: '450ml', price: 120.00 },
    { id: 'kouzi-6-green', category: 'Spirits', name: '六年口子窖 (绿)', unit: '瓶', spec: '400ml', price: 118.00 },
    { id: 'xiaochijiao', category: 'Spirits', name: '小池窖 41°', unit: '瓶', spec: '500ml', price: 140.00 },
    { id: 'kouzi-10', category: 'Spirits', name: '十年口子窖 41°', unit: '瓶', spec: '500ml', price: 249.00 },
    { id: 'kouzi-20', category: 'Spirits', name: '二十年口子窖 41°', unit: '瓶', spec: '500ml', price: 352.00 },
    { id: 'kouzi-20-50', category: 'Spirits', name: '二十年口子窖 50°', unit: '瓶', spec: '500ml', price: 430.00 },

    { id: 'gujing-xianli', category: 'Spirits', name: '古井原浆献礼 40.6°', unit: '瓶', spec: '425ml', price: 85.00 },
    { id: 'gujing-xianli-500', category: 'Spirits', name: '古井原浆献礼 40.6°', unit: '瓶', spec: '500ml', price: 90.00 },
    { id: 'gujing-5', category: 'Spirits', name: '古井原浆五年 40.6°', unit: '瓶', spec: '425ml', price: 115.00 },
    { id: 'gujing-5-500', category: 'Spirits', name: '古井原浆五年 40.6°', unit: '瓶', spec: '500ml', price: 120.00 },
    { id: 'gujing-7', category: 'Spirits', name: '古井原浆七年 42°', unit: '瓶', spec: '425ml', price: 140.00 },
    { id: 'gujing-7-500', category: 'Spirits', name: '古井原浆七年 42°', unit: '瓶', spec: '500ml', price: 145.00 },
    { id: 'gujing-8', category: 'Spirits', name: '古井原浆八年 42°', unit: '瓶', spec: '425ml', price: 220.00 },
    { id: 'gujing-8-500', category: 'Spirits', name: '古井原浆八年 42°', unit: '瓶', spec: '500ml', price: 225.00 },
    { id: 'gujing-16', category: 'Spirits', name: '古井原浆十六年 42°', unit: '瓶', spec: '500ml', price: 346.00 },
    { id: 'gujing-16-50', category: 'Spirits', name: '古井原浆十六年 50°', unit: '瓶', spec: '500ml', price: 370.00 },
    { id: 'gujing-20', category: 'Spirits', name: '古井原浆二十年 42°', unit: '瓶', spec: '500ml', price: 538.00 },
    { id: 'gujing-20-52', category: 'Spirits', name: '古井原浆二十年 52°', unit: '瓶', spec: '500ml', price: 550.00 },
    { id: 'gujing-26', category: 'Spirits', name: '古井原浆二十六年 52°', unit: '瓶', spec: '500ml', price: 828.00 },

    { id: 'maotai', category: 'Spirits', name: '飞天茅台', unit: '瓶', spec: '500ml', price: 2788.00 },
    { id: 'wuliangye', category: 'Spirits', name: '五粮液 (52°)', unit: '瓶', spec: '500ml', price: 1028.00 },
    { id: 'jiannanchun', category: 'Spirits', name: '水晶剑南春 52°', unit: '瓶', spec: '500ml', price: 428.00 },

    // Red Wine (红酒)
    { id: 'weilong-cabernet', category: 'Wine', name: '威龙优选解百纳干红葡萄酒', unit: '瓶', spec: '750ml', price: 48.00 },
    { id: 'weilong-zunxuan', category: 'Wine', name: '威龙尊选干红葡萄酒-圆筒', unit: '瓶', spec: '750ml', price: 78.00 },
    { id: 'weilong-yifanfengshun', category: 'Wine', name: '威龙一帆风顺干红礼盒', unit: '盒', spec: '750ml*2', price: 148.00 },
    { id: 'weilong-zunxiang10', category: 'Wine', name: '威龙尊享10有机干红葡萄酒', unit: '瓶', spec: '750ml', price: 168.00 },
    { id: 'weilong-teji', category: 'Wine', name: '威龙特级解百纳尊赏20有机干红葡萄酒-单支礼盒', unit: '瓶', spec: '750ml', price: 238.00 },
    { id: 'weilong-zunshen', category: 'Wine', name: '威龙尊赏特级莎当妮有机干白葡萄酒-单支礼盒', unit: '瓶', spec: '750ml', price: 248.00 },
    { id: 'weilong-marias', category: 'Wine', name: '威龙玛瑟兰有机酒堡尊爵30有机干红葡萄酒-单只木盒', unit: '瓶', spec: '750ml', price: 328.00 },
    { id: 'weilong-93', category: 'Wine', name: '威龙93珍藏干红礼盒', unit: '盒', spec: '750ml*2', price: 368.00 },
    { id: 'weilong-eco', category: 'Wine', name: '威龙生态酒田优级干红葡萄酒', unit: '盒', spec: '750ml*2', price: 398.00 },
    { id: 'sikaode', category: 'Wine', name: '思康德', unit: '瓶', spec: '750ml', price: 318.00 },

    // Beer (啤酒)
    { id: 'snow-chunsheng', category: 'Beer', name: '雪花纯生', unit: '瓶', spec: '500ml', price: 7.00 },
    { id: 'snow-yongchuang', category: 'Beer', name: '雪花 (勇闯天涯)', unit: '瓶', spec: '500ml', price: 5.00 },
    { id: 'snow-qingshuang-can', category: 'Beer', name: '雪花清爽', unit: '听', spec: '330ml', price: 2.50 },
    { id: 'snow-qingshuang-bottle', category: 'Beer', name: '雪花清爽', unit: '瓶', spec: '500ml', price: 3.50 },
    { id: 'snow-superx', category: 'Beer', name: '雪花 (勇闯天涯superX)', unit: '瓶', spec: '500ml', price: 7.50 },
    { id: 'snow-classic', category: 'Beer', name: '雪花经典', unit: '瓶', spec: '500ml', price: 8.00 },
    { id: 'snow-bingku', category: 'Beer', name: '雪花冰酷', unit: '听', spec: '330ml', price: 2.00 },
    { id: 'xili', category: 'Beer', name: '喜力星银', unit: '听', spec: '500ml', price: 9.00 },

    // Prizes (奖品 & 伴手礼)
    { id: 'horse-creativity', category: 'Prizes', name: '马年文创礼品', unit: '个', spec: '伴手礼', price: 20.00 },
    { id: 'cat-blindbox', category: 'Prizes', name: '好运猫猫周边盲盒', unit: '个', spec: '盲盒', price: 12.00 },
    { id: 'scratch-lottery', category: 'Prizes', name: '刮刮乐彩票', unit: '张', spec: '彩票', price: 20.00 },

    // Major Prizes (Placeholder / Adjustable)
    { id: 'prize-grand', category: 'Prizes', name: '特等奖 (待定)', unit: '个', spec: '大奖', price: 0 },
    { id: 'prize-1', category: 'Prizes', name: '一等奖 (待定)', unit: '个', spec: '大奖', price: 0 },
    { id: 'prize-2', category: 'Prizes', name: '二等奖 (待定)', unit: '个', spec: '大奖', price: 0 },
    { id: 'prize-3', category: 'Prizes', name: '三等奖 (待定)', unit: '个', spec: '大奖', price: 0 },

    // Red Envelopes (红包)
    { id: 'red-100', category: 'RedEnvelope', name: '100元红包', unit: '个', spec: '现金', price: 100.00 },
    { id: 'red-50', category: 'RedEnvelope', name: '50元红包', unit: '个', spec: '现金', price: 50.00 },
    { id: 'red-20', category: 'RedEnvelope', name: '20元红包', unit: '个', spec: '现金', price: 20.00 },
    { id: 'red-10', category: 'RedEnvelope', name: '10元红包', unit: '个', spec: '现金', price: 10.00 },
    { id: 'red-5', category: 'RedEnvelope', name: '5元红包', unit: '个', spec: '现金', price: 5.00 },

    // Materials (物料费用)
    { id: 'material-red-envelope-packaging', category: 'Materials', name: '红包包装', unit: '个', spec: '包装', price: 1.00 },
    { id: 'material-tabletop-football', category: 'Materials', name: '桌面双人足球', unit: '个', spec: '游戏', price: 40.00 },
];
