import { z } from 'zod';

export const onboardingSchema = z.object({
  // Section 1: Institution
  district: z.string().min(1, 'Please select a district'),
  block: z.string().min(1, 'Please select a block'),
  entityId: z.string().min(1, 'Please select your school/college'),

  // Section 2: Contact person
  coordinatorName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name must contain only letters, spaces, and dots'),
  designation: z.enum(['HM', 'Principal', 'Teacher', 'Computer Instructor', 'Other'], {
    errorMap: () => ({ message: 'Please select a designation' }),
  }),
  designationOther: z.string().optional(),
  mobile: z
    .string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number (starts with 6-9)'),
  email: z.string().min(1, 'Email is required').max(254).email('Enter a valid email address'),

  // Section 3: Digital Classroom Readiness
  infraAvailable: z.array(z.string()).min(1, 'Please select at least one item'),
  onlineExperience: z.enum([
    'Yes, we use it regularly',
    'Yes, but only occasionally',
    'No, but we can try independently',
    'No, we will need support',
  ], {
    errorMap: () => ({ message: 'Please select your online experience level' }),
  }),
  canJoinIndependently: z.enum([
    'Yes',
    'With some guidance',
    "No, we'll need assistance",
  ], {
    errorMap: () => ({ message: 'Please select an option' }),
  }),
}).superRefine((data, ctx) => {
  // Designation "Other" requires specification
  if (data.designation === 'Other') {
    if (!data.designationOther || data.designationOther.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your designation',
        path: ['designationOther'],
      });
    }
  }
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
