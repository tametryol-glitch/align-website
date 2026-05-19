import { NODE_ASPECT_PLANET_THEMES } from './aspectMeanings';
import { houseMeaning } from './houses';
import { NODE_AXIS_MEANINGS } from './nodeMeanings';
import { SIGN_TRAITS } from './signs';
import type { ContractStatus, NormalizedChart, SoulContract } from './types';

const CONTRACT_TYPES = [
  'The Lover',
  'The Rival',
  'The Teacher',
  'The Betrayer',
  'The Protector',
  'The Mirror Soul',
  'The Parent',
  'The Student',
  'The Spiritual Guide',
];

function contractName(seed: number): string {
  const names = ['Aven', 'Seren', 'Marek', 'Ilya', 'Cassia', 'Rovan', 'Elian', 'Nara', 'Voss', 'Amara'];
  return names[Math.abs(seed) % names.length];
}

export function createSoulContracts(chart: NormalizedChart, failedContract?: SoulContract): SoulContract[] {
  if (failedContract && failedContract.status !== 'healed') {
    return [{
      ...failedContract,
      currentRole: failedContract.nextLifetimeReturn,
      status: 'open',
      temptation: `${failedContract.temptation} This time it arrives with less warning.`,
    }];
  }

  const south = chart.placements['South Node'];
  const north = chart.placements['North Node'];
  const juno = chart.placements.Juno;
  const venus = chart.placements.Venus;
  const axis = NODE_AXIS_MEANINGS[south.sign];
  const strongestAspect = chart.nodeAspects[0];
  const aspectTheme = strongestAspect ? NODE_ASPECT_PLANET_THEMES[strongestAspect.planet] : null;
  const house = houseMeaning(juno.house || venus.house);
  const roleIndex = (juno.house + venus.house + north.house) % CONTRACT_TYPES.length;
  const contractType = strongestAspect?.planet === 'Venus' || strongestAspect?.planet === 'Juno'
    ? 'The Lover'
    : CONTRACT_TYPES[roleIndex];

  return [{
    id: `contract-${south.sign.toLowerCase()}-${juno.house}`,
    contractType,
    recurringSoulName: contractName(juno.house + venus.house + south.house),
    currentRole: contractType,
    emotionalWound: `This soul touches ${house.wound}, then pulls on the old ${south.sign} pattern.`,
    lesson: `Learn ${axis.purposeDoor.toLowerCase()}`,
    temptation: `Use the old gift to control the bond: ${axis.comfortVerbs[0]}.`,
    purposeChoice: `Complete the vow by choosing ${axis.purposeVerbs[0]} even when the body wants ${axis.comfortVerbs[0]}.`,
    failedOutcome: `The contract returns as ${CONTRACT_TYPES[(roleIndex + 3) % CONTRACT_TYPES.length]} in a harder lifetime.`,
    healedOutcome: `The contract unlocks ${aspectTheme?.reward || SIGN_TRAITS[north.sign].giftTone}.`,
    nextLifetimeReturn: CONTRACT_TYPES[(roleIndex + 2) % CONTRACT_TYPES.length],
    status: 'open',
  }];
}

export function resolveContractStatus(current: ContractStatus, path: string, relationshipScore: number): ContractStatus {
  if (path === 'purpose' && relationshipScore >= 18) return 'healed';
  if (path === 'shadow' && relationshipScore <= -12) return 'failed';
  if (path === 'comfort' && current !== 'healed') return 'strained';
  if (relationshipScore >= 30) return 'healed';
  if (relationshipScore <= -28) return 'failed';
  return current;
}

export function contractReviewLine(contract: SoulContract): string {
  if (contract.status === 'healed') return `${contract.recurringSoulName}, ${contract.currentRole}, was met without repeating the oldest vow. ${contract.healedOutcome}`;
  if (contract.status === 'failed') return `${contract.recurringSoulName}, ${contract.currentRole}, left the lifetime unfinished. ${contract.failedOutcome}`;
  if (contract.status === 'strained') return `${contract.recurringSoulName}, ${contract.currentRole}, remains bound to the soul. The bond softened, but the pattern was not completed.`;
  return `${contract.recurringSoulName}, ${contract.currentRole}, is still waiting inside the next choice.`;
}
