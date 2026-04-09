/**
 * Local mock portfolio for Teradyne eKnowledge Download Finder demo.
 * Hierarchy aligns with division / category / product structure from Teradyne product portfolio.
 */

export type DownloadType = 'Firmware' | 'Driver' | 'Software' | 'Documentation';

export type Download = {
  id: string;
  name: string;
  version: string;
  type: DownloadType;
  size: string;
  date: string;
};

export type Product = {
  name: string;
  downloads: Download[];
};

export type Category = {
  name: string;
  products: Product[];
};

export type Division = {
  name: string;
  categories: Category[];
};

/** Raw rows: [division, category, product names] */
const PORTFOLIO_ROWS: readonly (readonly [string, string, readonly string[]])[] = [
  [
    'Semiconductor Test',
    'Digital & Mixed-Signal SoC Test',
    [
      'UltraFLEX',
      'UltraFLEXplus',
      'UltraFLEXplus MAX',
      'UltraFLEXplus RF',
      'J750',
      'J750Ex',
      'J750Ex-HD',
      'J750Ex-Ultra',
      'IP750 (Image Sensor Test)',
      'Catalyst',
    ],
  ],
  [
    'Semiconductor Test',
    'RF, Wireless & High-Speed Interface Test',
    [
      'UltraWave24',
      'UltraWaveMX',
      'UltraPHY 112G',
      'UltraPHY 224G',
      'LitePoint IQxel',
      'LitePoint IQxstream',
      'LitePoint IQgig-5G',
      'LitePoint IQnfc',
      'LitePoint IQcell',
    ],
  ],
  [
    'Semiconductor Test',
    'Memory Test Systems',
    ['Magnum EPIC', 'Magnum 7', 'Magnum V'],
  ],
  [
    'Semiconductor Test',
    'System Level Test (SLT)',
    ['Titan', 'Titan HP', 'Titan HV'],
  ],
  [
    'Semiconductor Test',
    'Power, Analog & Automotive Test',
    ['Eagle ETS-364', 'ETS-800', 'ETS-88', 'FLEX', 'A500 Series'],
  ],
  [
    'Robotics',
    'Universal Robots (Collaborative Robots)',
    [
      'UR3e',
      'UR5e',
      'UR10e',
      'UR16e',
      'UR20',
      'UR30',
      'UR8',
      'UR AI Accelerator Toolkit',
      'PolyScope Software',
      'UR+ Ecosystem',
    ],
  ],
  [
    'Robotics',
    'Mobile Industrial Robots (AMRs)',
    [
      'MiR100',
      'MiR250',
      'MiR600',
      'MiR1350',
      'MiR1200 Pallet Jack',
      'MiR Hook 250',
      'MiR Shelf Carrier',
      'MiR Pallet Lift',
      'MiR Top Roller',
      'MiR Charge',
    ],
  ],
  ['Robotics', 'Mobile Cobots (UR + MiR)', ['MC250', 'MC600']],
  [
    'Robotics',
    'Fleet Management, Analytics & Software',
    ['MiR Fleet', 'MiR Insights', 'MiR Robot Software', 'MiR Go Marketplace'],
  ],
  [
    'Robotics',
    'Advanced Robotics & Motion Software',
    [
      'Energid Actin SDK',
      'Energid Motion Planning Software',
      'ATEX-Certified UR Models',
      'Autonomous Palletization Solutions',
    ],
  ],
  [
    'Defense & Aerospace',
    'Functional Test Systems',
    [
      'Spectrum-9100',
      'Spectrum HS',
      'Spectrum CTS',
      'Guardian O-Level Test Platform',
      'L-Series ATE',
      'S9000 Platform',
      'Digital Test Unit (DTU)',
      'ATI / BTI Functional Testers',
    ],
  ],
  [
    'Defense & Aerospace',
    'Avionics & Databus Test',
    [
      'MIL-STD-1553 Test Modules',
      'ARINC-429 Test Modules',
      'ARINC-664 / AFDX Modules',
      'ARINC-615A Data Loaders',
      'Fibre Channel Avionics Test Instruments',
      'Combo 1553 / ARINC Modules',
    ],
  ],
  [
    'Defense & Aerospace',
    'PXI, VXI & LXI Instrumentation',
    [
      'ZT-Series Oscilloscopes',
      'ZT-Series Digitizers',
      'ZT-Series Waveform Generators',
      'ZT-Series Replacement Instruments',
      'Ai-710 Analog Subsystems',
      'Ai-760 Series Instruments',
    ],
  ],
  [
    'Defense & Aerospace',
    'Software & TPS Enablement',
    [
      'LASAR Test Program Set (TPS) Software',
      'TPS Migration Tools',
      'Test Executive Software',
      'Depot TPS Rehost Software',
    ],
  ],
  [
    'Defense & Aerospace',
    'Portable, Rugged & Field Systems',
    [
      'CASS-Compliant Systems',
      'IFTE-Compliant Systems',
      'Rugged Bench Testers',
      'Field-Deployable Test Sets',
      'High-Speed Serial Bus Subsystems',
      'Electronic Warfare (EW) Test Configurations',
    ],
  ],
] as const;

