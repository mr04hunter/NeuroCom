import React, { useState, useEffect, useRef } from 'react';
import { useTypingAnimation } from '../types/hooks';

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
}
export const TypingText : React.FC<TypingTextProps> = ({ text, speed = 50, className= "" }) => {
  const { displayText, isComplete } = useTypingAnimation(text, speed);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && <span className="cursor">|</span>}
    </span>
  );
}