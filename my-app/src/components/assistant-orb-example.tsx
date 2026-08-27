'use client';
import { useState } from 'react';
import type { OrbState } from '@/registry/lib/orb-state';
import { useAudioLevel } from '@/registry/lib/use-audio-level';
import { OrbStatus } from '@/registry/lib/orb-status';
import { ParticlesOrb } from '@/registry/orbe/particles-orb/particles-orb';

export const AssistantOrb = () => {
  const [state, setState] = useState<OrbState>('idle');
  const { levelRef } = useAudioLevel(state === 'listening');

  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
      <ParticlesOrb state={state} levelRef={levelRef} />
      <OrbStatus state={state} />
    </div>
  );
};
