// Per-adopter (deployment) configuration for the public home page.
// Set VITE_ADOPTER in the environment (e.g. .env / .env.production) to switch
// which adopter's content is shown. Add a new adopter by adding an entry here.

export type AdopterId = 'telangana' | 'up' | 'default';

export interface ProgramHighlight {
  title: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  text: string;
}

export interface AdopterConfig {
  /** Display name used in the header/brand and footer. */
  brandName: string;
  /** Optional small label shown before the brand name in the top bar (e.g. "Serve"). */
  brandPrefix?: string;
  /** Optional line under the brand name in the top bar (e.g. board/authority). */
  brandTagline?: string;
  /** Hero headline. Use `highlight` to color a portion of it. */
  heroTitle: string;
  heroHighlight?: string;
  /** Supporting line under the hero headline. */
  heroSubtitle: string;
  /** Optional longer description under the subtitle. */
  heroDescription?: string;
  /** Trust-signal line shown below the hero cards. */
  trustSignal: string;
  /** Copy for the volunteer card. */
  volunteerCardTitle: string;
  volunteerCardSubtitle: string;
  volunteerCardCta?: string;
  /** Copy for the school/entity card. */
  schoolCardTitle: string;
  schoolCardSubtitle: string;
  /** Secondary CTA (explore) label. */
  exploreCtaLabel?: string;

  // --- Optional richer program content (rendered when provided) ---
  /** "About the program" section. When set, replaces the generic impact intro. */
  aboutHeading?: string;
  aboutContent?: string;
  /** Overline shown above the about heading. */
  aboutOverline?: string;
  /** Program highlight cards (replaces the generic impact cards when provided). */
  highlights?: ProgramHighlight[];
  /** "How it works" section. */
  howItWorksHeading?: string;
  howItWorksSteps?: HowItWorksStep[];
  /** Volunteer call-to-action section. */
  volunteerSectionHeading?: string;
  volunteerSectionContent?: string;
  volunteerSectionCta?: string;
  /** Optional secondary CTA in the volunteer section (e.g. Quick Onboarding). */
  volunteerSectionSecondaryCta?: string;
  /** Bottom platform attribution. */
  attributionTitle?: string;
  attributionSubtitle?: string;
}

const DEFAULT_ADOPTER: AdopterConfig = {
  brandName: 'SERVE',
  heroTitle: 'Transforming Intent to',
  heroHighlight: 'Impact',
  heroSubtitle:
    "Whether you're ready to volunteer or looking for volunteer teachers, SERVE connects people with purpose.",
  trustSignal: '140+ schools · 250+ volunteers · 15,000+ students reached',
  volunteerCardTitle: '🤝 I Want to Volunteer',
  volunteerCardSubtitle: 'Help students learn online.',
  schoolCardTitle: '🏫 I Need Volunteer Teachers',
  schoolCardSubtitle: 'Bring volunteer teachers to your students.',
};

