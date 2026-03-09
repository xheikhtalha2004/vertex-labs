import { z } from 'zod';

// =====================================================
// AUTH
// =====================================================
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('EDITOR'),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
});

// =====================================================
// HOMEPAGE
// =====================================================
export const HomepageSettingsSchema = z.object({
  heroHeadline: z.string().min(1).max(200),
  heroHighlight: z.string().min(1).max(100),
  heroSubcopy: z.string().min(1).max(500),
  heroBadge1: z.string().max(50),
  heroBadge2: z.string().max(50),
  heroBadge3: z.string().max(50),
  stat1Value: z.string().max(20),
  stat1Label: z.string().max(50),
  stat2Value: z.string().max(20),
  stat2Label: z.string().max(50),
  stat3Value: z.string().max(20),
  stat3Label: z.string().max(50),
  stat4Value: z.string().max(20),
  stat4Label: z.string().max(50),
  trusteeLogos: z.array(z.string()).optional(),
});

// =====================================================
// SERVICES
// =====================================================
export const ServiceSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  icon: z.string().max(100).optional(),
  features: z.array(z.string().max(200)).default([]),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// =====================================================
// PROJECTS
// =====================================================
export const ProjectSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.enum(['CFD', 'FEA', 'THERMAL', 'MECHANICAL_DESIGN', 'ELECTRONICS', 'SOFTWARE', 'OTHER']),
  description: z.string().min(10).max(2000),
  tech: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageAlt: z.string().max(200).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
  slug: z.string().max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').optional(),
});

// =====================================================
// TESTIMONIALS
// =====================================================
export const TestimonialSchema = z.object({
  quote: z.string().min(20).max(1000),
  authorName: z.string().min(2).max(100),
  authorRole: z.string().max(100).optional(),
  authorOrg: z.string().max(100).optional(),
  authorAvatar: z.string().url().optional().or(z.literal('')),
  rating: z.number().int().min(1).max(5).default(5),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

// =====================================================
// LEADS
// =====================================================
export const LeadStatusSchema = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED_WON', 'CLOSED_LOST']);

export const UpdateLeadSchema = z.object({
  status: LeadStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
  assignedTo: z.string().email().optional().or(z.literal('')),
});

// Internal lead creation (from contact form)
export const CreateLeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  projectType: z.string().max(100).optional(),
  message: z.string().min(10).max(5000),
  source: z.string().max(50).optional(),
});

// =====================================================
// SEO
// =====================================================
export const SeoMetaSchema = z.object({
  pageSlug: z.string().min(1).max(100),
  pageTitle: z.string().min(2).max(200),
  metaTitle: z.string().max(70).optional(),
  description: z.string().max(160).optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(200).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
  keywords: z.string().max(500).optional(),
  canonical: z.string().url().optional().or(z.literal('')),
  noIndex: z.boolean().default(false),
});

// =====================================================
// SITE SETTINGS
// =====================================================
export const SiteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  type: z.enum(['string', 'json', 'boolean', 'number']).default('string'),
  label: z.string().max(100).optional(),
  group: z.enum(['general', 'contact', 'social', 'appearance']).optional(),
});

export const BulkSiteSettingsSchema = z.array(
  z.object({
    key: z.string(),
    value: z.string(),
  })
);

// =====================================================
// MEDIA
// =====================================================
export const MediaMetaSchema = z.object({
  altText: z.string().max(200).optional(),
  folder: z.string().max(100).optional(),
});
