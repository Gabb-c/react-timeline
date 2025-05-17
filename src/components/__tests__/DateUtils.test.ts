import { describe, it, expect } from 'vitest';

// Helper functions to test date handling logic
const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const calculateDaysDifference = (startDate: Date, endDate: Date): number => {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

const addDaysToDate = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

describe('Date Utility Functions', () => {
  it('formats a date to YYYY-MM-DD format', () => {
    const date = new Date('2021-05-15T12:00:00Z');
    expect(formatDateToYYYYMMDD(date)).toBe('2021-05-15');
  });
  
  it('calculates the correct number of days between two dates', () => {
    const startDate = new Date('2021-01-01');
    const endDate = new Date('2021-01-10');
    expect(calculateDaysDifference(startDate, endDate)).toBe(9);
  });
  
  it('handles same day in days difference calculation', () => {
    const sameDay = new Date('2021-01-01');
    expect(calculateDaysDifference(sameDay, sameDay)).toBe(0);
  });
  
  it('adds days to a date correctly', () => {
    const startDate = new Date('2021-01-01');
    const resultDate = addDaysToDate(startDate, 5);
    expect(formatDateToYYYYMMDD(resultDate)).toBe('2021-01-06');
  });
  
  it('handles negative days in add days function', () => {
    const startDate = new Date('2021-01-10');
    const resultDate = addDaysToDate(startDate, -5);
    expect(formatDateToYYYYMMDD(resultDate)).toBe('2021-01-05');
  });
  
  it('correctly handles month boundaries', () => {
    const startDate = new Date('2021-01-30');
    const resultDate = addDaysToDate(startDate, 3);
    expect(formatDateToYYYYMMDD(resultDate)).toBe('2021-02-02');
  });
  
  it('correctly handles year boundaries', () => {
    const startDate = new Date('2021-12-30');
    const resultDate = addDaysToDate(startDate, 3);
    expect(formatDateToYYYYMMDD(resultDate)).toBe('2022-01-02');
  });
}); 