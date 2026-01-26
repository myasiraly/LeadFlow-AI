
import { ToolType, ToolConfig } from './types';

export const TOOLS: ToolConfig[] = [
  {
    id: ToolType.APOLLO,
    icon: '🚀',
    description: 'Turn any search into a ready-to-use CSV of prospects.',
    placeholder: 'https://apollo.io/search/results?...',
    fields: ['Name', 'Email', 'Title', 'Company', 'LinkedIn', 'Location']
  },
  {
    id: ToolType.EMAIL_FINDER,
    icon: '📧',
    description: 'Find verified email addresses from any company domain.',
    placeholder: 'example.com',
    fields: ['Name', 'Email', 'Role', 'Verification Status']
  },
  {
    id: ToolType.GMAPS,
    icon: '📍',
    description: 'Export Google Maps business details to CSV in one click.',
    placeholder: 'Dentists in Los Angeles',
    fields: ['Business Name', 'Phone', 'Address', 'Rating', 'Website']
  },
  {
    id: ToolType.SKIP_TRACE,
    icon: '🔍',
    description: 'Find contact info and addresses from names or phones.',
    placeholder: 'John Doe, 123 Main St, Springfield',
    fields: ['Contact', 'Phone', 'Email', 'Address History', 'Relatives']
  },
  {
    id: ToolType.EMAIL_VALIDATOR,
    icon: '✅',
    description: 'Verify email deliverability and quality scores in bulk.',
    placeholder: 'user@example.com, test@corp.com',
    fields: ['Email', 'Valid', 'Disposable', 'Spam Score', 'SMTP Status']
  },
  {
    id: ToolType.YOUTUBE,
    icon: '🎥',
    description: 'Find business contact emails from YouTube channels.',
    placeholder: 'https://youtube.com/@channelname',
    fields: ['Channel Name', 'Subscribers', 'Contact Email', 'Location']
  },
  {
    id: ToolType.AIRBNB,
    icon: '🏠',
    description: 'Extract host emails and property details from listings.',
    placeholder: 'https://airbnb.com/rooms/123456...',
    fields: ['Host Name', 'Property Title', 'Email', 'Reviews', 'Price']
  },
  {
    id: ToolType.BIZBUYSELL,
    icon: '💼',
    description: 'Find businesses for sale with financials and broker contacts.',
    placeholder: 'https://bizbuysell.com/listings/...',
    fields: ['Business Name', 'Asking Price', 'Revenue', 'EBITDA', 'Contact']
  },
  {
    id: ToolType.PROPERTY,
    icon: '🏘️',
    description: 'Get home values, tax history, and owner contact info.',
    placeholder: '1600 Amphitheatre Pkwy, Mountain View, CA',
    fields: ['Owner Name', 'Mailing Address', 'Estimated Value', 'Last Sale']
  },
  {
    id: ToolType.ANGI,
    icon: '🛠️',
    description: 'Find verified home service professionals with ratings.',
    placeholder: 'Plumbers in Chicago',
    fields: ['Company', 'Rating', 'Verified', 'Phone', 'Services']
  },
  {
    id: ToolType.YELP,
    icon: '⭐',
    description: 'Extract business listings with reviews and ratings.',
    placeholder: 'Italian Restaurants in NYC',
    fields: ['Name', 'Phone', 'Reviews Count', 'Category', 'Address']
  },
  {
    id: ToolType.PEOPLE,
    icon: '👤',
    description: 'Find anyone by name, phone, or address instantly.',
    placeholder: 'Jane Smith, New York',
    fields: ['Full Name', 'Age', 'Current Address', 'Phones', 'Emails']
  }
];
