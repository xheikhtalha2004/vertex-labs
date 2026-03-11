/**
 * Vertex Labs — Public API Client
 * Fetches dynamic CMS data from the admin panel's public API endpoints.
 * Falls back to static data if the API URL is not configured.
 */

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || '';

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

async function fetchPublic<T>(path: string, fallback: T): Promise<T> {
  if (!ADMIN_API_URL) return fallback;
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/public${path}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return fallback;
    const json: ApiResponse<T> = await res.json();
    return json.data ?? fallback;
  } catch {
    return fallback;
  }
}

// =====================================================
// Services
// =====================================================
export interface PublicService {
  id: string;
  title: string;
  description: string;
  icon?: string;
  features: string[];
  order: number;
}

export const STATIC_SERVICES: PublicService[] = [];

export async function getServices(): Promise<PublicService[]> {
  return fetchPublic<PublicService[]>('/services', STATIC_SERVICES);
}

// =====================================================
// Projects
// =====================================================
export interface PublicProject {
  id: string;
  title: string;
  category: string;
  description: string;
  tech: string[];
  imageUrl?: string;
  imageAlt?: string;
  featured: boolean;
  slug?: string;
}

export const STATIC_PROJECTS: PublicProject[] = [
  { id: '1', title: 'Aerodynamic Optimization: F1 Rear Wing Assembly', category: 'CFD', description: 'Computational fluid dynamics study to maximize downforce while minimizing drag for a Formula 1 rear wing under race conditions (250+ km/h).', tech: ['OpenFOAM', 'Aerodynamics'], featured: true },
  { id: '2', title: 'Modal Analysis: 3U CubeSAT Structural Integrity', category: 'FEA', description: 'Static and dynamic stress analysis for a 3U CubeSAT satellite to survive launch vibration profiles (NASA GEVS) and orbital thermal cycling.', tech: ['ANSYS', 'FEA', 'Aerospace'], featured: true },
  { id: '3', title: 'Thermal Management: EV Battery Pack Cooling', category: 'THERMAL', description: 'Conjugate heat transfer simulation for liquid-cooled battery pack maintaining cell temperatures between 20-35°C under fast charging.', tech: ['COMSOL', 'Thermal', 'Automotive'], featured: false },
  { id: '4', title: 'Structural Design: Industrial Robotic Arm', category: 'MECHANICAL_DESIGN', description: 'Lightweight manipulator design for 50kg payload with <0.5mm end-effector deflection under dynamic loading.', tech: ['SolidWorks', 'FEA', 'Robotics'], featured: false },
];

export async function getProjects(category?: string): Promise<PublicProject[]> {
  const path = category ? `/projects?category=${category}` : '/projects';
  return fetchPublic<PublicProject[]>(path, STATIC_PROJECTS);
}

// =====================================================
// Testimonials
// =====================================================
export interface PublicTestimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
  authorOrg?: string;
  authorAvatar?: string;
  rating: number;
  featured: boolean;
}

export const STATIC_TESTIMONIALS: PublicTestimonial[] = [
  { id: '1', quote: 'Vertex Labs engineered a thermal management solution that reduced our satellite payload temperature variance by 40%. Mission-critical precision.', authorName: 'Dr. Sarah Chen', authorRole: 'CTO', authorOrg: 'AeroSpace Dynamics', rating: 5, featured: true },
];

export async function getTestimonials(): Promise<PublicTestimonial[]> {
  return fetchPublic<PublicTestimonial[]>('/testimonials', STATIC_TESTIMONIALS);
}

// =====================================================
// Homepage settings
// =====================================================
export interface HomepageData {
  heroHeadline: string;
  heroHighlight: string;
  heroSubcopy: string;
  heroBadge1: string;
  heroBadge2: string;
  heroBadge3: string;
  stat1Value: string; stat1Label: string;
  stat2Value: string; stat2Label: string;
  stat3Value: string; stat3Label: string;
  stat4Value: string; stat4Label: string;
  trusteeLogos: string[];
  activeProjectsCount?: number;
}

const STATIC_HOMEPAGE: HomepageData = {
  heroHeadline: 'Engineering Solvency at Scale.',
  heroHighlight: 'Solvency',
  heroSubcopy: 'We don\'t "make things pretty." We engineer outcomes.',
  heroBadge1: 'ISO 9001:2015', heroBadge2: 'ON-PREMISE LAB', heroBadge3: 'HPC CLUSTER READY',
  stat1Value: '247+', stat1Label: 'Projects Shipped',
  stat2Value: '99.70%', stat2Label: 'Analysis Precision',
  stat3Value: '$2.4M+', stat3Label: 'Cost Avoided',
  stat4Value: '24/7', stat4Label: 'Lab Access',
  trusteeLogos: ['MIT', 'SIEMENS', 'Stanford', 'P&G', 'Caltech', 'HITACHI'],
  activeProjectsCount: 1,
};

export async function getHomepageSettings(): Promise<HomepageData> {
  return fetchPublic<HomepageData>('/homepage', STATIC_HOMEPAGE);
}

// =====================================================
// Site settings
// =====================================================
export async function getSiteSettings(): Promise<Record<string, string>> {
  return fetchPublic<Record<string, string>>('/settings', {});
}

// =====================================================
// Contact form lead submission
// =====================================================
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!ADMIN_API_URL) {
    // Fallback to existing Supabase contact form
    console.warn('[api] VITE_ADMIN_API_URL not set, contact form submission will use Supabase fallback');
    return { success: false, error: 'Admin API not configured' };
  }

  try {
    const res = await fetch(`${ADMIN_API_URL}/api/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) return { success: true, message: json.message };
    return { success: false, error: json.error };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
