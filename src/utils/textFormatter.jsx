import React from 'react';

// Utility function to format text from the rich text editor
export const formatText = (text) => {
  if (!text) return '';
  
  // Split text into lines
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return null;
    
    // Check if it's a bullet point
    if (trimmedLine.startsWith('•')) {
      return (
        <div key={index} className="flex items-start">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span>{formatInlineText(trimmedLine.substring(1).trim())}</span>
        </div>
      );
    }
    
    // Check if it's a numbered list item
    if (/^\d+\./.test(trimmedLine)) {
      const number = trimmedLine.match(/^\d+/)[0];
      const content = trimmedLine.substring(number.length + 1).trim();
      return (
        <div key={index} className="flex items-start">
          <span className="w-6 text-blue-600 font-semibold mr-3">{number}.</span>
          <span>{formatInlineText(content)}</span>
        </div>
      );
    }
    
    // Regular paragraph
    return (
      <p key={index} className="mb-2">
        {formatInlineText(trimmedLine)}
      </p>
    );
  }).filter(Boolean);
};

// Format inline text (bold, italic)
const formatInlineText = (text) => {
  if (!text) return '';
  
  // Split by bold markers
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  
  return boldParts.map((part, index) => {
    // Bold text
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold">{boldText}</strong>;
    }
    
    // Split by italic markers
    const italicParts = part.split(/(\*.*?\*)/g);
    
    return italicParts.map((italicPart, italicIndex) => {
      // Italic text
      if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
        const italicText = italicPart.slice(1, -1);
        return <em key={`${index}-${italicIndex}`} className="italic">{italicText}</em>;
      }
      
      // Regular text
      return <span key={`${index}-${italicIndex}`}>{italicPart}</span>;
    });
  });
};

// Simple version for single lines (like in cards)
export const formatSimpleText = (text) => {
  if (!text) return '';
  
  // Remove line breaks and format inline text
  const singleLine = text.replace(/\n/g, ' ');
  return formatInlineText(singleLine);
};
