/**
 * Utility functions for date normalization, parsing, validation, and age calculation.
 */

/**
 * Normalizes input string into DD/MM/YYYY format if possible.
 * Replaces separators (- . space) with /, converts YYYY-MM-DD to DD/MM/YYYY,
 * pads single digit days/months, and inserts slashes for continuous digits (DDMMYYYY).
 */
export function normalizeDateInput(input: string): string {
  if (!input) return '';

  let trimmed = input.trim();

  // Replace separators like -, ., space with /
  trimmed = trimmed.replace(/[-.\s]+/g, '/');

  // Check if format is YYYY/MM/DD
  const isoMatch = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(trimmed);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    const paddedDd = dd.padStart(2, '0');
    const paddedMm = mm.padStart(2, '0');
    return `${paddedDd}/${paddedMm}/${yyyy}`;
  }

  // Check continuous digits DDMMYYYY
  const continuousMatch = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
  if (continuousMatch) {
    const [, dd, mm, yyyy] = continuousMatch;
    return `${dd}/${mm}/${yyyy}`;
  }

  // Check if format is DD/MM/YYYY with potential 1-digit day or month
  const ddmmyyyyMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (ddmmyyyyMatch) {
    const [, dd, mm, yyyy] = ddmmyyyyMatch;
    const paddedDd = dd.padStart(2, '0');
    const paddedMm = mm.padStart(2, '0');
    return `${paddedDd}/${paddedMm}/${yyyy}`;
  }

  return trimmed;
}

export interface DateValidationResult {
  isValid: boolean;
  normalizedDate: string;
  age: number | null;
  errorMessage?: string;
}

/**
 * Validates and parses a birth date string.
 * Normalizes separators, verifies calendar validity (days per month, leap years),
 * ensures date is not in the future, and age is within reasonable bounds (0-130 years).
 */
export function validateAndParseBirthDate(input: string): DateValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      normalizedDate: '',
      age: null,
      errorMessage: 'La fecha de nacimiento es requerida.'
    };
  }

  const normalized = normalizeDateInput(input);
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalized);

  if (!match) {
    return {
      isValid: false,
      normalizedDate: normalized,
      age: null,
      errorMessage: 'Formato de fecha inválido. Debe ser DD/MM/YYYY (ej: 15/08/1990).'
    };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      normalizedDate: normalized,
      age: null,
      errorMessage: 'El mes ingresado no es válido (debe ser de 01 a 12).'
    };
  }

  // Check days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return {
      isValid: false,
      normalizedDate: normalized,
      age: null,
      errorMessage: `El día ${day} no es válido para el mes ${month} del año ${year}.`
    };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // Reset time portions for strict date comparisons
  today.setHours(0, 0, 0, 0);
  birthDate.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    return {
      isValid: false,
      normalizedDate: normalized,
      age: null,
      errorMessage: 'La fecha de nacimiento no puede ser futura.'
    };
  }

  let age = today.getFullYear() - year;
  const m = (today.getMonth() + 1) - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }

  if (age > 130) {
    return {
      isValid: false,
      normalizedDate: normalized,
      age: null,
      errorMessage: 'La edad calculada supera el límite válido (máximo 130 años).'
    };
  }

  return {
    isValid: true,
    normalizedDate: normalized,
    age
  };
}

/**
 * Calculates age for a valid birth date string or returns null if invalid.
 */
export function calculateAgeFromBirthDate(birthDateStr: string): number | null {
  const result = validateAndParseBirthDate(birthDateStr);
  return result.isValid ? result.age : null;
}
