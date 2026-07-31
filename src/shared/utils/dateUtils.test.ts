import { describe, it, expect } from 'vitest';
import { normalizeDateInput, validateAndParseBirthDate, calculateAgeFromBirthDate } from './dateUtils';

describe('dateUtils - Date Normalization & Validation', () => {
  describe('normalizeDateInput', () => {
    it('debería convertir guiones a barras', () => {
      expect(normalizeDateInput('15-08-1990')).toBe('15/08/1990');
    });

    it('debería convertir puntos a barras', () => {
      expect(normalizeDateInput('15.08.1990')).toBe('15/08/1990');
    });

    it('debería convertir espacios a barras', () => {
      expect(normalizeDateInput('15 08 1990')).toBe('15/08/1990');
    });

    it('debería reordenar el formato ISO YYYY-MM-DD a DD/MM/YYYY', () => {
      expect(normalizeDateInput('1990-08-15')).toBe('15/08/1990');
    });

    it('debería reordenar el formato ISO YYYY/MM/DD a DD/MM/YYYY', () => {
      expect(normalizeDateInput('1990/08/15')).toBe('15/08/1990');
    });

    it('debería agregar ceros iniciales a días/meses de un solo dígito', () => {
      expect(normalizeDateInput('5/8/1990')).toBe('05/08/1990');
    });

    it('debería convertir 8 dígitos seguidos DDMMYYYY a DD/MM/YYYY', () => {
      expect(normalizeDateInput('15081990')).toBe('15/08/1990');
    });
  });

  describe('validateAndParseBirthDate', () => {
    it('debería validar y calcular la edad para una fecha válida con guiones', () => {
      const result = validateAndParseBirthDate('15-08-1990');
      expect(result.isValid).toBe(true);
      expect(result.normalizedDate).toBe('15/08/1990');
      expect(result.age).toBeGreaterThan(0);
      expect(result.errorMessage).toBeUndefined();
    });

    it('debería validar y calcular la edad para una fecha ISO', () => {
      const result = validateAndParseBirthDate('1990-08-15');
      expect(result.isValid).toBe(true);
      expect(result.normalizedDate).toBe('15/08/1990');
      expect(result.age).toBeGreaterThan(0);
    });

    it('debería rechazar meses inválidos', () => {
      const result = validateAndParseBirthDate('15/13/1990');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('mes');
    });

    it('debería rechazar días inválidos en febrero (año no bisiesto)', () => {
      const result = validateAndParseBirthDate('29/02/2023');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('día');
    });

    it('debería aceptar 29 de febrero en año bisiesto', () => {
      const result = validateAndParseBirthDate('29/02/2024');
      expect(result.isValid).toBe(true);
    });

    it('debería rechazar fechas futuras', () => {
      const futureYear = new Date().getFullYear() + 1;
      const result = validateAndParseBirthDate(`15/08/${futureYear}`);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('futura');
    });

    it('debería rechazar entradas vacías', () => {
      const result = validateAndParseBirthDate('  ');
      expect(result.isValid).toBe(false);
    });
  });

  describe('calculateAgeFromBirthDate', () => {
    it('debería retornar la edad si la fecha es válida', () => {
      const age = calculateAgeFromBirthDate('15-08-1990');
      expect(age).not.toBeNull();
      expect(typeof age).toBe('number');
    });

    it('debería retornar null si la fecha es inválida', () => {
      const age = calculateAgeFromBirthDate('invalid-date');
      expect(age).toBeNull();
    });
  });
});
