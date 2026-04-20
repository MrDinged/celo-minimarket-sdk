export interface Product {
  tokenId: number; vendor: string; name: string; priceWei: bigint;
  description: string; imageData: string; active: boolean; sold: boolean;
}
export interface ProductInput { name: string; priceWei: bigint; description: string; imageData: string; }
export function toProduct(raw: any): Product {
  return {
    tokenId: Number(raw.tokenId || raw[0]), vendor: String(raw.vendor || raw[1]),
    name: String(raw.name || raw[2]), priceWei: BigInt(raw.priceWei || raw[3]),
    description: String(raw.description || raw[4]), imageData: String(raw.imageData || raw[5]),
    active: Boolean(raw.active ?? raw[6]), sold: Boolean(raw.sold ?? raw[7]),
  };
}
export function toProducts(arr: any[]): Product[] { return arr.map(toProduct); }
export function isAvailable(p: Product): boolean { return p.active && !p.sold; }
export function isOwnedBy(p: Product, addr: string): boolean { return p.vendor.toLowerCase() === addr.toLowerCase(); }
