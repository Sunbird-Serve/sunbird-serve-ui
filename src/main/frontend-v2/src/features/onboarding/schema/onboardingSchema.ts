import { z } from 'zod';

export const onboardingSchema = z.object({
  // Entity selection
  district: z.string().min(1, 'Please select a district'),
  block: z.string().min(1, 'Please select a block'),
  entityId: z.string().min(1, 'Please select your school/college'),

  // Personal details
  coordinatorName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name must contain only letters, spaces, and dots'),
  designation: z.enum(['HM', 'Principal', 'Teacher', 'Other'], {
    errorMap: () => ({ message: 'Please select a designation' }),
  }),
  designationOther: z.string().optional(),
  mobile: z
    .string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number (starts with 6-9)'),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Enter a valid email address'),

  // Infrastructure readiness
  hasInternet: z.enum(['true', 'false'], {
    errorMap: () => ({ message: 'Please select internet availability' }),
  }),
  hasComputer: z.enum(['true', 'false'], {
    errorMap: () => ({ message: 'Please select computer availability' }),
  }),
  hasProjector: z.enum(['true', 'false'], {
    errorMap: () => ({ message: 'Please select projector availability' }),
  }),
  roomsAvailable: z
    .string()
    .min(1, 'Please enter number of rooms')
    .regex(/^\d+$/, 'Must be a number')
    .refine((val) => parseInt(val, 10) >= 0, 'Must be 0 or more'),
}).superRefine((data, ctx) => {
  // If designation is "Other", require designationOther
  if (data.designation === 'Other') {
    if (!data.designationOther || data.designationOther.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your designation (at least 2 characters)',
        path: ['designationOther'],
      });
    } else if (data.designationOther.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Designation must be at most 50 characters',
        path: ['designationOther'],
      });
    }
  }
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
