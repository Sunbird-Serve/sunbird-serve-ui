import { z } from 'zod';

export const ORGANISATION_TYPES = [
  'NGO or community organisation',
  'School, college or other institution',
  'Company or employee volunteering group',
  'Volunteer network',
  'Other',
] as const;

export const PARTICIPATION_INTENTS = [
  'Bring volunteering needs',
  'Mobilise volunteers',
  'Both',
  'Not sure yet',
] as const;

export const organisationInterestSchema = z.object({
  organisationName: z
    .string()
    .min(2, 'Organisation name must be at least 2 characters')
    .max(150, 'Organisation name must be at most 150 characters'),
  organisationType: z.enum(ORGANISATION_TYPES, {
    errorMap: () => ({ message: 'Please select an organisation type' }),
  }),
  organisationTypeOther: z.string().optional(),
  contactName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name must contain only letters, spaces, and dots'),
  email: z.string().min(1, 'Email is required').max(254).email('Enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\-\s()]{7,20}$/.test(v), {
      message: 'Enter a valid phone number',
    }),
  intent: z.enum(PARTICIPATION_INTENTS, {
    errorMap: () => ({ message: 'Please tell us how you would like to participate' }),
  }),
  message: z
    .string()
    .max(1000, 'Message must be at most 1000 characters')
    .optional(),
}).superRefine((data, ctx) => {
  if (data.organisationType === 'Other') {
    if (!data.organisationTypeOther || data.organisationTypeOther.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your organisation type',
        path: ['organisationTypeOther'],
      });
    }
  }
});

export type OrganisationInterestFormData = z.infer<typeof organisationInterestSchema>;
