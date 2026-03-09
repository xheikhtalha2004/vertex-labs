import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // =====================================================
  // 1. ADMIN USER
  // =====================================================
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@vertexlabs.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: { email, name: 'Vertex Admin', passwordHash, role: 'ADMIN' },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // =====================================================
  // 2. HOMEPAGE SETTINGS
  // =====================================================
  const existing = await prisma.homepageSettings.findFirst();
  if (!existing) {
    await prisma.homepageSettings.create({
      data: {
        heroHeadline: 'Engineering Solvency at Scale.',
        heroHighlight: 'Solvency',
        heroSubcopy: 'We don\'t "make things pretty." We engineer outcomes. High-fidelity CAD, computational validation, and rapid prototyping for B2B manufacturers who need to ship.',
        heroBadge1: 'ISO 9001:2015',
        heroBadge2: 'ON-PREMISE LAB',
        heroBadge3: 'HPC CLUSTER READY',
        stat1Value: '247+', stat1Label: 'Projects Shipped',
        stat2Value: '99.70%', stat2Label: 'Analysis Precision',
        stat3Value: '$2.4M+', stat3Label: 'Cost Avoided',
        stat4Value: '24/7', stat4Label: 'Lab Access',
        trusteeLogos: ['MIT', 'SIEMENS', 'Stanford', 'P&G', 'Caltech', 'HITACHI'],
      },
    });
    console.log('✅ Homepage settings seeded');
  }

  // =====================================================
  // 3. SERVICES
  // =====================================================
  const services = [
    { title: 'CFD Analysis', description: 'Computational fluid dynamics simulations for aerodynamics, heat transfer, and fluid flow optimization. Validated against experimental data.', icon: 'Wind', features: ['Full mesh independence study', 'Turbulence modeling (k-ω SST, LES)', 'Automated reporting', 'Peer-review validation'], order: 1 },
    { title: 'FEA / Structural Analysis', description: 'Finite element analysis for static, dynamic, fatigue, and thermal-structural problems. NASA GEVS and industry-standard validation.', icon: 'Activity', features: ['Linear & nonlinear analysis', 'Modal & harmonic response', 'Fatigue prediction', 'Safety factor reporting'], order: 2 },
    { title: 'CAD & 3D Design', description: 'Precision mechanical design and reverse engineering using SolidWorks, CATIA, and Fusion 360 for complex assemblies.', icon: 'Box', features: ['Parametric CAD', 'Reverse engineering', 'GD&T compliance', 'Design for manufacturing'], order: 3 },
    { title: 'Thermal Management', description: 'Conjugate heat transfer simulations for electronics cooling, battery thermal management, and industrial heat exchangers.', icon: 'Cpu', features: ['Liquid and air cooling', 'Phase change modeling', 'PCB-level thermal analysis', 'COMSOL multiphysics'], order: 4 },
    { title: 'Rapid Prototyping', description: 'From validated simulation to physical prototype delivery. Coordinated manufacturing with partner facilities.', icon: 'Zap', features: ['FDM / SLA 3D printing', 'CNC machining coordination', 'DFM review', 'Assembly documentation'], order: 5 },
    { title: 'Technical Consulting', description: 'Engineering advisory for product development teams. Code review, solver selection, and methodology validation.', icon: 'FlaskConical', features: ['Solver selection', 'Methodology review', 'Training sessions', 'R&D support'], order: 6 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: `seed-service-${s.order}` },
      update: {},
      create: { id: `seed-service-${s.order}`, ...s, active: true },
    });
  }
  console.log(`✅ ${services.length} services seeded`);

  // =====================================================
  // 4. PROJECTS
  // =====================================================
  const projects = [
    { title: 'Aerodynamic Optimization: F1 Rear Wing Assembly', category: 'CFD' as const, description: 'Computational fluid dynamics study to maximize downforce while minimizing drag for a Formula 1 rear wing under race conditions (250+ km/h).', tech: ['OpenFOAM', 'Aerodynamics', 'Python'], order: 1, featured: true },
    { title: 'Modal Analysis: 3U CubeSAT Structural Integrity', category: 'FEA' as const, description: 'Static and dynamic stress analysis for a 3U CubeSAT satellite to survive launch vibration profiles (NASA GEVS) and orbital thermal cycling.', tech: ['ANSYS', 'FEA', 'Aerospace'], order: 2, featured: true },
    { title: 'Thermal Management: EV Battery Pack Cooling', category: 'THERMAL' as const, description: 'Conjugate heat transfer simulation for liquid-cooled battery pack maintaining cell temperatures between 20-35°C under fast charging.', tech: ['COMSOL', 'Thermal', 'Automotive'], order: 3 },
    { title: 'Structural Design: Industrial Robotic Arm', category: 'MECHANICAL_DESIGN' as const, description: 'Lightweight manipulator design for 50kg payload with <0.5mm end-effector deflection under dynamic loading.', tech: ['SolidWorks', 'FEA', 'Robotics'], order: 4 },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80) },
      update: {},
      create: { ...p, slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80), active: true, featured: p.featured || false },
    });
  }
  console.log(`✅ ${projects.length} projects seeded`);

  // =====================================================
  // 5. TESTIMONIALS
  // =====================================================
  await prisma.testimonial.upsert({
    where: { id: 'seed-testimonial-1' },
    update: {},
    create: {
      id: 'seed-testimonial-1',
      quote: 'Vertex Labs engineered a thermal management solution that reduced our satellite payload temperature variance by 40%. Mission-critical precision.',
      authorName: 'Dr. Sarah Chen',
      authorRole: 'CTO',
      authorOrg: 'AeroSpace Dynamics',
      rating: 5,
      active: true,
      featured: true,
      order: 1,
    },
  });
  console.log('✅ Sample testimonial seeded');

  // =====================================================
  // 6. SITE SETTINGS
  // =====================================================
  const siteSettings = [
    { key: 'site_name', value: 'Vertex Labs', label: 'Site Name', group: 'general' },
    { key: 'site_tagline', value: 'Engineering Solvency at Scale', label: 'Tagline', group: 'general' },
    { key: 'contact_email', value: 'business.vertexlabs@gmail.com', label: 'Contact Email', group: 'contact' },
    { key: 'whatsapp_number', value: '+923135229867', label: 'WhatsApp Number', group: 'contact' },
    { key: 'address', value: 'Manchester, United Kingdom', label: 'Office Address', group: 'contact' },
    { key: 'linkedin_url', value: '', label: 'LinkedIn URL', group: 'social' },
    { key: 'github_url', value: '', label: 'GitHub URL', group: 'social' },
    { key: 'twitter_url', value: '', label: 'Twitter URL', group: 'social' },
    { key: 'logo_url', value: '', label: 'Logo URL', group: 'appearance' },
    { key: 'favicon_url', value: '', label: 'Favicon URL', group: 'appearance' },
    { key: 'primary_color', value: '#4F6DF5', label: 'Brand Color', group: 'appearance' },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { ...s, type: 'string' },
    });
  }
  console.log(`✅ ${siteSettings.length} site settings seeded`);

  // =====================================================
  // 7. SEO META
  // =====================================================
  const seoPages = [
    { pageSlug: 'home', pageTitle: 'Vertex Labs | Engineering Solvency at Scale', metaTitle: 'Vertex Engineering Labs', description: 'High-fidelity CFD, FEA, and CAD engineering services. Validated simulations, rapid prototyping, and B2B technical consulting.', keywords: 'CFD analysis, FEA simulation, engineering services, aerodynamics, thermal management, SolidWorks' },
    { pageSlug: 'services', pageTitle: 'Services | Vertex Labs', description: 'Explore our engineering services: CFD, FEA, thermal analysis, CAD design, rapid prototyping, and technical consulting.' },
    { pageSlug: 'projects', pageTitle: 'Portfolio | Vertex Labs', description: 'Browse our validated case studies in CFD, FEA, thermal management, and mechanical design.' },
    { pageSlug: 'contact', pageTitle: 'Contact | Vertex Labs', description: 'Start your engineering project with Vertex Labs. Submit a technical brief for computational feasibility analysis.' },
  ];

  for (const p of seoPages) {
    await prisma.seoMeta.upsert({
      where: { pageSlug: p.pageSlug },
      update: {},
      create: { ...p, noIndex: false },
    });
  }
  console.log(`✅ ${seoPages.length} SEO pages seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log(`\n📋 Admin credentials:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n⚠️  Change the admin password after first login!\n`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
