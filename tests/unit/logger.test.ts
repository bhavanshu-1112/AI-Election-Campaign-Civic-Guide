/**
 * @jest-environment node
 */

describe('Logger Module', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    jest.restoreAllMocks();
    jest.resetModules();
  });

  describe('Development mode', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
    });

    it('should log info messages with prefix', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.info('Test info message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test info message',
        ''
      );
    });

    it('should log error messages to console.error', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.error('Test error', { code: 500 });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Test error',
        { code: 500 }
      );
    });

    it('should log warn messages to console.warn', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARNING]'),
        'Test warning',
        ''
      );
    });

    it('should log debug messages in development', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.debug('Debug details', { key: 'value' });
      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Debug details',
        { key: 'value' }
      );
    });
  });

  describe('Production mode', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
    });

    it('should output structured JSON for info logs', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.info('Production info', { userId: '123' });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('"severity":"INFO"')
      );
    });

    it('should output structured JSON for error logs', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.error('Production error');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"severity":"ERROR"')
      );
    });

    it('should output structured JSON for warn logs', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.warn('Production warning');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('"severity":"WARNING"')
      );
    });

    it('should suppress debug-level logs in production', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.debug('This should not appear');
      expect(console.log).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should include service labels in structured output', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.info('Labeled message');
      const logOutput = (console.log as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed['logging.googleapis.com/labels']).toBeDefined();
      expect(parsed['logging.googleapis.com/labels'].service).toBe('civicguide-ai');
    });

    it('should include timestamp in structured output', () => {
      jest.resetModules();
      const { logger } = require('../../lib/logger');

      logger.info('Timestamped');
      const logOutput = (console.log as jest.Mock).mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp).getTime()).not.toBeNaN();
    });
  });
});
