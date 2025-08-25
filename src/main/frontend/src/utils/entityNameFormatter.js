import React from 'react';

/**
 * Formats entity names to separate UDISE codes from the actual entity name
 * This helps volunteers distinguish between school/organization names and UDISE codes
 * 
 * @param {string} entityName - The entity name that may contain UDISE codes
 * @returns {JSX.Element} - Formatted entity name with separated UDISE code if present
 */
export const formatEntityName = (entityName) => {
  if (!entityName) return "";
  
  // Check if entity name contains what looks like a UDISE code (10-11 digit number)
  const udisePattern = /(\d{10,11})/;
  const match = entityName.match(udisePattern);
  
  if (match) {
    const udiseCode = match[1];
    const actualName = entityName.replace(udiseCode, '').trim();
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ 
          fontWeight: '500', 
          color: '#333',
          fontSize: '0.9rem'
        }}>
          {actualName || entityName}
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#666', 
          backgroundColor: '#f5f5f5',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block',
          width: 'fit-content',
          fontFamily: 'monospace'
        }}>
          UDISE: {udiseCode}
        </div>
      </div>
    );
  }
  
  // If no UDISE code found, return the name as is
  return (
    <span style={{ 
      fontWeight: '500', 
      color: '#333',
      fontSize: '0.9rem'
    }}>
      {entityName}
    </span>
  );
};

/**
 * Alternative function that returns just the text without JSX formatting
 * Useful for cases where you need plain text
 * 
 * @param {string} entityName - The entity name that may contain UDISE codes
 * @returns {string} - Formatted entity name text
 */
export const formatEntityNameText = (entityName) => {
  if (!entityName) return "";
  
  // Check if entity name contains what looks like a UDISE code (10-11 digit number)
  const udisePattern = /(\d{10,11})/;
  const match = entityName.match(udisePattern);
  
  if (match) {
    const udiseCode = match[1];
    const actualName = entityName.replace(udiseCode, '').trim();
    return `${actualName || entityName} (UDISE Code: ${udiseCode})`;
  }
  
  return entityName;
}; 