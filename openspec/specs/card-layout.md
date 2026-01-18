# Card Layout Specification

## Overview
Defines the layout and responsive behavior of denomination cards in the Euro Piggy Bank application.

## Card Structure
Each denomination card contains three main sections:
- **Left**: Denomination label (e.g., "1¢", "5€")
- **Middle**: Input controls with decrement button, number input, increment button
- **Right**: Total calculation showing currency amount

## Layout Implementation

### Container Layout
- **Outer container**: Flexbox with `flex-wrap` for responsive card arrangement
- **Card sizing**: `flex-1 min-w-[280px]` for natural wrapping with minimum usable width
- **Gap**: Consistent `gap-3` between cards
- **Responsive behavior**: Cards naturally wrap based on available screen width

### Internal Card Layout
- **Layout system**: Flexbox with `justify-between` for three-section alignment
- **Spacing**: Responsive gap `gap-1 sm:gap-2` (tighter on mobile)
- **Alignment**: Items centered vertically with `items-center`

### Section Details

#### Denomination Section (Left)
- **Alignment**: `justify-start` (left-aligned)
- **Typography**: `text-lg font-semibold`
- **Color**: Adaptive with dark theme support

#### Input Controls Section (Middle)
- **Alignment**: `justify-center` (centered)
- **Input width**: `w-16` (compact for mobile)
- **Button size**: `h-9 w-9` for touch-friendly targets
- **Borders**: Integrated button-input-button group with `border rounded-lg overflow-hidden`

#### Total Section (Right)
- **Alignment**: `items-end` (right-aligned)
- **Structure**: Vertical flex with label and amount
- **Typography**: `text-xs` for label, `text-sm font-semibold` for amount
- **Text wrapping**: `break-words text-right` for long amounts

## Responsive Behavior

### Mobile (< 640px)
- **Cards**: Single column layout (natural flex wrapping)
- **Internal spacing**: `gap-1` for compact layout
- **Touch targets**: Maintained at minimum 44px for accessibility

### Tablet and Desktop (≥ 640px)
- **Cards**: Multi-column layout with natural wrapping
- **Internal spacing**: `gap-2` for comfortable spacing
- **Card width**: Flexible based on available space

## Accessibility Considerations
- **Touch targets**: Minimum 44px for buttons and inputs
- **Color contrast**: Adaptive colors for light/dark themes
- **Text overflow**: `break-words` prevents content overflow
- **Semantic structure**: Clear visual hierarchy and labeling
- **Keyboard navigation**: Proper focus management for input controls

## Performance Considerations
- **CSS-only responsiveness**: No JavaScript for layout calculations
- **Minimal reflows**: Flexbox provides efficient layout calculations
- **Component isolation**: Each card is self-contained for optimal rendering

## Theme Support
- **Light theme**: White backgrounds with slate colors
- **Dark theme**: Slate-800 backgrounds with adaptive text colors
- **Transitions**: Smooth `transition-all duration-200` for hover states
- **Hover effects**: Subtle shadow enhancement on card hover

## Testing Requirements
- **Responsive testing**: Verify layout across mobile, tablet, desktop
- **Theme testing**: Ensure proper appearance in light/dark modes
- **Accessibility testing**: Validate touch targets and contrast ratios
- **Input testing**: Verify button-input integration and functionality
- **Text overflow testing**: Test with various currency amounts and languages
