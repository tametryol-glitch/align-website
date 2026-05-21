/**
 * npcSoulEngine — generates dynamic NPC souls that react to
 * the player's choices and form relationships across lifetimes.
 *
 * NPCs have their own soul type, relationship status, and dialogue
 * that shifts based on how the player treats them.
 */

import type { ChoicePath, SoulProfile } from './types';

export interface NPCSoul {
  id: string;
  name: string;
  archetype: string;
  relationship: 'ally' | 'rival' | 'mentor' | 'neutral' | 'betrayer';
  affinity: number; // -100 to 100
  dialogue: string[];
  /** The NPC's personality lean */
  preferredPath: ChoicePath;
}

/**
 * Generate NPC souls from the soul profile's contracts and story elements.
 */
export function generateNPCSouls(profile: SoulProfile): NPCSoul[] {
  const npcs: NPCSoul[] = [];

  // Contract soul — the main recurring relationship
  const contract = profile.soulContracts[0];
  npcs.push({
    id: 'npc-contract',
    name: contract.recurringSoulName,
    archetype: contract.currentRole,
    relationship: contract.status === 'healed' ? 'ally' : 'rival',
    affinity: contract.status === 'healed' ? 60 : -20,
    dialogue: [
      `We've danced this dance before, ${profile.avatarName}.`,
      `Do you remember what happened last time? I do.`,
      `The lesson between us is ${contract.lesson}. Neither of us can escape it.`,
    ],
    preferredPath: 'purpose',
  });

  // Shadow mentor — appears when shadow choices are high
  npcs.push({
    id: 'npc-shadow-mentor',
    name: 'The Veiled One',
    archetype: 'Shadow Mentor',
    relationship: 'mentor',
    affinity: 0,
    dialogue: [
      'The darkness you fear is just unprocessed light.',
      `Your scar, "${profile.soulScar.name}", speaks to me. I had one like it once.`,
      'Not all teachers are kind. Not all lessons are gentle.',
    ],
    preferredPath: 'shadow',
  });

  // Trickster — tests the player
  npcs.push({
    id: 'npc-trickster',
    name: 'Kairos the Trickster',
    archetype: 'Cosmic Trickster',
    relationship: 'neutral',
    affinity: 0,
    dialogue: [
      'Every choice is correct. Every choice is wrong. Isn\'t that fun?',
      `Your ${profile.coreGift}? I've seen better. But I've also seen worse.`,
      'What if the comfortable choice IS the brave one? Think about that.',
    ],
    preferredPath: 'risk',
  });

  return npcs;
}

/**
 * Update NPC affinity based on the player's choice path.
 */
export function updateNPCAffinity(
  npc: NPCSoul,
  chosenPath: ChoicePath,
): NPCSoul {
  let delta = 0;
  if (chosenPath === npc.preferredPath) {
    delta = 10;
  } else if (
    (npc.preferredPath === 'purpose' && chosenPath === 'shadow') ||
    (npc.preferredPath === 'shadow' && chosenPath === 'comfort')
  ) {
    delta = -10;
  }

  const newAffinity = Math.max(-100, Math.min(100, npc.affinity + delta));
  let newRelationship = npc.relationship;
  if (newAffinity >= 50) newRelationship = 'ally';
  else if (newAffinity <= -50) newRelationship = 'betrayer';
  else if (newAffinity >= 20) newRelationship = 'mentor';
  else if (newAffinity <= -20) newRelationship = 'rival';
  else newRelationship = 'neutral';

  return { ...npc, affinity: newAffinity, relationship: newRelationship };
}

/**
 * Get the most relevant NPC dialogue line based on current affinity.
 */
export function getNPCDialogue(npc: NPCSoul): string {
  if (npc.affinity > 30) return npc.dialogue[0];
  if (npc.affinity < -30) return npc.dialogue[2];
  return npc.dialogue[1];
}
