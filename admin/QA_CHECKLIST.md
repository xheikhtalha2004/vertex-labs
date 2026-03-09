# Vertex Labs Admin Panel — QA Checklist

## 1. Authentication
- [ ] Login with valid credentials redirects to `/admin/dashboard`
- [ ] Login with wrong password shows error message (does NOT reveal if email exists)
- [ ] Navigating to `/admin/dashboard` without session redirects to `/login`
- [ ] Sign-out clears session and redirects to `/login`
- [ ] JWT session persists across page refresh
- [ ] VIEWER role user is redirected away from `/admin/users`
- [ ] Login event appears in Audit Log on dashboard

## 2. Dashboard
- [ ] Stats cards show correct totals from database
- [ ] Recent leads section shows latest 5 leads
- [ ] Audit log shows recent actions with color coding
- [ ] Quick action links navigate to correct pages
- [ ] Live status indicator is visible

## 3. Homepage Manager
- [ ] Form pre-fills with existing homepage settings
- [ ] Editing headline with a highlighted word previews correctly
- [ ] Badge chips update in real-time as text is typed
- [ ] Save updates the database and shows "✓ Saved"
- [ ] Preview button opens public site in new tab

## 4. Services CRUD
- [ ] Services table lists all services in order
- [ ] Add Service form validates required fields (title, description)
- [ ] Created service appears in list immediately
- [ ] Edit pre-fills form with existing data
- [ ] Update reflects in list
- [ ] Toggle Active/Inactive works without page reload
- [ ] Delete confirm dialog appears before deletion
- [ ] Deleted service disappears from list
- [ ] Action is logged in Audit Log

## 5. Projects CRUD
- [ ] Projects load with all categories shown in filter chips
- [ ] Filter chips correctly filter the table
- [ ] Thumbnail preview shows for projects with image URLs
- [ ] Featured star icon visible for featured projects
- [ ] Add/Edit modal: all fields save correctly
- [ ] Tech tags display truncated correctly
- [ ] Delete with confirm works

## 6. Testimonials CRUD
- [ ] Star rating renders correctly in card (filled vs empty)
- [ ] Featured badge visible when checked
- [ ] All 5 star ratings selectable (1–5)
- [ ] Add/Edit/Delete all work

## 7. Leads / CRM
- [ ] Leads table loads with correct data
- [ ] Search by name, email, and company works
- [ ] Status filter pills filter correctly
- [ ] Clicking a row opens detail panel on right
- [ ] Status dropdown updates lead status immediately
- [ ] Notes save and persist after page refresh
- [ ] Email link in detail panel is clickable (mailto:)
- [ ] Delete lead (ADMIN only) works with confirm
- [ ] Source field displays "contact_form" for web submissions

## 8. Media Library
- [ ] Drag and drop triggers upload zone highlight
- [ ] Clicking zone opens file picker
- [ ] Progress bar shows during multi-file upload
- [ ] Uploaded images appear in grid after upload
- [ ] Hover overlay shows copy/delete buttons
- [ ] "Copy URL" copies to clipboard and shows ✓ confirmation
- [ ] Selecting an asset shows detail panel with metadata
- [ ] Delete removes from grid and from Cloudinary
- [ ] Non-image files show file icon instead of thumbnail

## 9. SEO Manager
- [ ] All 4 default pages appear in sidebar
- [ ] Selecting a page loads its form data
- [ ] Meta title character counter turns red at 60+ chars
- [ ] Description character counter turns red at 155+ chars
- [ ] OG Image URL field renders image preview when valid URL entered
- [ ] Save upserts record (safe for new pages)
- [ ] noIndex checkbox works

## 10. Site Settings
- [ ] All settings groups: General, Contact, Social, Appearance load
- [ ] Color picker for brand color opens native picker
- [ ] Hex input and color picker stay in sync
- [ ] Save updates all settings in one request
- [ ] Settings persist after page refresh

## 11. User Management (ADMIN only)
- [ ] Non-ADMIN users cannot access `/admin/users` (redirected)
- [ ] User list shows all users with role badges in correct colors
- [ ] "Last Login" shows date or "Never"
- [ ] Create user validates email uniqueness (409 on duplicate)
- [ ] Password field hidden on edit (blank = keep existing)
- [ ] Role change updates immediately
- [ ] Cannot delete yourself (shows error)

## 12. Public API Endpoints
- [ ] `GET /api/public/services` returns only active services, no auth required
- [ ] `GET /api/public/projects` returns only active projects, supports `?category=` filter
- [ ] `GET /api/public/testimonials` returns only active testimonials
- [ ] `GET /api/public/homepage` returns homepage settings object
- [ ] `GET /api/public/settings` returns only safe public settings keys
- [ ] All responses include `Access-Control-Allow-Origin` header for configured origins

## 13. Contact Form Integration
- [ ] `POST /api/admin/dashboard` with valid data creates a new lead in database
- [ ] New lead appears in Leads page with status "NEW"
- [ ] Invalid data returns 422 with Zod validation errors

## 14. Role-Based Access Control
| Action | ADMIN | EDITOR | VIEWER |
|---|---|---|---|
| View all pages | ✓ | ✓ | ✓ |
| Create/Edit content | ✓ | ✓ | ✗ |
| Delete leads | ✓ | ✗ | ✗ |
| Access /users | ✓ | ✗ (redirect) | ✗ (redirect) |
| Manage site settings | ✓ | ✗ | ✗ |

## 15. Performance & Security
- [ ] Admin panel is not indexed by search engines (`noindex` in root layout)
- [ ] Passwords are hashed with bcrypt (cost factor 12)
- [ ] API routes never return `passwordHash` field
- [ ] File upload limits enforced (max 10MB)
- [ ] CORS restricted to configured `ALLOWED_ORIGINS` for public API
- [ ] NextAuth JWT expires after 30 days
- [ ] All admin state-change APIs return 403 for VIEWER role
