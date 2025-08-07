import { it, expect, describe } from 'vitest';
import { getString, getNumber, getBoolean, cleanObject, getJson } from './config-utils';

describe('config-utils', () => {
  const env = {
    STRING_VAL: 'hello',
    NUM_VAL: '42',
    NUM_INVALID: 'notanumber',
    BOOL_TRUE: 'true',
    BOOL_FALSE: 'false',
    BOOL_INVALID: 'yes',
  };

  describe('getString', () => {
    it('returns string value if present', () => {
      expect(getString(env, 'STRING_VAL')).toBe('hello');
    });

    it('returns undefined if not present', () => {
      expect(getString(env, 'MISSING')).toBeUndefined();
    });
  });

  describe('getNumber', () => {
    it('parses valid number', () => {
      expect(getNumber(env, 'NUM_VAL')).toBe(42);
    });

    it('returns undefined for invalid number', () => {
      expect(getNumber(env, 'NUM_INVALID')).toBeUndefined();
      expect(getNumber(env, 'MISSING')).toBeUndefined();
    });
  });

  describe('getBoolean', () => {
    it('returns true for "true" (case-insensitive)', () => {
      expect(getBoolean(env, 'BOOL_TRUE')).toBe(true);
    });

    it('returns false for "false"', () => {
      expect(getBoolean(env, 'BOOL_FALSE')).toBe(false);
    });

    it('returns false for invalid boolean strings', () => {
      expect(getBoolean(env, 'BOOL_INVALID')).toBe(false);
    });

    it('returns undefined for missing key', () => {
      expect(getBoolean(env, 'MISSING')).toBeUndefined();
    });
  });

  describe('getJson', () => {
    const env = {
      JSON_OBJ: '{"name":"desktop","width":1920}',
      JSON_ARRAY: '[{"name":"desktop"},{"name":"mobile"}]',
      JSON_NUMBER: '42',
      JSON_BOOL: 'true',
      JSON_NULL: 'null',
      INVALID_JSON: '{invalid:true}',
      EMPTY_STRING: '',
    };

    it('parses valid JSON object', () => {
      expect(getJson<{ name: string; width: number }>(env, 'JSON_OBJ')).toEqual({
        name: 'desktop',
        width: 1920,
      });
    });

    it('parses valid JSON array', () => {
      expect(getJson<{ name: string }[]>(env, 'JSON_ARRAY')).toEqual([{ name: 'desktop' }, { name: 'mobile' }]);
    });

    it('returns undefined for undefined env value', () => {
      expect(getJson(env, 'MISSING')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getJson(env, 'EMPTY_STRING')).toBeUndefined();
    });

    it('returns undefined for invalid JSON', () => {
      expect(getJson(env, 'INVALID_JSON')).toBeUndefined();
    });

    it('parses primitive JSON values', () => {
      expect(getJson<number>(env, 'JSON_NUMBER')).toBe(42);
      expect(getJson<boolean>(env, 'JSON_BOOL')).toBe(true);
      expect(getJson<null>(env, 'JSON_NULL')).toBeNull();
    });
  });

  describe('cleanObject', () => {
    it('removes undefined properties recursively', () => {
      const dirty = {
        a: 1,
        b: undefined,
        c: {
          d: undefined,
          e: 2,
          f: {
            g: undefined,
            h: 3,
          },
        },
        i: [undefined, 4, undefined],
      };
      const cleaned = cleanObject(dirty);
      expect(cleaned).toEqual({
        a: 1,
        c: {
          e: 2,
          f: {
            h: 3,
          },
        },
        i: [4],
      });
    });

    it('returns undefined for empty objects and arrays', () => {
      expect(cleanObject({})).toBeUndefined();
      expect(cleanObject([])).toBeUndefined();
      expect(cleanObject([undefined, undefined])).toBeUndefined();
    });
  });
});
