export type Persona = 'student' | 'corporate' | 'job_holder';

export type Channel = 'whatsapp' | 'email' | 'telegram';

export type Expression = 'casual' | 'professional' | 'meme';

export interface ExcuseResult {
  id: string;
  persona: Persona;
  channel: Channel;
  expression: Expression;
  subject: string | null;
  message: string;
  recipientDisplay: string;
  source: 'template' | 'ai';
}

export interface ExcuseTemplate {
  id: string;
  persona: Persona;
  channel: Channel;
  expression: Expression;
  subject: string | null;
  /** Template body using {name} for recipient salutation substitution */
  body: string;
}

export interface PersonaOption {
  id: Persona;
  label: string;
  defaultRecipient: string;
  inputPlaceholder: string;
}

export interface ChannelOption {
  id: Channel;
  label: string;
}

export interface ExpressionOption {
  id: Expression;
  label: string;
  description: string;
}

export interface ContextStarter {
  id: string;
  label: string;
  text: string;
}

export const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'student',
    label: 'Student',
    defaultRecipient: 'Sir',
    inputPlaceholder: "Sharma Sir, Neha Ma'am, HOD...",
  },
  {
    id: 'corporate',
    label: 'Corporate',
    defaultRecipient: 'Boss',
    inputPlaceholder: 'Rahul, Priya, Manager...',
  },
  {
    id: 'job_holder',
    label: 'Job Holder',
    defaultRecipient: 'Sir',
    inputPlaceholder: 'Verma Ji, Supervisor, Shift Lead...',
  },
];

export const CHANNEL_OPTIONS: ChannelOption[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'telegram', label: 'Telegram' },
];

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
  {
    id: 'casual',
    label: 'Casual',
    description: 'Believable chill Hinglish text with everyday emojis.',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Polished formal tone, zero emojis, never leaks gaming.',
  },
  {
    id: 'meme',
    label: 'GTA 6 Meme',
    description: 'Full Vice City launch-day parody for friends & group chats.',
  },
];

export const CONTEXT_STARTERS: ContextStarter[] = [
  {
    id: 'game-khelna',
    label: 'Game khelna',
    text: 'kal nahi aaunga game khelna hai jo ukhadna hai ukhadle',
  },
  {
    id: 'download-150gb',
    label: '150GB update',
    text: 'GTA 6 ka 150GB download lagaya hai, aaj screen ke saamne se nahi hil sakta',
  },
  {
    id: 'vice-city-wait',
    label: '12 saal wait',
    text: '12 saal wait kiya hai launch day ke liye, aaj Vice City mein urgent kaam hai',
  },
];

/** Short funny Hinglish excuse contexts for the left-to-right hero marquee (4 to 9 words max) */
export const HERO_MARQUEE_CONTEXTS: string[] = [
  'Boss, aaj Vice City mein urgent kaam hai',
  '150GB download chal raha, ghar chhod nahi sakta',
  '12 saal wait kiya, aaj chhutti banti hai',
  'Kal nahi aaunga, PS5 garam ho raha',
  'Sir bhari hai, sirf controller chal raha',
  'Ghar pe urgent mission aa gaya',
  'Doctor ne aaj bed rest bola',
  'Laptop band, aaj Vice City khulega',
  'Aaj WFH kar loon?',
  'Alarm baja, dil bola mat ja',
  'Tabiyat thodi down hai, kal milte hain',
  'Launch day baar baar nahi aata',
];
