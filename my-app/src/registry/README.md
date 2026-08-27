# Particles Orb — integration notes

## File layout
```
src/
  registry/
    lib/
      orb-state.ts
      use-orb-level.ts
      use-audio-level.ts
      use-in-view.ts
      use-webgl-support.ts
      use-audio-bands.ts
      use-waveform.ts
      use-orb-cues.ts
      orb-status.tsx
    orbe/
      particles-orb/
        particles-orb.tsx
  components/
    assistant.tsx            # requested playground config, drop-in
    assistant-orb-example.tsx # lifecycle-driven wiring example
```

If your project has no `src/` directory, move `registry/` to the project
root and update the `@/registry/...` import aliases (or your `tsconfig.json`
`paths`) accordingly.

## No extra dependencies
Everything here uses only React + browser APIs (Canvas 2D, Web Audio,
IntersectionObserver). Nothing to `npm install`.

## Props
- `state`: `'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'`,
  plus optional extensions `'error' | 'disabled'`
- `size`: px
- `speed`: multiplier
- `colorFrom`, `colorTo`: hex colors for the gradient
- `levelRef`: `RefObject<number>`, 0..1 live audio amplitude. A negative
  value means "no live audio," and the orb falls back to a procedural
  animation driven by `state`.
- `label`: accessible label for the orb's `role="img"`
- `className`

## Theming via CSS
The orb sets `--orb-level`, `--orb-bass`, `--orb-mid`, `--orb-treble` on its
host element, and reads `--orb-size`, `--orb-speed`, `--orb-color-from`,
`--orb-color-to` — so it can also be themed or driven from plain CSS.

## Minimal wiring
```tsx
'use client';
import { useState } from 'react';
import type { OrbState } from '@/registry/lib/orb-state';
import { useAudioLevel } from '@/registry/lib/use-audio-level';
import { ParticlesOrb } from '@/registry/orbe/particles-orb/particles-orb';

export const AssistantOrb = () => {
  const [state, setState] = useState<OrbState>('idle');
  const { levelRef } = useAudioLevel(state === 'listening');
  return <ParticlesOrb state={state} levelRef={levelRef} />;
};
```
Drive `state` from your assistant lifecycle, and swap the `levelRef`
source: mic input (`useAudioLevel`) while `listening`, TTS output level
while `speaking`.

## Accessibility
Render `<OrbStatus state={state} />` (from `lib/orb-status.tsx`) near the
orb — it's a polite `aria-live` region announcing state changes to screen
readers. Never rely on color alone for the `error` state; `OrbStatus`
gives you the required visible text cue.

`prefers-reduced-motion: reduce` is respected: the orb renders a single
static frame instead of animating.

## Current playground configuration
`src/components/assistant.tsx` renders exactly the requested config:
```tsx
<ParticlesOrb
  state="connecting"
  size={168}
  speed={1}
  colorFrom="#005bff"
  colorTo="#3f5efb"
/>
```
