import type { Drink } from './drinks';

export interface PlannerConfig {
    budget: number;
    floatRatio: number;
    peopleDigitalCenter: number;
    peopleCommercialVehicle: number;
    itbpLeads: { name: string; people: number; perPerson: number; extra: number }[];
    peopleGuests: number;
    tableCount: number;
    cart: Record<string, number>;
    customMaterials: Drink[];
    customPrizes: Drink[];
    prizeEdits: Record<string, Partial<Drink>>;
    customRedEnvelopes: Drink[];
    redEnvelopeEdits: Record<string, Partial<Drink>>;
}

export const sharedConfig: Partial<PlannerConfig> = {
    "budget": 27865,
    "floatRatio": 0,
    "peopleDigitalCenter": 67,
    "peopleCommercialVehicle": 54,
    "itbpLeads": [
        {
            "name": "牛志高",
            "people": 0,
            "perPerson": 0,
            "extra": 0
        },
        {
            "name": "汪亚青",
            "people": 0,
            "perPerson": 0,
            "extra": 0
        },
        {
            "name": "陆旭宴",
            "people": 1,
            "perPerson": 0,
            "extra": 0
        },
        {
            "name": "李昊",
            "people": 2,
            "perPerson": 212,
            "extra": 0
        },
        {
            "name": "左晓海",
            "people": 0,
            "perPerson": 0,
            "extra": 0
        },
        {
            "name": "张主涛",
            "people": 0,
            "perPerson": 0,
            "extra": 0
        },
        {
            "name": "李云峰",
            "people": 0,
            "perPerson": 0,
            "extra": 0
        }
    ],
    "peopleGuests": 10,
    "tableCount": 14,
    "cart": {
        "horse-creativity": 28,
        "cat-blindbox": 28,
        "material-red-envelope-packaging": 180,
        "material-tabletop-football": 2,
        "custom-material-1768378074197": 1,
        "prize-grand": 1,
        "prize-1": 2,
        "prize-2": 7,
        "prize-3": 5,
        "gujing-8-500": 28,
        "snow-qingshuang-bottle": 24,
        "red-5": 110,
        "red-10": 40,
        "red-20": 20,
        "red-50": 3,
        "red-100": 2,
        "custom-red-envelope-1768748845499": 1,
        "custom-red-envelope-1768748892512": 2,
        "custom-red-envelope-1768748870031": 1,
        "custom-red-envelope-1768748955405": 3,
        "custom-prize-1768791547078": 14
    },
    "customMaterials": [
        {
            "id": "custom-material-1768378074197",
            "category": "Materials",
            "name": "横幅",
            "unit": "个",
            "spec": "自定义",
            "price": 35
        }
    ],
    "customPrizes": [
        {
            "id": "custom-prize-1768791547078",
            "category": "Prizes",
            "name": "唱歌马年文创",
            "unit": "?",
            "spec": "1",
            "price": 40
        }
    ],
    "prizeEdits": {
        "prize-grand": {
            "name": "特等奖",
            "spec": "大奖",
            "unit": "个",
            "price": 800
        },
        "prize-1": {
            "name": "一等奖",
            "spec": "大奖",
            "unit": "个",
            "price": 500
        },
        "prize-2": {
            "name": "二等奖",
            "spec": "大奖",
            "unit": "个",
            "price": 150
        },
        "prize-3": {
            "name": "三等奖 导演小组抽",
            "spec": "大奖",
            "unit": "个",
            "price": 50
        }
    },
    "customRedEnvelopes": [
        {
            "id": "custom-red-envelope-1768748845499",
            "category": "RedEnvelope",
            "name": "足球冠军红包",
            "unit": "1",
            "spec": "现金",
            "price": 800
        },
        {
            "id": "custom-red-envelope-1768748870031",
            "category": "RedEnvelope",
            "name": "足球亚军红包",
            "unit": "个",
            "spec": "现金",
            "price": 400
        },
        {
            "id": "custom-red-envelope-1768748892512",
            "category": "RedEnvelope",
            "name": "三四名红包",
            "unit": "1",
            "spec": "现金",
            "price": 200
        },
        {
            "id": "custom-red-envelope-1768748955405",
            "category": "RedEnvelope",
            "name": "剩下三名红包",
            "unit": "1",
            "spec": "现金",
            "price": 100
        }
    ],
    "redEnvelopeEdits": {}
};
