# Vet Clinic Calendar — Date Picker Prototype

A responsive vet clinic appointment calendar built with Vite, React, Tailwind CSS, and shadcn/ui.

## Features

- **Week-at-a-time view** — Browse appointments one week at a time
- **Day cycling** — Navigate between weeks with prev/next buttons
- **Date picker** — Jump to any date via calendar popover
- **Appointment slot selection** — Click available slots (9am–5pm, 30-min intervals)
- **Responsive layout** — Desktop grid, tablet/mobile scroll

## Design Reference

[Figma — Cursor-experiments, node 4801-644](https://www.figma.com/design/tnTJpOTU43Ik7KGqL9GkdD/Cursor-experiments?node-id=4801-644&m=dev)

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui (Button, Calendar, Popover, Card)
- date-fns

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── DatePickerTrigger.tsx
│   ├── WeekView.tsx
│   └── AppointmentSlot.tsx
├── lib/
│   ├── utils.ts
│   └── mockSlots.ts
└── App.tsx
```
