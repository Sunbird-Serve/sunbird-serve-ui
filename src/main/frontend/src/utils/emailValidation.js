/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Returns true if email format is valid
 */
export const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 