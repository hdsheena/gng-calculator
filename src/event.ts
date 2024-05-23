import { Mineshaft } from './mineshaft';
import { Card } from './card';
export interface Event {
    Id: string;
    Shafts: Mineshaft[];
    ExtraCards: Card[];
    Notes: string;
}
  