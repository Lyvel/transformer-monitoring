import { VoltageReading } from "./voltage-reading.type";

export type Transformer = {
    assetId: number;
    name: string;
    region: string;
    health: string;
    lastTenVoltgageReadings: VoltageReading[];
};
