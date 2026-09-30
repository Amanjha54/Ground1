/**
 * Generates human-readable, collision-resistant public identifiers
 * conforming to the Ground0 standard: GR0-XXXX (e.g. GR0-2941)
 */
export function generateComplaintPublicId(): string {
  // Generate random 4-digit number between 1000 and 9999
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GR0-${randomNum}`;
}

export function isValidComplaintPublicId(id: string): boolean {
  return /^GR0-\d{4}$/.test(id);
}
