// Option lists shared by volunteer registration and the volunteer profile page.

export const GENDER_OPTIONS = ['Male', 'Female', 'Transgender', 'Others'];

export const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati',
  'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Spanish', 'French', 'German',
  'Mandarin Chinese', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian',
];

export const INTERESTS = [
  'Teaching', 'Mentoring', 'Guest Lecture', 'Content Writing', 'Data Science',
  'Software Development', 'Graphic Design', 'Public Speaking', 'Social Work',
  'Healthcare', 'Environmental Science', 'Digital Marketing', 'Music Production',
  'Career Guidance', 'Financial Planning', 'Project Management', 'UX/UI Design',
];

export const QUALIFICATIONS = [
  'High School', 'Pre University', 'Graduate', 'Post Graduate', 'Professional Degree',
];

export const EMPLOYMENT_STATUS = [
  'Full Time', 'Part Time', 'Self-Employed', 'Homemaker', 'Student', 'Retired', 'Not Employed',
];

export const WEEK_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TIME_OF_DAY_OPTIONS = ['Morning', 'Afternoon', 'Evening'];

// Friendly label (and what it means) for a volunteer's account status.
export const VOLUNTEER_STATUS_INFO: Record<string, { label: string; hint: string }> = {
  Registered: { label: 'Registration under review', hint: 'Your registration is being reviewed. We will contact you soon.' },
  Recommended: { label: 'Recommended', hint: 'You have been recommended and are awaiting final approval.' },
  OnHold: { label: 'On hold', hint: 'Your account is on hold. Please contact your coordinator.' },
  Active: { label: 'Active volunteer', hint: '' },
  Inactive: { label: 'Inactive', hint: 'Your account is inactive. Please contact your coordinator.' },
};
