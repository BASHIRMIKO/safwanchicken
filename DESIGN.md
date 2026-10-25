---
name: Crisp Ember
colors:
  surface: '#fdf9f3'
  surface-dim: '#dddad4'
  surface-bright: '#fdf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ed'
  surface-container: '#f1ede7'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e6e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#5a4138'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0ea'
  outline: '#8f7066'
  outline-variant: '#e3bfb2'
  surface-tint: '#a83900'
  primary: '#a43700'
  on-primary: '#ffffff'
  primary-container: '#cd4700'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59a'
  secondary: '#655c5a'
  on-secondary: '#ffffff'
  secondary-container: '#eaddd9'
  on-secondary-container: '#6a615e'
  tertiary: '#7b5500'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b6b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#ede0dc'
  secondary-fixed-dim: '#d0c4c0'
  on-secondary-fixed: '#201a18'
  on-secondary-fixed-variant: '#4d4542'
  tertiary-fixed: '#ffdeac'
  tertiary-fixed-dim: '#ffba38'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#fdf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e6e2dc'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
  headline-lg:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  headline-sm:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an appetizing, high-energy, fast-casual culinary presence optimized for mobile ordering and brand loyalty. Translating the user's wireframe into an elevated digital storefront, the interface pairs the punchy charisma of urban street food with the frictionless utility of premium quick-service dining apps. 

The aesthetic is Tactile Modern Fast-Casual: punchy typography, warm high-contrast palettes inspired by rotisserie flames and golden crispy seasoning, soft ambient depth, and pillowy 16px corner geometry. The interface evokes cravings, immediacy, warmth, and reliable speed, guiding the diner effortlessly from craveable dish carousels directly into the checkout and real-time delivery pipeline.

## Colors

The palette directly communicates flame-seared freshness, rich seasonings, and warm hospitality:

- **Primary (`#E65100`) & Flame Accent (`#FF6F00`)**: Core brand drivers. Used for critical conversion paths, primary CTAs, active tab indicators, and fiery spice badging.
- **Secondary (`#1A1412`)**: Deep charcoal black with an organic espresso undertone. Provides maximum contrast for punchy headlines, price anchors, and high-emphasis labels.
- **Tertiary (`#FFB300`)**: Warm golden honey/crisp yellow. Serves as a highlight tone for star ratings, loyalty counters, preparation milestones, and promotional tags.
- **Neutral Canvas (`#FFFBF5`) & Pure Card Surface (`#FFFFFF`)**: Soft buttermilk off-white backdrop layered against crisp white cards, preventing screen glare while preserving an inviting warmth.
- **Functional Herb Green (`#2E7D32`)**: Fresh parsley green deployed strictly for success notifications, fresh dietary markers, and live order confirmation milestones.
- **Subtle Surface Line (`#F3E9DF`)**: A gentle warm-tinted line for card outlines and subtle dividers without heavy visual friction.

## Typography

The type system blends energetic culinary editorial with razor-sharp mobile legibility:

- **Display & Headings (Epilogue)**: A geometric sans with distinctive contemporary character. Weight 800 and 700 create bold, mouth-watering dish titles and immediate brand recognition across promotional banners and category highlights.
- **Interface & Body (Plus Jakarta Sans)**: Friendly, geometric, and ultra-legible at small viewports. It handles modifiers, price tags, calorie counts, instructions, and interactive bottom navigation labels with clean clarity.
- **Numeric & Pricing Emphasis**: Price values utilize Plus Jakarta Sans weight 700 with tabular alignment to ensure quick scanning in cart sheets and menus.

## Layout & Spacing

Designed fundamentally for mobile web viewports with fluid expansion toward desktop/tablet:

- **Mobile Canvas**: A 4-column fluid grid governed by 16px (`1rem`) outer margins and 16px gutters. Compact vertical rhythm preserves high screen real estate for rich dish photography and speedy tap-to-order interactions.
- **Top Header Arrangement (Wireframe Translation)**: The top app bar organizes the circular brand badge (44x44px), a stacked greeting and store address selector in the center, and a quick-action contact/support button pinned right.
- **Showcase Area ("Foods In Display")**: Full-bleed horizontal scroll containers with edge peeking (16px inset offset) to indicate scrollability for featured combos and hot deals, transitioning to a 2-column card grid for the regular menu.
- **Bottom Navigation Dock**: A sticky 4-item bottom navigation dock (`Home`, `Menu`, `Track Order`, `Settings`) fixed to the bottom viewport with safe-area padding for handheld ergonomics.
- **Desktop/Tablet Breakpoints**: Max container width caps at 480px on desktop web for an authentic app-shell experience, or expands to 12 columns with side sheet drawers on large displays.

