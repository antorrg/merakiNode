import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InitialUser } from './InitialUser.js';
import { app } from 'electron';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

// Mocks
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mocked/documents/path')
  }
}));

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined)
}));

describe('InitialUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePassword', () => {
    it('should generate a password of default length 12', () => {
      const password = InitialUser.generatePassword();
      expect(password).toHaveLength(12);
    });

    it('should generate a password of specified length', () => {
      const password = InitialUser.generatePassword(16);
      expect(password).toHaveLength(16);
    });

    it('should contain at least one uppercase letter and one symbol', () => {
      const password = InitialUser.generatePassword(20);
      const hasUpper = /[A-Z]/.test(password);
      // eslint-disable-next-line no-useless-escape
      const hasSymbol = /[!@#$%&*()\-_¿+\[\]{};:<>\/?]/.test(password);
      
      expect(hasUpper).toBe(true);
      expect(hasSymbol).toBe(true);
    });
  });

  describe('writePassword', () => {
    it('should write the password to a text file in the documents folder', async () => {
      const testContent = 'secret_password_123';
      const testFileName = 'meraki-propietario';

      await InitialUser.writePassword(testContent, testFileName);

      // Verify app.getPath was called correctly
      expect(app.getPath).toHaveBeenCalledWith('documents');

      // Verify fs.writeFile was called with correct path and content
      const expectedPath = path.join('/mocked/documents/path', `${testFileName}.txt`);
      const expectedFileContent = `DOCUMENTO GENERADO AUTOMATICAMENTE, NO EDITAR\n\n${testContent}`;
      
      expect(writeFile).toHaveBeenCalledWith(expectedPath, expectedFileContent, 'utf8');
    });

    it('should use default filename if not provided', async () => {
      const testContent = 'secret_password_456';

      await InitialUser.writePassword(testContent);

      const expectedPath = path.join('/mocked/documents/path', 'user.txt');
      expect(writeFile).toHaveBeenCalledWith(expectedPath, expect.stringContaining(testContent), 'utf8');
    });
  });
});
