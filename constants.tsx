import { ToolType, ToolConfig } from './types';

export const TOOLS: ToolConfig[] = [
  {
    id: ToolType.APOLLO,
    icon: '🚀',
    description: 'Turn any search into a ready-to-use CSV of prospects.',
    placeholder: 'https://apollo.io/search/results?...',
    fields: ['name', 'email', 'title', 'company', 'location'],
    about: {
      purpose: "Designed to parse complex Apollo search result pages and extract structured prospect data at scale.",
      limitations: "Requires valid Apollo search URLs. Access is limited to data visible in the current user's search session.",
      useCases: ["B2B Sales Prospecting", "High-volume outreach campaigns", "Market research"]
    },
    suggestedPrompts: [
      "SaaS Founders in San Francisco",
      "Marketing Directors at mid-sized tech companies",
      "Recent Series A startups in London",
      "VP of Sales at Enterprise software firms"
    ]
  },
  {
    id: ToolType.LINKEDIN,
    icon: '🔗',
    description: 'Extract professional profiles, headlines, and company roles.',
    placeholder: 'https://linkedin.com/in/username or "Software Engineers in Austin"',
    fields: ['name', 'title', 'company', 'location', 'email'],
    about: {
      purpose: "Aggregates professional identity data, focusing on job titles, current companies, and geographic locations.",
      limitations: "Direct email extraction is subject to public visibility settings. Only public profile data is accessible.",
      useCases: ["Executive headhunting", "Niche B2B networking", "Account-based marketing"]
    },
    suggestedPrompts: [
      "Software Engineers at Google in Mountain View",
      "AI Researchers in Toronto",
      "Freelance Web Designers in Berlin",
      "E-commerce Managers in New York"
    ]
  },
  {
    id: ToolType.INSTAGRAM,
    icon: '📸',
    description: 'Find influencers and business emails from Instagram profiles.',
    placeholder: 'https://instagram.com/username or "Fashion brands in Milan"',
    fields: ['name', 'handle', 'followers', 'engagement', 'email', 'website'],
    about: {
      purpose: "Extracts engagement metrics and public contact information from creator and business profiles.",
      limitations: "Does not support private profiles. Engagement rate is an estimate based on recent public activity.",
      useCases: ["Influencer marketing outreach", "D2C competitor analysis", "Social selling"]
    },
    suggestedPrompts: [
      "Eco-friendly fashion influencers",
      "Boutique hotels in Bali",
      "Fitness coaches with >50k followers",
      "Artisan bakeries in Paris"
    ]
  },
  {
    id: ToolType.TWITTER,
    icon: '🐦',
    description: 'Scrape X (Twitter) handles and bio-verified contact info.',
    placeholder: 'https://x.com/username or "Web3 Founders"',
    fields: ['name', 'handle', 'followers', 'location', 'email', 'bio'],
    about: {
      purpose: "Identifies key industry voices and filters profiles based on bio keywords and follower counts.",
      limitations: "Bio-based email extraction only works if the user has opted to list it publicly. Subject to platform rate limits.",
      useCases: ["Crypto/Web3 lead generation", "News and media outreach", "Real-time trend monitoring"]
    },
    suggestedPrompts: [
      "Venture Capitalists interested in AI",
      "Web3 Founders and Developers",
      "SaaS product marketers",
      "Journalists covering climate tech"
    ]
  },
  {
    id: ToolType.EMAIL_FINDER,
    icon: '📧',
    description: 'Find verified email addresses from any company domain.',
    placeholder: 'example.com',
    fields: ['name', 'email', 'industry', 'location'],
    about: {
      purpose: "Utilizes advanced pattern matching and web crawling to discover corporate email addresses associated with a domain.",
      limitations: "Success rate varies by company size and domain security policies.",
      useCases: ["Cold email outreach", "Finding decision makers", "Verifying domain-level staff"]
    },
    suggestedPrompts: [
      "hubspot.com employees",
      "stripe.com sales team",
      "nike.com marketing department",
      "tesla.com engineering leads"
    ]
  },
  {
    id: ToolType.GMAPS,
    icon: '📍',
    description: 'Export Google Maps business details to CSV in one click.',
    placeholder: 'Dentists in Los Angeles',
    fields: ['name', 'phone', 'location', 'website', 'industry'],
    about: {
      purpose: "Extracts local business intelligence, including phone numbers, physical addresses, and ratings from map results.",
      limitations: "Limited to businesses with a physical presence or service area listed on Google Maps.",
      useCases: ["Local service marketing", "Real estate lead gen", "Brick-and-mortar competitor mapping"]
    },
    suggestedPrompts: [
      "Dentists in Miami, FL",
      "Roofing contractors in Dallas",
      "Luxury car dealerships in Beverly Hills",
      "Coworking spaces in London"
    ]
  },
  {
    id: ToolType.YOUTUBE,
    icon: '🎥',
    description: 'Find business contact emails from YouTube channels.',
    placeholder: 'https://youtube.com/@channelname',
    fields: ['name', 'followers', 'email', 'location', 'website'],
    about: {
      purpose: "Analyzes channel descriptions and 'About' pages to find business inquiries and social links.",
      limitations: "Email discovery relies on the presence of contact info in the public 'About' section or video descriptions.",
      useCases: ["Sponsorship management", "Video content creator outreach", "Creator economy research"]
    },
    suggestedPrompts: [
      "Tech review channels >100k subs",
      "Cooking vloggers in Australia",
      "Gaming streamers for sponsor outreach",
      "Educational channels in US"
    ]
  },
  {
    id: ToolType.AIRBNB,
    icon: '🏠',
    description: 'Extract host emails and property details from listings.',
    placeholder: 'https://airbnb.com/rooms/123456...',
    fields: ['name', 'location', 'email', 'website', 'industry'],
    about: {
      purpose: "Gathers property hosting data and identifies short-term rental market trends.",
      limitations: "Direct host emails are often masked; the scraper prioritizes secondary public links.",
      useCases: ["Short-term rental management services", "Property investment analysis"]
    },
    suggestedPrompts: [
      "Superhosts in Austin, TX",
      "Luxury villas in Ibiza",
      "Beachfront properties in Florida",
      "Cabin rentals in Colorado"
    ]
  },
  {
    id: ToolType.SKIP_TRACE,
    icon: '🔍',
    description: 'Find contact info and addresses from names or phones.',
    placeholder: 'John Doe, 123 Main St, Springfield',
    fields: ['name', 'phone', 'email', 'location', 'industry'],
    about: {
      purpose: "Connects fragmented data points to build a full profile of an individual's current contact info.",
      limitations: "Accuracy is dependent on public record availability and data freshness.",
      useCases: ["Real estate skip tracing", "Debt recovery", "Legal research"]
    },
    suggestedPrompts: [
      "Property owners in Phoenix, AZ",
      "Absentee landlords in Atlanta",
      "Small business owners in Ohio",
      "Recent home buyers in Seattle"
    ]
  },
  {
    id: ToolType.EMAIL_VALIDATOR,
    icon: '✅',
    description: 'Verify email deliverability and quality scores in bulk.',
    placeholder: 'user@example.com, test@corp.com',
    fields: ['email', 'industry', 'location'],
    about: {
      purpose: "Checks email syntax, MX records, and SMTP handshakes to ensure list health.",
      limitations: "Some 'Catch-all' servers may report false positives for security reasons.",
      useCases: ["Reducing bounce rates", "Cleaning marketing lists", "Protecting sender reputation"]
    },
    suggestedPrompts: [
      "Verify bulk CSV export",
      "Validate new subscriber list",
      "Check abandoned cart emails",
      "Clean old CRM contacts"
    ]
  },
  {
    id: ToolType.BIZBUYSELL,
    icon: '💼',
    description: 'Find businesses for sale with financials and broker contacts.',
    placeholder: 'https://bizbuysell.com/listings/...',
    fields: ['name', 'industry', 'location', 'website', 'email'],
    about: {
      purpose: "Parses business listings for sale, extracting revenue figures and broker contact details.",
      limitations: "Financial data is as-reported by the seller or broker in the listing.",
      useCases: ["Acquisitions and Mergers", "Investment banking leads", "Entrepreneurship through acquisition"]
    },
    suggestedPrompts: [
      "Laundromats for sale in New Jersey",
      "SaaS businesses with >$1M revenue",
      "Restaurants for sale in Denver",
      "Manufacturing plants in the Midwest"
    ]
  },
  {
    id: ToolType.PROPERTY,
    icon: '🏘️',
    description: 'Get home values, tax history, and owner contact info.',
    placeholder: '1600 Amphitheatre Pkwy, Mountain View, CA',
    fields: ['name', 'location', 'industry', 'email'],
    about: {
      purpose: "Aggregates public tax and property record data for real estate professionals.",
      limitations: "Data availability varies by county and state public record laws.",
      useCases: ["Off-market real estate deals", "Tax assessment research", "Home services targeting"]
    },
    suggestedPrompts: [
      "Multi-family homes in Chicago",
      "Commercial lots in Las Vegas",
      "Distressed properties in Detroit",
      "High-value estates in Greenwich, CT"
    ]
  },
  {
    id: ToolType.ANGI,
    icon: '🛠️',
    description: 'Find verified home service professionals with ratings.',
    placeholder: 'Plumbers in Chicago',
    fields: ['name', 'phone', 'location', 'industry', 'website'],
    about: {
      purpose: "Scrapes contractor directories to find top-rated local service businesses.",
      limitations: "Focuses on Angi-verified professionals; reviews are processed as sentiment indicators.",
      useCases: ["Construction material sales", "Sub-contractor recruiting", "Local B2B sales"]
    },
    suggestedPrompts: [
      "Top-rated electricians in Houston",
      "Landscaping companies in Seattle",
      "Kitchen remodeling pros in Boston",
      "Painting contractors in San Diego"
    ]
  },
  {
    id: ToolType.YELP,
    icon: '⭐',
    description: 'Extract business listings with reviews and ratings.',
    placeholder: 'Italian Restaurants in NYC',
    fields: ['name', 'phone', 'location', 'industry', 'website'],
    about: {
      purpose: "Gathers business details and sentiment data from consumer review profiles.",
      limitations: "Review counts are snapshots and may change frequently.",
      useCases: ["Hospitality marketing", "Local reputation management", "Dining and service industry research"]
    },
    suggestedPrompts: [
      "New sushi spots in San Francisco",
      "5-star spas in Manhattan",
      "Pet grooming services in Austin",
      "Nightclubs in South Beach"
    ]
  },
  {
    id: ToolType.PEOPLE,
    icon: '👤',
    description: 'Find anyone by name, phone, or address instantly.',
    placeholder: 'Jane Smith, New York',
    fields: ['name', 'phone', 'email', 'location', 'industry'],
    about: {
      purpose: "A generalized search engine for finding individual contact data across public directories.",
      limitations: "Best used for common names paired with specific locations to avoid ambiguity.",
      useCases: ["General research", "Lost contact recovery", "KYC (Know Your Customer) support"]
    },
    suggestedPrompts: [
      "Financial advisors in Charlotte",
      "Startup founders in Boston",
      "Attorneys in Philadelphia",
      "Mortgage brokers in California"
    ]
  }
];