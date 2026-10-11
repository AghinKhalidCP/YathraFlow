# YathraFlow Design System — Backwater Drift

**Source of Truth:** Google Stitch Project `projects/1523496347087223290` (*YathraFlow — Kerala Multimodal Journey Visualizer*)

---

## 1. Brand & Design Philosophy

The design system embodies a calm, precise, and utilitarian transit experience built for navigating multimodal journeys across Kerala—from state transport buses (KSRTC Swift/Ordinary) and Kochi water metros to commuter rail, auto-rickshaw transfers, and walking links.

- **Tone:** Methodical, unhurried, reassuring, and modern.
- **Personality:** Tactile clarity without visual noise. It honors both rapid decision-making under direct sunlight and evening route reviews.
- **Visual Style:** Minimalist structure combined with soft-depth surface elevation. It employs disciplined border contours, subtle ambient shadows, and purposeful chromatic signals to convey complex multi-leg transit data effortlessly.

---

## 2. Color Palette & Semantic Tokens

### Canvas & Surfaces
| Token | Light Value | Dark Value | Purpose |
|:---|:---|:---|:---|
| `surface` | `#F8FAFC` (Slate 50) | `#0B0F19` | Overarching viewport canvas |
| `surface-container-lowest` | `#FFFFFF` | `#131927` | Elevated journey cards, modal sheets |
| `surface-container-low` | `#EFF4FF` / `#F1F5F9` | `#1C2438` | Inset summary strips, secondary buttons |
| `surface-container` | `#E5EEFF` / `#E2E8F0` | `#242F49` | Tab switcher track, badge containers |
| `outline` | `#76777D` | `#64748B` | Subtle icons, inactive borders |
| `outline-variant` | `rgba(226, 232, 240, 0.8)` | `#232D43` | Card hairlines, separator rules |

### Transit & Semantic Accents
| Mode / Role | Hex Code | Background Wash | Description |
|:---|:---|:---|:---|
| **Primary (Brand / Focus)** | `#0F172A` / `#000000` | `#131B2E` | Action buttons, active indicators, titles |
| **Eco / Walking / Free** | `#006C4A` / `#059669` | `#ECFDF5` (`#82F5C1`) | Pedestrian legs, free transfers, low-emission links |
| **Rail / Kochi Metro** | `#4F46E5` / `#0284C7` | `#F0F9FF` (`#93CCFF`) | Trains, suburban rail, Kochi water metro |
| **KSRTC / Bus** | `#EA580C` / `#D97706` | `#FFF7ED` | KSRTC Swift / Fast Passenger / Stage Carriages |
| **Auto-Rickshaw Meter** | `#16A34A` | `#F0FDF4` | Kerala auto-rickshaw meter links |
| **Taxi / Shared Jeep** | `#2563EB` | `#EFF6FF` | Inter-city cabs, airport taxis, ghat jeeps |
| **Cautions / Estimates** | `#D97706` | `#FFFBEB` | Estimated fares, transfer cautions |
| **Alerts / Cancellations** | `#DC2626` | `#FEF2F2` | Disruptions, road blocks |

---

## 3. Typography Hierarchy

Primary headline family: **Plus Jakarta Sans**  
Data, body, and tabular numeral family: **Inter**

- **Headline XL** (`36px` / `44px`, Weight 700, Letter spacing `-0.025em`) — Landing & hero titles
- **Headline LG** (`28px` / `36px`, Weight 600, Letter spacing `-0.02em`) — Section headings
- **Headline MD** (`20px` / `28px`, Weight 600, Letter spacing `-0.015em`) — Journey destination pairs, dialog titles
- **Headline SM** (`16px` / `24px`, Weight 600, Letter spacing `-0.01em`) — Transit leg titles, fare amounts
- **Body LG** (`16px` / `26px`, Weight 400, Letter spacing `-0.005em`) — Primary descriptive guidance
- **Body MD** (`14px` / `22px`, Weight 400, Letter spacing `0em`) — Leg instructions, transit notes
- **Body SM** (`12px` / `18px`, Weight 400, Letter spacing `0em`) — Timestamps, station details
- **Label MD** (`12px` / `16px`, Weight 600, Letter spacing `0.02em`) — Filter buttons, mode badges
- **Label SM** (`10px` / `14px`, Weight 600, Letter spacing `0.04em`, Uppercase) — Status pills, waypoints

*Note: All departure/arrival times, fare figures, distance meters, and durations must use tabular numbers (`tabular-nums` / `font-feature-settings: 'tnum'`).*

---

## 4. Spacing & Shapes

- **Corner Radii:**
  - `rounded-2xl` (`16px` / `1rem`) — Master cards, dialogs, map frame, timeline container.
  - `rounded-xl` (`12px` / `0.75rem`) — Input fields, buttons, mode chips, inner metric tiles.
  - `rounded-full` (`9999px`) — Transit mode pills, marker badges, status indicators.
- **Elevation & Shadows:**
  - Low elevation: Hairline borders `border-slate-200/80` (dark: `border-slate-800/80`) paired with subtle ambient shadow `shadow-xs`.
  - Floating controls: Frosted backdrop (`backdrop-blur-md bg-white/85` or dark `bg-slate-900/85`) with `shadow-md`.

---

## 5. Map Experience & Vector Styling

- **Vector Map Provider**: OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`).
- **Dark Mode Style**: OpenFreeMap Dark / Positron Dark vector style with high-contrast road hierarchy.
- **Markers**:
  - `Origin (A)`: High-visibility emerald medallion with rotation pin.
  - `Destination (B)`: Deep slate / obsidian medallion with flag or dot indicator.
  - `Transfers (1, 2, ...)`: Numbered circular badges displaying the transition mode badge.
- **Route Lines**:
  - Selected leg: High-contrast stroke (`width: 5px`, `opacity: 1.0`, mode-themed color).
  - Unselected legs: Muted stroke (`width: 3.5px`, `opacity: 0.65`).
  - Walking legs: Distinct dash array (`dasharray: [2, 2]`).
- **Fallback State**: Clean user-friendly card if WebGL or network is unavailable, retaining full access to textual storyboard and turn-by-turn steps.
