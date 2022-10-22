import { LoadoutSlot } from "./LoadoutSlot";
import { Survivor } from "./Survior";

export interface Player {
    id: string;
    name: string;
    isHost?: boolean;
    preferedColor: string;
    loadout: LoadoutSlot[];
    survivors: Survivor[];
}