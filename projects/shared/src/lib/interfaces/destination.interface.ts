export interface DestinationFacts {
  bestSeason: string;
  flightTime: string;
  language: string;
  currency: string;
}

/** A place customers can book: the only destinations an order may point at, by `id`. */
export interface Destination {
  id: string;
  name: string;
  emoji: string;
  /** A photo; the gradient and emoji stand in where there is none or it fails to load. */
  imageSrc?: string;
  description: string;
  fromPrice: number;
  gradient: string;
  facts?: DestinationFacts;
  /** Inactive destinations stay on old orders but cannot be booked any more. */
  active: boolean;
  /** Shown instead of the "flights from" line, for destinations built from real bookings. */
  note?: string;
}
