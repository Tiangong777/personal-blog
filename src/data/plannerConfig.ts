import type { Drink } from './drinks';

export interface PlannerConfig {
    title: string;
    time: string;
    location: string;
    budget: number;
    floatRatio: number;
    peopleDigitalCenter: number;
    peopleCommercialVehicle: number;
    itbpLeads: { name: string; people: number; perPerson: number; extra: number }[];
    peopleGuests: number;
    tableCount: number;
    mealPrice: number;
    dinnerMenu: { title: string; items: string[] }[];
    cart: Record<string, number>;
    customMaterials: Drink[];
    customPrizes: Drink[];
    prizeEdits: Record<string, Partial<Drink>>;
    customRedEnvelopes: Drink[];
    redEnvelopeEdits: Record<string, Partial<Drink>>;
    itemEdits: Record<string, Partial<Drink>>;
}

export const sharedConfig: Partial<PlannerConfig> = {
    // Current placeholder, will be filled by full export
};
