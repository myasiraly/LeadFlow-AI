import { ToolType, ToolConfig } from './types';

export const TOOLS: ToolConfig[] = [
  {
    id: ToolType.APOLLO,
    icon: '🚀',
    description: 'Turn any search into a ready-to-use CSV of prospects.',
    placeholder: 'https://apollo.io/search/results?...',
    fields: ['name', 'email', 'title', 'company', 'location']
  },
  {
    id: ToolType.LINKEDIN,
    icon: '🔗',
    description: 'Extract professional profiles, headlines, and company roles.',
    placeholder: 'https://linkedin.com/in/username or "Software Engineers in Austin"',
    fields: ['name', 'title', 'company', 'location', 'email']
  },
  {
    id: ToolType.INSTAGRAM,
    icon: '📸',
    description: 'Find influencers and business emails from Instagram profiles.',
    placeholder: 'https://instagram.com/username or "Fashion brands in Milan"',
    fields: ['name', 'handle', 'followers', 'engagement', 'email', 'website']
  },
  {
    id: ToolType.TWITTER,
    icon: '🐦',
    description: 'Scrape X (Twitter) handles and bio-verified contact info.',
    placeholder: 'https://x.com/username or "Web3 Founders"',
    fields: ['name', 'handle', 'followers', 'location', 'email', 'bio']
  },
  {
    id: ToolType.EMAIL_FINDER,
    icon: '📧',
    description: 'Find verified email addresses from any company domain.',
    placeholder: 'example.com',
    fields: ['name', 'email', 'industry', 'location']
  },
  {
    id: ToolType.GMAPS,
    icon: '📍',
    description: 'Export Google Maps business details to CSV in one click.',
    placeholder: 'Dentists in Los Angeles',
    fields: ['name', 'phone', 'location', 'website', 'industry']
  },
  {
    id: ToolType.YOUTUBE,
    icon: '🎥',
    description: 'Find business contact emails from YouTube channels.',
    placeholder: 'https://youtube.com/@channelname',
    fields: ['name', 'followers', 'email', 'location', 'website']
  },
  {
    id: ToolType.AIRBNB,
    icon: '🏠',
    description: 'Extract host emails and property details from listings.',
    placeholder: 'https://airbnb.com/rooms/123456...',
    fields: ['name', 'location', 'email', 'website', 'industry']
  },
  {
    id: ToolType.SKIP_TRACE,
    icon: '🔍',
    description: 'Find contact info and addresses from names or phones.',
    placeholder: 'John Doe, 123 Main St, Springfield',
    fields: ['name', 'phone', 'email', 'location', 'industry']
  },
  {
    id: ToolType.EMAIL_VALIDATOR,
    icon: '✅',
    description: 'Verify email deliverability and quality scores in bulk.',
    placeholder: 'user@example.com, test@corp.com',
    fields: ['email', 'industry', 'location']
  },
  {
    id: ToolType.BIZBUYSELL,
    icon: '💼',
    description: 'Find businesses for sale with financials and broker contacts.',
    placeholder: 'https://bizbuysell.com/listings/...',
    fields: ['name', 'industry', 'location', 'website', 'email']
  },
  {
    id: ToolType.PROPERTY,
    icon: '🏘️',
    description: 'Get home values, tax history, and owner contact info.',
    placeholder: '1600 Amphitheatre Pkwy, Mountain View, CA',
    fields: ['name', 'location', 'industry', 'email']
  },
  {
    id: ToolType.ANGI,
    icon: '🛠️',
    description: 'Find verified home service professionals with ratings.',
    placeholder: 'Plumbers in Chicago',
    fields: ['name', 'phone', 'location', 'industry', 'website']
  },
  {
    id: ToolType.YELP,
    icon: '⭐',
    description: 'Extract business listings with reviews and ratings.',
    placeholder: 'Italian Restaurants in NYC',
    fields: ['name', 'phone', 'location', 'industry', 'website']
  },
  {
    id: ToolType.PEOPLE,
    icon: '👤',
    description: 'Find anyone by name, phone, or address instantly.',
    placeholder: 'Jane Smith, New York',
    fields: ['name', 'phone', 'email', 'location', 'industry']
  }
];