function slugId(productName: string, suffix: string): string {
  const base = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${suffix}`;
}

function hashSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Builds four realistic downloads per product with stable ids and metadata.
 */
export function buildDownloadsForProduct(productName: string): Download[] {
  const seed = hashSeed(productName);
  const vMain = `${1 + (seed % 3)}.${seed % 12}.${(seed >> 3) % 20}`;
  const vPatch = `${2 + ((seed >> 5) % 2)}.${(seed >> 7) % 10}.${(seed >> 9) % 15}`;
  const sizes = ['4.2 MB', '18.7 MB', '124 MB', '2.1 GB', '956 KB', '64 MB'];
  const dates = ['2026-01-14', '2025-11-03', '2025-09-22', '2025-07-08'];

  const pick = (i: number) => sizes[(seed + i) % sizes.length];
  const date = (i: number) => dates[(seed >> i) % dates.length];

  return [
    {
      id: slugId(productName, 'fw'),
      name: `${productName} — System Controller Firmware`,
      version: vMain,
      type: 'Firmware',
      size: pick(0),
      date: date(1),
    },
    {
      id: slugId(productName, 'drv'),
      name: `${productName} — Host Interface Driver Pack`,
      version: vPatch,
      type: 'Driver',
      size: pick(1),
      date: date(2),
    },
    {
      id: slugId(productName, 'sw'),
      name: `${productName} — Configuration & Diagnostics Suite`,
      version: vMain,
      type: 'Software',
      size: pick(2),
      date: date(3),
    },
    {
      id: slugId(productName, 'doc'),
      name: `${productName} — Release Notes & Integration Guide`,
      version: `Rev ${String.fromCharCode(65 + (seed % 6))}`,
      type: 'Documentation',
      size: pick(3),
      date: date(4),
    },
  ];
}

function buildProduct(name: string): Product {
  return { name, downloads: buildDownloadsForProduct(name) };
}

function buildPortfolio(): Division[] {
  const divisionMap = new Map<string, Map<string, Product[]>>();

  for (const [divName, catName, products] of PORTFOLIO_ROWS) {
    if (!divisionMap.has(divName)) {
      divisionMap.set(divName, new Map());
    }
    const catMap = divisionMap.get(divName)!;
    if (!catMap.has(catName)) {
      catMap.set(catName, []);
    }
    const list = catMap.get(catName)!;
    for (const p of products) {
      list.push(buildProduct(p));
    }
  }

  const divisions: Division[] = [];
  for (const [name, catMap] of divisionMap) {
    const categories: Category[] = [];
    for (const [catName, products] of catMap) {
      categories.push({ name: catName, products });
    }
    divisions.push({ name, categories });
  }

  return divisions;
}

export const TERADYNE_PORTFOLIO: Division[] = buildPortfolio();

export type MatchTarget = {
  divisionIndex: number;
  categoryIndex: number;
  productIndex: number;
  score: number;
  productName: string;
  divisionName: string;
  categoryName: string;
};

const TYPE_KEYWORDS: Record<string, DownloadType> = {
  firmware: 'Firmware',
  driver: 'Driver',
  software: 'Software',
  documentation: 'Documentation',
  docs: 'Documentation',
  manual: 'Documentation',
  guide: 'Documentation',
};

/**
 * Parses a preferred download type from free text (client-side heuristic).
 */
export function parsePreferredDownloadType(query: string): DownloadType | undefined {
  const q = query.toLowerCase();
  for (const [kw, t] of Object.entries(TYPE_KEYWORDS)) {
    if (q.includes(kw)) return t;
  }
  return undefined;
}

/**
 * Scores portfolio paths against user text. Higher is better.
 * Prioritizes product name matches, then category/division, then alias tokens.
 */
export function scorePortfolioMatch(query: string): MatchTarget | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const tokens = q.split(/\s+/).filter((t) => t.length > 1);

  let best: MatchTarget | null = null;

  const consider = (
    divisionIndex: number,
    categoryIndex: number,
    productIndex: number,
    score: number,
    productName: string,
    divisionName: string,
    categoryName: string
  ) => {
    if (!best || score > best.score) {
      best = {
        divisionIndex,
        categoryIndex,
        productIndex,
        score,
        productName,
        divisionName,
        categoryName,
      };
    }
  };

  TERADYNE_PORTFOLIO.forEach((div, di) => {
    const divLower = div.name.toLowerCase();
    const divTokens = divLower.split(/\s+/);

    div.categories.forEach((cat, ci) => {
      const catLower = cat.name.toLowerCase();

      cat.products.forEach((prod, pi) => {
        const nameLower = prod.name.toLowerCase();
        const compactName = nameLower.replace(/[^a-z0-9]/g, '');
        const compactQ = q.replace(/[^a-z0-9]/g, '');

        let score = 0;

        if (nameLower === q || compactName === compactQ) {
          score += 150;
        }

        if (compactQ && compactName.includes(compactQ)) {
          score += 110 - Math.min(40, compactName.length - compactQ.length);
        }

        if (q.includes(nameLower) || nameLower.includes(q)) {
          score += 95;
        }

        for (const tok of tokens) {
          if (tok.length < 3) continue;
          if (nameLower.includes(tok)) score += 45;
          if (compactName.includes(tok.replace(/[^a-z0-9]/g, ''))) score += 35;
        }

        const prodWords = nameLower.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
        for (const tok of tokens) {
          if (prodWords.some((w) => w === tok || w.startsWith(tok) || tok.startsWith(w))) {
            score += 25;
          }
        }

        if (q.includes(divLower) || divTokens.some((t) => q.includes(t))) {
          score += 22;
        }
        if (q.includes(catLower)) {
          score += 18;
        }

        if (score > 0) {
          consider(di, ci, pi, score, prod.name, div.name, cat.name);
        }
      });
    });
  });

  return best;
}
