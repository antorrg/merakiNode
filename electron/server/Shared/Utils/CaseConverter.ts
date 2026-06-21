export class CaseConverter {
  static toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  static toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  static mapKeysToSnakeCase<T = any>(obj: any): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date || obj instanceof Buffer || obj instanceof RegExp) return obj as any;
    if (Array.isArray(obj)) return obj.map(CaseConverter.mapKeysToSnakeCase) as any;
    
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[CaseConverter.toSnakeCase(key)] = CaseConverter.mapKeysToSnakeCase(obj[key]);
    }
    return result;
  }

  static mapKeysToCamelCase<T = any>(obj: any): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date || obj instanceof Buffer || obj instanceof RegExp) return obj as any;
    if (Array.isArray(obj)) return obj.map(CaseConverter.mapKeysToCamelCase) as any;
    
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[CaseConverter.toCamelCase(key)] = CaseConverter.mapKeysToCamelCase(obj[key]);
    }
    return result;
  }
}
