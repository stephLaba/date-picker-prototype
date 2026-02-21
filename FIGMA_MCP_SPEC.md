# Figma MCP Design Specification (Source of Truth)

---

## Version persistence

**When you add a version, it is saved to `public/design-versions.json`** and survives every build/iteration.

- In dev: The Vite plugin writes to the file on save.
- The file is committed to the repo.
- Built apps load versions from this file.

---


**Figma URL:** https://www.figma.com/design/tnTJpOTU43Ik7KGqL9GkdD/Cursor-experiments?node-id=4801-644

This document preserves the original design spec from the Figma MCP response. **Do not deviate from this when making design changes.**

---

## Progress Bar Steps (exact order)

1. Select location  
2. Select reason  
3. Book appointment  
4. Pet details  
5. Create account  
6. **Payment info** (not "Checkout")

---

## Design Tokens (from Figma)

| Token | Value |
|-------|-------|
| Main/Primary | #205036 |
| Primary Green | #205036 |
| White | #FFFFFF |
| Bright Orange | #FF7F4D |
| Neutral/00 | #FFFFFF |
| Neutral/20 | #F9F9F9 |
| Neutral/40 | #E0E0E0 |
| Neutral/04 | #757575 |
| Cream - Secondary Colour | #F9F6EF |
| Primary/Subdued | #3D705F |
| Surface/tertiary | #fbe8d1 |
| Surface/contrast | #ffbe83 |
| Border/primary | #b5c5bc |
| Text/header-neutral | #06100b |
| Text/header-accent | #205036 |
| Text/subtext | #616161 |

---

## Typography

- **Basetica:** Medium (16px), Regular (14px), Bold (14px) — sans-serif, body/nav/buttons  
- **Tiempos Text:** Regular Italic — serif, "Book an appointment" title, progress steps

---

## Components (from MCP)

### Logo
- Two image groups (imgGroup, imgGroup1) — JUNO + VETERINARY
- Centered in nav

### Location Dropdown
- bg: white (neutrals/neutral-10)
- border: #b5c5bc
- rounded: 14px
- Contents: Mask group (avatar), "Summerhill" (Basetica Medium 16px), "Yonge St & Roxborough St" (Basetica Regular 14px #616161), CaretDown icon

### DateTile
- Default: border #b5c5bc, rounded 14px, 68×58px, Basetica Bold 18px (#205036), day label Basetica Regular 12px (#3d705f) uppercase
- Selected: bg #205036, text white

### Time Chip
- Default: bg #fbe8d1 (surface/tertiary), rounded 24px, Basetica Medium 14px (#205036)
- Active: bg #ffbe83 (surface/contrast), with checkmark icon

### Progress Bar
- Steps: Tiempos Text Regular Italic 14px
- Bar track: #fbe8d1 (surface/tertiary)
- Bar fill: #ff7f4d (orange) — Steps 1, 2, 3 segments

### Footer
- bg #f9f9f9, border-top #e0e0e0
- Next button: bg #205036, rounded 100px, Basetica Bold 14px white
- "Book appointment later": Basetica Bold 14px #205036

---

## Asset URLs (Figma API – may expire)

- Logo: imgGroup, imgGroup1
- Icons: imgIconBackButton, imgIconChevronLeft, imgIconNextDay, imgIconPreviousDayDisabled, imgCaretDown, imgIconSelected
- Hero: imgTreats11, imgJunoMarch2024ShayMarkowitz61, imgPexelsIvanBabydov77885962
- Location avatar: imgMaskGroup1