const ADOPTERS: Record<AdopterId, AdopterConfig> = {
  default: DEFAULT_ADOPTER,

  telangana: {
    ...DEFAULT_ADOPTER,
    brandName: 'EVidya Nipuna',
    brandPrefix: 'Serve',
    brandTagline: 'Telangana Intermediate Board',
    heroTitle: 'EVidya',
    heroHighlight: 'Nipuna',
    heroSubtitle: 'Digital Literacy Program for Government Junior College Students in Telangana',
    heroDescription:
      'Connecting students with volunteer teachers through live online sessions to build essential digital skills and confidence.',
    trustSignal: '',
    volunteerCardTitle: '🤝 Volunteer for EVidya Nipuna',
    volunteerCardSubtitle: 'Teach Digital Literacy to Government Junior College students.',
    volunteerCardCta: 'Volunteer for EVidya Nipuna',
    schoolCardTitle: '🏫 For Colleges',
    schoolCardSubtitle: 'Bring the Digital Literacy program to your students.',
    exploreCtaLabel: 'Explore Learning Needs',

    aboutOverline: 'About the Program',
    aboutHeading: 'Building Digital Skills for the Future',
    aboutContent:
      'EVidya Nipuna is a digital literacy initiative for students of Government Junior Colleges in Telangana. Through structured, volunteer-led online sessions, students learn foundational computer concepts and develop practical digital skills that support their education and future opportunities.',

    highlights: [
      {
        title: 'Government Junior Colleges',
        description: 'Supporting students across Telangana through participating colleges.',
      },
      {
        title: 'Structured Learning',
        description: 'A 24-session Digital Literacy program delivered over 12 weeks.',
      },
      {
        title: 'Live Online Sessions',
        description: 'Interactive classes facilitated by volunteers in coordination with college faculty.',
      },
      {
        title: 'Practical Digital Skills',
        description: 'Helping students understand computer fundamentals and confidently use digital tools.',
      },
    ],

    howItWorksHeading: 'How EVidya Nipuna Works',
    howItWorksSteps: [
      { step: 1, text: 'Colleges identify student batches and suitable class timings.' },
      { step: 2, text: 'Digital Literacy learning needs are created and published on the platform.' },
      { step: 3, text: 'Volunteers select a suitable learning need and commit to the sessions.' },
      { step: 4, text: 'Students attend structured live online classes with support from their college coordinator.' },
    ],

    volunteerSectionHeading: 'Help Students Build Their Digital Future',
    volunteerSectionContent:
      'Volunteer to teach Digital Literacy to Government Junior College students in Telangana. Your time and knowledge can help students gain skills that are increasingly important for higher education, employment and everyday life.',
    volunteerSectionCta: 'Become a Volunteer',

    attributionTitle: 'Powered by Sunbird Serve',
    attributionSubtitle:
      'Supporting volunteer-led service delivery through an open-source Digital Public Good.',
  },

  up: {
    ...DEFAULT_ADOPTER,
    brandName: 'Project SERVE',
    brandTagline: 'Uttar Pradesh',
    heroTitle: 'Project',
    heroHighlight: 'SERVE',
    heroSubtitle:
      'Volunteer-led Foundational English Learning for Government School Students in Uttar Pradesh',
    heroDescription:
      'Connecting government schools with volunteers through live online classes to help students strengthen their foundational English skills and confidence.',
    trustSignal: '',
    volunteerCardTitle: '🤝 Volunteer for Project SERVE',
    volunteerCardSubtitle: 'Teach foundational English to government school students.',
    volunteerCardCta: 'Volunteer for Project SERVE',
    schoolCardTitle: '🏫 For Schools',
    schoolCardSubtitle: 'Bring foundational English learning to your students.',
    exploreCtaLabel: 'Explore Learning Needs',

    aboutOverline: 'About the Program',
    aboutHeading: 'Helping Every Child Learn with Confidence',
    aboutContent:
      'Project SERVE enables volunteers to teach foundational English to students in Grades 6–8 in government schools across Uttar Pradesh. Through structured live online sessions, volunteers support students in developing essential English language skills in coordination with teachers and school representatives.',

    highlights: [
      {
        title: 'Government Schools',
        description: 'Supporting students in government schools across Uttar Pradesh.',
      },
      {
        title: 'Foundational English',
        description: 'Helping students strengthen listening, speaking, reading and basic comprehension skills.',
      },
      {
        title: 'Live Online Classes',
        description: 'Interactive 45-minute sessions conducted twice a week by committed volunteers.',
      },
      {
        title: 'Volunteer-powered Learning',
        description: 'Enabling individuals to contribute their time and skills directly to students who need support.',
      },
    ],

    howItWorksHeading: 'How Project SERVE Works',
    howItWorksSteps: [
      { step: 1, text: 'Government schools identify student groups, learning requirements and suitable class timings.' },
      { step: 2, text: 'The schools raise learning needs, which become discoverable to volunteers on the platform.' },
      { step: 3, text: 'Volunteers select a suitable learning need and commit to conducting the classes.' },
      { step: 4, text: 'Students attend structured live online sessions with support from their school coordinator.' },
    ],

    volunteerSectionHeading: 'Make a Difference from Wherever You Are',
    volunteerSectionContent:
      'Volunteer to teach foundational English to government school students in Uttar Pradesh. With just two online sessions a week, you can help students learn with greater confidence and open up new possibilities for their future.',
    volunteerSectionCta: 'Become a Volunteer',
    volunteerSectionSecondaryCta: 'Quick Onboarding',

    attributionTitle: 'Powered by Sunbird Serve',
    attributionSubtitle:
      'Supporting volunteer-led service delivery through an open-source Digital Public Good.',
  },
};

export function getAdopterConfig(): AdopterConfig {
  const id = (import.meta.env.VITE_ADOPTER as string | undefined)?.toLowerCase();
  if (id && id in ADOPTERS) return ADOPTERS[id as AdopterId];
  return DEFAULT_ADOPTER;
}