## Elevation & Depth

Visual hierarchy uses warm, sunlit physical layering to present food cards as tactile, appetising plates:

- **Layer 0 (Canvas)**: Background tint `#FFFBF5` ground plane.
- **Layer 1 (Surface Cards & Modifiers)**: `#FFFFFF` paired with an ultra-fine perimeter line `1px solid #F3E9DF` and a warm diffused shadow: `0 4px 14px -2px rgba(26, 20, 18, 0.06), 0 2px 6px -1px rgba(26, 20, 18, 0.03)`.
- **Layer 2 (Floating Action Items & Active Modals)**: Bottom checkout ribbons, filter pills, and bottom sheets use `0 12px 28px -4px rgba(26, 20, 18, 0.12), 0 4px 10px -2px rgba(26, 20, 18, 0.05)`.
- **Layer 3 (Persistent Bottom Navigation)**: Elevated with `0 -4px 20px rgba(26, 20, 18, 0.05)` and a frosted back-surface backdrop blur (`backdrop-filter: blur(12px)`) at 94% `#FFFFFF` opacity to gently anchor above scrolling food content.

## Shapes

The design uses a clean 16px corner radius (Rounded, Tier 2) across main containers to produce a friendly, modern culinary aesthetic:

- **Cards & Food Display Tiles**: `1rem` (16px) corner radius, smoothly curving card wrappers and hero promotional boxes.
- **Buttons & Pill Chips**: Full capsule roundness (`9999px`) for quick-selection categories, spice meters, and the bottom "Add to Bag" primary button.
- **Brand Logo Token**: Pinned top-left circle badge with `50%` radius (`rounded-full`), framed with a crisp flame-accent border.
- **Quantity Adjusters & Steppers**: `0.5rem` (8px) rounded rect counters for incremental cart adjustments.

## Components

### Top Application Bar & Header
- **Logo Badge**: 44x44px circular avatar with a flame orange rim `#E65100` housing the brand mark.
- **Welcome & Location Unit**: Centered title block featuring `label-sm` ("Welcome back, Diner!") paired with an interactive dropdown for current outlet address ("Downtown Branch • Delivery in 25m") with a tiny chevron indicator.
- **Contact Action**: 40x40px rounded icon button on the right containing phone/headset support, finished in subtle `#FFFBF5` with `#1A1412` iconography.

### Buttons & Quick Actions
- **Primary Action (Flame CTA)**: Solid `#E65100` gradient fill blending to `#FF6F00`, `#FFFFFF` typography (`label-lg`), pill-shaped (`9999px`), 48px height for thumb targets. Active feedback produces a subtle 0.98 scale transform.
- **Secondary / Ghost**: White surface with `1.5px solid #1A1412`, `#1A1412` text for secondary choices like "Customize" or "View Receipt".
- **Floating Cart Button**: Pinned bottom banner with item count indicator, dynamic total, and quick-swipe action.

### Category Chips
- Pill chips (`36px` height) in horizontal scroll track. Unselected: `#FFFFFF` fill with `1px solid #F3E9DF` border, text `#1A1412`. Selected: solid `#1A1412` fill, text `#FFFFFF`, with an optional mini-badge in `#FFB300`.

### Food Display Cards (Showcase & Grid)
- **Hero Showcase ("Foods In Display")**: Large prominent card with edge-to-edge imagery, top-right spice heat meter (1–3 pepper icons or flame pill), title in `headline-md`, concise description, price in `label-lg` with a quick `+` button in deep charcoal.
- **List / Compact Grid Tile**: 2-column card featuring top 4:3 ratio food photography, bold title, strike-through combo discounts, and an orange accent add button.

### Form Inputs & Selection
- **Input Fields**: 48px height, 12px radius, `#FFFFFF` fill, `#F3E9DF` border that transitions to `2px solid #E65100` on focus.
- **Spice & Modifier Radios**: Custom pill selector where chosen option lights up in warm `#FFFBF5` with a `#E65100` border and bold text.

### Bottom Navigation Bar
- Fixed 4-tab bar (`Home`, `Menu`, `Track Order`, `Settings`). 64px height + bottom safe area.
- Inactive tabs: `#766E6B` muted icons and labels in `label-sm`.
- Active tab: `#E65100` icon and label, crowned with an amber micro-indicator dot (4px).

### Live Order Tracker Card
- Segmented progress bar with four milestone nodes: *Confirmed*, *In the Kitchen*, *Out for Delivery*, *Delivered*. Active segments pulsate with herb green (`#2E7D32`) and warm golden amber (`#FFB300`).