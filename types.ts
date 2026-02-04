export enum ToolType {
  APOLLO = 'Apollo Scraper',
  EMAIL_FINDER = 'Email Finder Tool',
  GMAPS = 'Google Maps Scraper',
  SKIP_TRACE = 'Skip Trace Service',
  EMAIL_VALIDATOR = 'Email Validator',
  YOUTUBE = 'YouTuber Email Finder',
  AIRBNB = 'Airbnb Email Scraper',
  BIZBUYSELL = 'BizBuySell Scraper',
  PROPERTY = 'Property Search',
  ANGI = 'Angi Scraper',
  YELP = 'Yelp Scraper',
  PEOPLE = 'People Finder',
  INSTAGRAM = 'Instagram Scraper',
  TWITTER = 'Twitter (X) Scraper',
  LINKEDIN = 'LinkedIn Scraper'
}

export interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  location?: string;
  website?: string;
  industry?: string;
  source?: string;
  handle?: string;
  followers?: string;
  engagement?: string;
  bio?: string;
  details?: Record<string, string>;
}

export interface ToolAbout {
  purpose: string;
  limitations: string;
  useCases: string[];
}

export interface ToolConfig {
  id: ToolType;
  icon: string;
  description: string;
  placeholder: string;
  fields: string[];
  about: ToolAbout;
}