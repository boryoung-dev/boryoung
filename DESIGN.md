# Design

## Source of truth
- Status: Draft
- Last refreshed: 2026-06-08
- Primary product surfaces: `apps/web` public travel website; `apps/admin` controls web content and product/curation data.
- Evidence reviewed: `apps/web/src/components/home/HomePage.tsx`, `apps/web/src/components/home/GlobeSection.tsx`, `apps/web/src/components/home/ProductShowcase.tsx`, `apps/web/src/components/home/sections/_shared/SectionContainer.tsx`, `apps/web/src/components/common/SiteHeader.tsx`, `apps/web/src/content/homeSections.ts`.

## Brand
- Personality: established, direct, trustworthy golf travel specialist.
- Trust signals: 22-year operating history, phone-first consultation, curated country/product sections, visible product price and destination metadata.
- Avoid: tiny editorial UI, excessive empty margins on wide screens, decorative layouts that reduce product discoverability, AI-looking emoji/icon grids on travel product pages.

## Product goals
- Goals: help visitors quickly discover golf tour destinations and products, then contact the agency through phone/Kakao/contact flows.
- Non-goals: marketing-only landing pages, complex visual systems detached from admin-managed content.
- Success signals: first screen feels substantial, product cards are readable at a glance, country/category navigation is easy to tap.

## Personas and jobs
- Primary personas: middle-aged and older golf travelers, group-trip organizers, repeat travel customers.
- User jobs: compare destinations, scan recommended products, confirm price ranges, start consultation.
- Key contexts of use: desktop browsing with wide monitors, mobile browsing before phone/Kakao consultation.

## Information architecture
- Primary navigation: travel products, magazine, company introduction, contact.
- Core routes/screens: home, tours list, tour detail, magazine, about, contact.
- Content hierarchy: first destination discovery, then curated products, then consultation/trust sections.

## Design principles
- Principle 1: prioritize large readable content over compact editorial density.
- Principle 2: use wider containers and larger cards on public web surfaces so large screens feel intentionally filled.
- Tradeoffs: larger cards show fewer items per row, but improve readability and perceived confidence for the current audience.

## Visual language
- Color: keep existing neutral white/surface foundation with brand accents; for travel showcase pages, balance warm ivory with sea-glass green, sage, and restrained gold so the page feels relaxed but not beige-only.
- Typography: Korean product and price text should not sit below 14px on primary cards; section titles should scale strongly on desktop.
- Spacing/layout rhythm: default public web content width is up to 1440px with 20px mobile and 32px desktop side padding.
- Shape/radius/elevation: preserve existing rounded image-card language; travel pages may use softer large radii and fewer hard divider lines, but do not nest cards inside cards.
- Motion: keep subtle carousel and hover motion; avoid motion that blocks scanning.
- Imagery/iconography: use real destination/product imagery first; avoid generic AI-style emoji icons, especially in primary travel product modules.

## Components
- Existing components to reuse: `SectionContainer`, `SectionHeading`, `GlobeSection`, `ProductShowcase`, `FeaturedTourCarousel`, `PopularDestinationsCarousel`, `SiteHeader`.
- New/changed components: public home containers and cards may use the 1440px wide layout contract.
- Variants and states: admin-driven curation sections should inherit the same wide/readable default unless explicitly full-bleed.
- Token/component ownership: section width belongs in shared home containers or existing section wrappers, not in data fetch or admin code.

## Accessibility
- Target standard: practical WCAG AA readability and touch target improvements.
- Keyboard/focus behavior: preserve existing link/button semantics.
- Contrast/readability: product names, prices, and navigation labels should remain high contrast.
- Screen-reader semantics: keep native links and buttons for navigation and carousel controls.
- Reduced motion and sensory considerations: avoid adding new aggressive animation.

## Responsive behavior
- Supported breakpoints/devices: mobile, tablet, desktop, wide desktop.
- Layout adaptations: mobile keeps horizontal carousels; desktop expands containers and card sizes.
- Touch/hover differences: mobile controls should remain large enough to tap; desktop hover can add subtle affordance.

## Interaction states
- Loading: preserve existing server-rendered and fallback behavior.
- Empty: use existing empty/preparing messages.
- Error: avoid visual changes that affect API/admin data handling.
- Success: consultation/contact CTAs remain obvious.
- Disabled: disabled carousel or form controls should remain visually distinct.
- Offline/slow network, if applicable: image fallbacks should still leave usable product titles and prices.

## Content voice
- Tone: concise, confident, consultation-friendly Korean.
- Terminology: use destination, golf tour, product, consultation consistently.
- Microcopy rules: CTA labels should be action-oriented and readable without explanation.

## Implementation constraints
- Framework/styling system: Next.js 16, React 19, Tailwind CSS 4.
- Design-token constraints: use existing CSS variables and Tailwind utility patterns.
- Performance constraints: do not add dependencies or client work for simple layout changes.
- Compatibility constraints: public web is connected to admin-managed Prisma data, so layout changes should not alter schemas, queries, or API contracts.
- Test/screenshot expectations: run typecheck/lint/build or the smallest available validation after changes; use browser screenshots for visual signoff when a local server is available.

## Open questions
- [ ] Confirm whether the client wants this denser/wider treatment only on the home page or across all public routes.
- [ ] Confirm whether the 3D globe should remain first in the home hierarchy or move below a full image hero.
