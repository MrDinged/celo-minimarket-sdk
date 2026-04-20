import { ethers } from "ethers";

/** Validate an Ethereum address */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
}

/** Validate a positive price string (in cUSD) */
export function isValidPrice(price: string): boolean {
  try {
    const parsed = parseFloat(price);
    return !isNaN(parsed) && parsed > 0 && parsed < 1e12;
  } catch {
    return false;
  }
}

/** Validate product name (non-empty, max 100 chars) */
export function isValidProductName(name: string): boolean {
  return typeof name === "string" && name.trim().length > 0 && name.length <= 100;
}

/** Validate product description (max 500 chars) */
export function isValidDescription(description: string): boolean {
  return typeof description === "string" && description.length <= 500;
}

/** Validate token ID */
export function isValidTokenId(tokenId: number): boolean {
  return Number.isInteger(tokenId) && tokenId >= 0;
}

/** Validate AddProductParams */
export function validateAddProductParams(params: {
  name: string;
  priceInCUSD: string;
  description: string;
  imageData: string;
}): string[] {
  const errors: string[] = [];
  if (!isValidProductName(params.name)) errors.push("Invalid product name");
  if (!isValidPrice(params.priceInCUSD)) errors.push("Invalid price");
  if (!isValidDescription(params.description)) errors.push("Description too long");
  if (!params.imageData || params.imageData.trim().length === 0) errors.push("Image data required");
  return errors;
}
