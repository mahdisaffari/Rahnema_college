/**
 * ghavanin input hay ke dar har fild bayad rayat beshe
 */

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const isPassword = (s: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(s);

export const normEmail = (e: string) => e.trim().toLowerCase();

export const isValidUrl = (s: string) =>
  /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(s);

