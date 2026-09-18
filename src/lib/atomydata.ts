import countryData from '../data/atomydata.json';

export interface AtomySection {
    title: string;
    description: string;
    button?: string;
}

export interface AtomyCountry {
    country: string;
    country_code: string;
    lang: string;
    title: string;
    description: string;
    keywords: string;
    url: string[];
    button: string;
    hero: Required<AtomySection>;
    business: AtomySection;
    benefits: { title: string; items: { title: string; description: string }[] };
    gallery: string[];
    gallery_section: AtomySection;
    community: Required<AtomySection>;
    global: Required<AtomySection>;
    cta: Required<AtomySection>;
    footer_text: string;
}

export const FALLBACK_COUNTRY = 'US';

const data = countryData as Record<string, AtomyCountry>;

export function getAtomyData(countryCode: string) {
    return data[countryCode] ?? data[FALLBACK_COUNTRY];
}

async function resolveUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'manual',
            signal: AbortSignal.timeout(5000),
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            },
        });

        // 301, 302, 307, 308 son códigos de redirección con header Location
        if (response.status === 302 || (response.status >= 300 && response.status < 400)) {
            return response.headers.get('Location') ?? url;
        }

        return url;
    } catch (error) {
        // En caso de timeout o error de red, devuelve la URL original
        console.error(`Error resolving ${url}:`, error);
        return url;
    }
}

export async function updateUrls(urls: string[]): Promise<string[]> {
    if (!Array.isArray(urls)) return [];
    return Promise.all(urls.map((url) => resolveUrl(url)));
}

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// "Europe (Germany)" -> europe; "대한민국 (South Korea)" -> south-korea (la base no deja caracteres latinos)
export function getSlug(country: string): string {
    const parts = country.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
    const base = slugify(parts ? parts[1] : country);
    return base || slugify(parts?.[2] ?? '');
}

export function getAllCountries() {
    return Object.values(data).map((country) => ({
        code: country.country_code,
        slug: getSlug(country.country),
        hreflang: getHreflang(country),
        data: country,
    }));
}

// UK y EU no son códigos de región ISO 3166-1 válidos para hreflang
const HREFLANG_REGION: Record<string, string> = { UK: 'GB', EU: 'DE' };

function getHreflang(country: AtomyCountry): string {
    return `${country.lang}-${HREFLANG_REGION[country.country_code] ?? country.country_code}`;
}

export function getSlugsByCode(): Record<string, string> {
    const slugs = Object.fromEntries(getAllCountries().map(({ code, slug }) => [code, slug]));
    for (const [alias, target] of Object.entries(CODE_ALIASES)) {
        if (slugs[target]) slugs[alias] = slugs[target];
    }
    return slugs;
}

// Códigos ISO que ipquery devuelve pero que el dataset agrupa bajo otra clave
const CODE_ALIASES: Record<string, string> = {
    GB: 'UK',
    ...Object.fromEntries(
        [
            'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR',
            'HU', 'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO',
            'SE', 'SI', 'SK',
        ].map((code) => [code, 'EU']),
    ),
};

export function getCountryBySlug(slug: string) {
    return getAllCountries().find((country) => country.slug === slug);
}
