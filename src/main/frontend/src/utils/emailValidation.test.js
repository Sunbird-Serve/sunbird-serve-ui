import { validateEmailFormat } from './emailValidation';

// Test email format validation
describe('Email Validation Tests', () => {
  describe('validateEmailFormat', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@test.com',
        'user@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmailFormat(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
        '',
        'user name@example.com',
        'user@example com'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmailFormat(email)).toBe(false);
      });
    });
  });
});

// Manual test function for development
export const runManualTests = async () => {
  console.log('Running manual email validation tests...');
  
  // Test email format validation
  const testEmails = [
    'test@example.com',
    'invalid-email',
    'user@',
    'user.name@domain.co.uk'
  ];

  testEmails.forEach(email => {
    const isValid = validateEmailFormat(email);
    console.log(`Email: ${email} - Valid: ${isValid}`);
  });
};

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  window.runEmailValidationTests = runManualTests;
} 