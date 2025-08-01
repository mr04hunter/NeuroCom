import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateRenderer from '../src/components/DateRenderer';

describe('DateRenderer Component', () => {
  it('renders the relative time when mode is "ago"', () => {
    const testDate = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    render(<DateRenderer mode="ago" date_string={testDate} />);
    const renderedText = screen.getByText(/ago/i); // Checks for "ago" in the output
    expect(renderedText).toBeTruthy();
  });

  it('renders the formatted date when mode is not "ago"', () => {
    const testDate = new Date(2023, 0, 1).toISOString(); // January 1, 2023
    render(<DateRenderer mode="date" date_string={testDate} />);
    const expectedDate = new Date(testDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const regex = new RegExp(expectedDate.replace(/\s+/g, '\\s+')); // Handle spaces
    const renderedText = screen.getByText(regex);
    expect(renderedText).toBeInTheDocument();
  });

  it('renders correctly for invalid date', () => {
    render(<DateRenderer mode="ago" date_string="invalid-date" />);
    const renderedText = screen.queryByText(/ago/i);
    expect(renderedText).toBeNull(); // Nothing renders for invalid date
  });
});