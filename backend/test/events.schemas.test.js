import { describe, expect, it } from 'vitest';
import { listEventsSchema } from '../src/modules/events/events.schemas.js';

const validate = query => listEventsSchema.query.validate(query);

describe('listEventsSchema', () => {
  it('accepts a destination on its own and defaults the limit', () => {
    const { error, value } = validate({ destination: 'barcelona' });
    expect(error).toBeUndefined();
    expect(value.limit).toBe(8);
    expect(value.startDate).toBeUndefined();
  });

  it('accepts a trip window from the home search bar', () => {
    const { error, value } = validate({
      destination: 'barcelona',
      limit: '6',
      startDate: '2026-08-10',
      endDate: '2026-08-14',
    });
    expect(error).toBeUndefined();
    expect(value.startDate).toBeInstanceOf(Date);
    expect(value.endDate).toBeInstanceOf(Date);
  });

  it('accepts an open-ended window (start with no end)', () => {
    const { error } = validate({ destination: 'barcelona', startDate: '2026-08-10' });
    expect(error).toBeUndefined();
  });

  it('rejects an end date without a start date', () => {
    const { error } = validate({ destination: 'barcelona', endDate: '2026-08-14' });
    expect(error).toBeDefined();
  });

  it('rejects an end date before the start date', () => {
    const { error } = validate({
      destination: 'barcelona',
      startDate: '2026-08-14',
      endDate: '2026-08-10',
    });
    expect(error).toBeDefined();
  });

  it('rejects a malformed date', () => {
    const { error } = validate({ destination: 'barcelona', startDate: 'nonsense' });
    expect(error).toBeDefined();
  });
});
