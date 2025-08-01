import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageValidator } from '../src/components/MessageValidator';
import { useState } from 'react';


describe('MessageValidator Component', () => {
    it('renders the relative time when mode is "ago"', () => {
      const setMessage = vi.fn()
      const result = MessageValidator('', setMessage)
      
      
      expect(result).toBe(false);
     
    });

    it('returns false for whitespace-only message', () => {
        const setMessage = vi.fn();
        const result = MessageValidator('   ', setMessage);
        
        expect(result).toBe(false);
        expect(setMessage).toHaveBeenCalledWith('');
      });

    
    it('returns true for non-empty message', () => {
    const setMessage = vi.fn();
    const result = MessageValidator('hello', setMessage);
    
    expect(result).toBe(true);
    expect(setMessage).toHaveBeenCalledWith('hello');
    });


    it('trims the message before validation', () => {
        const setMessage = vi.fn();
        const result = MessageValidator('  hello  ', setMessage);
        
        expect(result).toBe(true);
        expect(setMessage).toHaveBeenCalledWith('hello');
      });

})