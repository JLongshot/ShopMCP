import catalogData from "../../catalog.json";

export interface Product {
  id: string;
  name: string;
  type: "physical" | "service" | "digital";
  price_cents: number;
  stock: number;
  images: string[];
  description: string;
  agent_pitch: string;
  provenance: string;
  vibe: string[];
  pairs_well_with: string[];
  conversation_starter: string;
  requires: string[];
  fulfillment_notes: string;
  shipping_flat_cents: number;
  contact_only?: boolean;
}

const catalog: Product[] = catalogData as Product[];

export interface ListFilters {
  vibe?: string;
  type?: string;
  max_price_cents?: number;
}

/** Compact listing for agents — omits provenance, fulfillment_notes, images */
export function listProducts(filters?: ListFilters) {
  let items = catalog.filter((p) => p.stock > 0);

  if (filters?.vibe) {
    items = items.filter((p) => p.vibe.includes(filters.vibe!));
  }
  if (filters?.type) {
    items = items.filter((p) => p.type === filters.type);
  }
  if (filters?.max_price_cents != null) {
    items = items.filter((p) => p.price_cents <= filters.max_price_cents!);
  }

  return items.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price_cents: p.price_cents,
    agent_pitch: p.agent_pitch,
    vibe: p.vibe,
  }));
}

/** Full product detail — everything except fulfillment_notes */
export function getProduct(id: string) {
  const product = catalog.find((p) => p.id === id);
  if (!product) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fulfillment_notes, ...publicFields } = product;
  return publicFields;
}

/** All products, for the website (not agents) */
export function getAllProducts() {
  return catalog;
}
