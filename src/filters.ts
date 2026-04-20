import { Product } from './product';
export interface ProductFilter { status?: 'available' | 'sold' | 'inactive' | 'all'; vendor?: string; search?: string; minPrice?: bigint; maxPrice?: bigint; }
export function applyFilter(products: Product[], f: ProductFilter): Product[] {
  let r = products;
  if (f.status && f.status !== 'all') {
    r = r.filter(p => f.status === 'available' ? p.active && !p.sold : f.status === 'sold' ? p.sold : !p.active && !p.sold);
  }
  if (f.vendor) { const l = f.vendor.toLowerCase(); r = r.filter(p => p.vendor.toLowerCase() === l); }
  if (f.search) { const terms = f.search.toLowerCase().split(/\s+/); r = r.filter(p => terms.every(t => `${p.name} ${p.description}`.toLowerCase().includes(t))); }
  if (f.minPrice !== undefined) r = r.filter(p => p.priceWei >= f.minPrice!);
  if (f.maxPrice !== undefined) r = r.filter(p => p.priceWei <= f.maxPrice!);
  return r;
}
