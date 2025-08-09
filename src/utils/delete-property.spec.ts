import { describe, it, expect } from 'vitest';
import { deleteProperty } from './delete-property';

describe('deleteProperty util', () => {
  it('deletes a top-level property', () => {
    const obj = { a: 1, b: 2 };
    deleteProperty(obj, ['a']);
    expect(obj).toEqual({ b: 2 });
  });

  it('deletes a nested property', () => {
    const obj = { a: { b: { c: 3, d: 4 } } };
    deleteProperty(obj, ['a', 'b', 'c']);
    expect(obj).toEqual({ a: { b: { d: 4 } } });
  });

  it('deletes a property inside an array of objects using [] notation', () => {
    const obj = {
      items: [
        { name: 'one', value: 1 },
        { name: 'two', value: 2 },
      ],
    };
    deleteProperty(obj, ['items[]', 'value']);
    expect(obj.items[0]).toEqual({ name: 'one' });
    expect(obj.items[1]).toEqual({ name: 'two' });
  });

  it('deletes a nested property inside array objects', () => {
    const obj = {
      groups: [
        { id: 1, info: { name: 'Group1', code: 'G1' } },
        { id: 2, info: { name: 'Group2', code: 'G2' } },
      ],
    };
    deleteProperty(obj, ['groups[]', 'info', 'code']);
    expect(obj.groups[0].info).toEqual({ name: 'Group1' });
    expect(obj.groups[1].info).toEqual({ name: 'Group2' });
  });

  it('does nothing if property path does not exist', () => {
    const obj = { a: { b: 2 } };
    deleteProperty(obj, ['a', 'c']);
    expect(obj).toEqual({ a: { b: 2 } });
  });

  it('handles deleting property in array when array is missing', () => {
    const obj = { items: undefined };
    expect(() => deleteProperty(obj, ['items[]', 'value'])).not.toThrow();
  });

  it('handles deleting property in array when parent property is missing', () => {
    const obj = {};
    expect(() => deleteProperty(obj, ['items[]', 'value'])).not.toThrow();
  });

  it('deletes property when the object itself is an array', () => {
    const obj = [
      { name: 'one', value: 1 },
      { name: 'two', value: 2 },
    ];
    deleteProperty(obj, ['value']);
    expect(obj[0]).toEqual({ name: 'one' });
    expect(obj[1]).toEqual({ name: 'two' });
  });
});
