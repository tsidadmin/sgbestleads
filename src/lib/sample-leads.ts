import { FEED_IDS } from "./plans";

/**
 * Sample dataset generator.
 * Every record is FICTIONAL — companies, people, UENs, emails and phone
 * numbers are generated (emails use the reserved `.example` TLD). In
 * production this module is replaced by the real sourcing pipeline.
 */

export type Lead = {
  id: string;
  company: string;
  uen: string;
  industry: string;
  district: string;
  contact: string;
  role: string;
  email: string;
  phone: string;
  signal: string;
  added: string; // ISO date
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const FIRST = [
  "Wei Ling", "Marcus", "Aisyah", "Rajesh", "Grace", "Daniel", "Hui Min",
  "Farhan", "Priya", "Jonathan", "Mei Yee", "Kelvin", "Nurul", "Arjun",
  "Serene", "Benjamin", "Xiu Ying", "Hafiz", "Vanessa", "Zhi Hao",
] as const;

const LAST = [
  "Tan", "Lim", "Lee", "Ng", "Wong", "Chen", "Goh", "Ong", "Kumar",
  "Ibrahim", "Teo", "Koh", "Rahman", "Chua", "Yeo", "Pillai",
] as const;

const NAME_A = [
  "Meridian", "Harbourline", "Straits", "Tembusu", "Kallang", "Katong",
  "Bishan", "Novena", "Clementi", "Jurong Peak", "Tanjong", "Orchid Bay",
  "Redhill", "Seletar", "Punggol Cove", "Emerald Hill", "Bedok Rise",
  "Alexandra", "Gardenia", "Pasir View",
] as const;

const SUFFIX = ["Pte Ltd", "Pte Ltd", "Pte Ltd", "LLP"] as const;

const DISTRICTS = [
  "Raffles Place", "Tanjong Pagar", "Jurong East", "Paya Lebar",
  "Woodlands", "Kallang", "Bukit Merah", "Changi Business Park",
  "Toa Payoh", "Clementi", "Ang Mo Kio", "Ubi",
] as const;

type FeedSpec = {
  industries: readonly string[];
  nameB: readonly string[];
  roles: readonly string[];
  signal: (rng: () => number) => string;
  count: number;
};

const HIRING_ROLES = [
  "Sales Executive", "Operations Manager", "Software Engineer",
  "Accounts Executive", "Marketing Executive", "Customer Success Lead",
  "Service Technician", "Business Development Manager",
] as const;

const FS_SIGNALS = [
  "New director appointed", "EDG grant application", "Fleet expansion",
  "Headcount +5 in 90 days", "New office lease", "Second entity registered",
] as const;

const FB_SIGNALS = [
  "New outlet opening", "Renovation permit filed", "Franchise activity",
  "Hiring outlet crew", "Second location scouted", "Central kitchen setup",
] as const;

const SPECS: Record<string, FeedSpec> = {
  "new-companies": {
    industries: [
      "Logistics", "E-commerce", "Consultancy", "Construction", "IT Services",
      "Wholesale Trade", "Education", "Wellness",
    ],
    nameB: ["Logistics", "Trading", "Consulting", "Digital", "Solutions", "Ventures", "Studio", "Group"],
    roles: ["Director", "Founder", "Managing Director"],
    signal: (rng) => {
      const day = 1 + Math.floor(rng() * 28);
      const now = new Date();
      const month = now.toLocaleString("en-SG", { month: "short" });
      return `Incorporated ${day} ${month} ${now.getFullYear()}`;
    },
    count: 48,
  },
  hiring: {
    industries: [
      "Manufacturing", "IT Services", "Healthcare", "F&B", "Logistics",
      "Professional Services", "Retail",
    ],
    nameB: ["Engineering", "Systems", "Manufacturing", "Healthcare", "Foods", "Partners", "Works"],
    roles: ["HR Manager", "Head of People", "Talent Acquisition Lead", "HR Director"],
    signal: (rng) => `Hiring: ${pick(rng, HIRING_ROLES)}`,
    count: 42,
  },
  "digital-gap": {
    industries: [
      "Home Services", "Dental", "Automotive", "Beauty", "Tuition",
      "Landscaping", "Pest Control", "Interior Design",
    ],
    nameB: ["Services", "Clinic", "Motors", "Interiors", "Academy", "Wellness", "Contractors"],
    roles: ["Owner", "Managing Partner", "Director"],
    signal: (rng) => {
      const stars = (3.9 + rng() * 1.0).toFixed(1);
      const reviews = 40 + Math.floor(rng() * 860);
      const score = rng() < 0.55 ? 1 : 2;
      return `Google ${stars} stars (${reviews} reviews) - site score ${score}/5`;
    },
    count: 40,
  },
  "fnb-retail": {
    industries: [
      "Cafe", "Restaurant", "Bakery", "Bubble Tea", "Grocer", "Hawker Group",
      "Fashion Retail", "Minimart",
    ],
    nameB: ["Kitchen", "Coffee", "Bakes", "Eatery", "Mart", "Provisions", "Tea House"],
    roles: ["Owner", "Operations Director", "Franchise Manager"],
    signal: (rng) => pick(rng, FB_SIGNALS),
    count: 44,
  },
  finance: {
    industries: [
      "Construction", "Logistics", "Marine Services", "Precision Engineering",
      "Wholesale Trade", "Medical Group", "Facilities Management",
    ],
    nameB: ["Engineering", "Marine", "Holdings", "Logistics", "Industries", "Facilities", "Medical"],
    roles: ["Finance Director", "Managing Director", "CFO", "Director"],
    signal: (rng) => pick(rng, FS_SIGNALS),
    count: 36,
  },
};

function currentYM(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function buildFeed(feedId: string, ym: string): Lead[] {
  const spec = SPECS[feedId];
  if (!spec) return [];
  const rng = mulberry32(hashSeed(`${feedId}:${ym}`));
  const leads: Lead[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < spec.count; i++) {
    let nameA = pick(rng, NAME_A);
    let nameB = pick(rng, spec.nameB);
    let attempts = 0;
    while (usedNames.has(`${nameA} ${nameB}`) && attempts < 8) {
      nameA = pick(rng, NAME_A);
      nameB = pick(rng, spec.nameB);
      attempts++;
    }
    usedNames.add(`${nameA} ${nameB}`);

    const company = `${nameA} ${nameB} ${pick(rng, SUFFIX)}`;
    const first = pick(rng, FIRST);
    const last = pick(rng, LAST);
    const year = new Date().getFullYear();
    const uen = `${year}${String(10000 + Math.floor(rng() * 89999))}${pick(rng, ["K", "M", "N", "R", "X", "Z"] as const)}`;
    const daysAgo = Math.floor(rng() * 28);
    const added = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    leads.push({
      id: `${feedId}-${ym}-${i}`,
      company,
      uen,
      industry: pick(rng, spec.industries),
      district: pick(rng, DISTRICTS),
      contact: `${first} ${last}`,
      role: pick(rng, spec.roles),
      email: `${slugify(first.split(" ")[0])}.${slugify(last)}@${slugify(nameA + nameB)}.example`,
      phone: `+65 6${100 + Math.floor(rng() * 800)} ${1000 + Math.floor(rng() * 9000)}`,
      signal: spec.signal(rng),
      added: added.toISOString(),
    });
  }

  return leads.sort((a, b) => b.added.localeCompare(a.added));
}

/** Generate this month's sample records for a feed. */
export function generateLeads(feedId: string): Lead[] {
  const ym = currentYM();
  if (feedId === "all-access") {
    return FEED_IDS.flatMap((id) => buildFeed(id, ym)).sort((a, b) =>
      b.added.localeCompare(a.added)
    );
  }
  return buildFeed(feedId, ym);
}

export function leadCountThisMonth(feedIds: string[]): number {
  const ym = currentYM();
  return feedIds.reduce((sum, id) => sum + buildFeed(id, ym).length, 0);
}
