import { Mineshaft } from './mineshaft';
export interface Card {
    Id: string;
    Shaft: Mineshaft;
    Rarity: string;
    MaxLevel: number;
  }