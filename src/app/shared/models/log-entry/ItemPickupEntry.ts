import { LogEntry } from "./LogEntry";

export class ItemPickupEntry extends LogEntry {
   public readonly playerId: string = '';
   public readonly playerName: string = '';
   public readonly itemId: number = 0;
   public readonly itemName: string = '';
   public readonly count: number = 0;

   constructor(json: any) {
      super();
      this._initializeWith(json);
   }
}
