import { Mineshaft } from './mineshaft';
import { Card } from './card';
export interface Balance {
    Id: string;
    Shafts: Mineshaft[];
    ExtraCards: Card[];
    Notes: string;
}
  