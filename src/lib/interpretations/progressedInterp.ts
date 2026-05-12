// Progressed chart interpretations — what each progressed planet means
// Different from natal: progressed positions show EVOLUTION and CURRENT THEMES

import { PLANET_MEANINGS, SIGN_IN_CHART, HOUSE_IN_CHART } from './placementInterp';

const PROGRESSED_CONTEXT: Record<string, string> = {
  Sun: 'You are not the same person you were ten years ago — and your progressed Sun is the proof. This is the slow, quiet revolution happening at the core of who you are. The things that used to define you don\'t fit anymore, and the person you\'re becoming hasn\'t fully arrived yet. You\'re in between. And that in-between place? That\'s where all the real growth happens. Pay attention to what\'s pulling you forward right now — that\'s your progressed Sun calling.',
  Moon: 'There\'s a reason your emotional world feels different than it did a few years ago. Your progressed Moon has shifted, and with it, everything you need to feel safe, held, and alive. The cravings you can\'t explain, the tears that come out of nowhere, the sudden hunger for something you never wanted before — this is your progressed Moon reshaping your inner world. Every two and a half years, it asks you to feel in a completely new way. Right now, this is what your soul is hungry for.',
  Mercury: 'The way you think has quietly, profoundly changed — and you may not have even noticed. Your progressed Mercury reveals that the mind you\'re using today is not the mind you were born with. The way you argue, the things you notice, the books that call to you, the words that come out when you\'re not filtering — all of it has evolved. You\'re not thinking the way you used to. And that\'s not confusion. That\'s growth.',
  Venus: 'What you love has changed. Who you\'re attracted to, what you find beautiful, what you\'re willing to give and what you refuse to settle for — none of it is the same as it was. Your progressed Venus has been quietly rewriting your heart\'s requirements. If the relationships that once satisfied you now feel hollow, or if you\'re suddenly drawn to a completely different kind of person or pleasure — this is why. Your heart has outgrown its old shape.',
  Mars: 'The way you fight, the way you chase, the way you burn — it\'s all different now. Your progressed Mars shows that the fire inside you has changed form. Maybe you used to swallow your anger and now it comes out clean and direct. Maybe you used to charge in and now you wait, choosing your battles with terrifying precision. Your ambition, your desire, your survival instincts — they\'ve all been quietly forged into something new. This is who you are when you want something now.',
  Jupiter: 'Your faith has been evolving so slowly you might not have felt it move. But it has. Your progressed Jupiter reveals a quiet, tectonic shift in what you believe is possible for your life. The things that once felt like wild dreams may now feel like certainties. Or the beliefs that once anchored you may have softened into something more honest, more yours. This is not dramatic — it is the slow widening of everything you thought you knew about how good life can be.',
  Saturn: 'This one moves almost imperceptibly — but when progressed Saturn shifts even a few degrees, it means something ancient in you has changed. Your relationship with discipline, with authority, with the weight of responsibility — it\'s not what it was. Maybe rules that once felt like protection now feel like cages. Maybe the structure you resisted for years has quietly become your foundation. Saturn doesn\'t evolve loudly. It evolves the way mountains erode — and you feel it in your bones.',
  Ascendant: 'People see you differently now — and it\'s not your imagination. Your progressed Ascendant has shifted, and with it, the entire energy you radiate when you walk into a room. The first impression you make, the way strangers read you, even the way your face holds emotion — it\'s all transformed. You might catch glimpses of it in old photos and think, "That doesn\'t even look like me anymore." It doesn\'t. Because the person the world sees has genuinely, quietly become someone new.',
  MC: 'The career that once felt like your calling may have stopped fitting — and your progressed Midheaven knows exactly why. Your public identity, your professional hunger, the legacy you want to leave — all of it has been shifting beneath the surface. If you feel restless at work, if the success you achieved feels strangely empty, if you\'re haunted by a direction you haven\'t taken yet — this is your progressed MC telling you the chapter has turned. The question isn\'t whether you\'ve changed. It\'s whether you\'re ready to let the world see it.',
};

export function getProgressedInterpretation(
  planetName: string,
  sign: string,
  house: number,
  natalSign?: string,
  changedSign?: boolean,
): string {
  const baseMeaning = PLANET_MEANINGS[planetName];
  const signMeaning = SIGN_IN_CHART[sign];
  const houseMeaning = HOUSE_IN_CHART[house];
  const progressedContext = PROGRESSED_CONTEXT[planetName];

  if (!baseMeaning && !progressedContext) return '';

  const dp = planetName;
  const ds = sign;
  const dh = `${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house`;

  let interp = '';

  // Progressed-specific context
  if (progressedContext) {
    const label = `Progressed ${planetName}`;
    interp += `**Your ${label}** — ${progressedContext}\n\n`;
  } else {
    interp += `**What ${dp} represents:** ${baseMeaning}\n\n`;
  }

  // Sign change alert
  if (changedSign && natalSign) {
    const changeText = `**Something fundamental has shifted — ${natalSign} → ${sign}:** Read this carefully, because this is one of the most important things in your entire chart. Your ${planetName} has left ${natalSign} behind and crossed into ${sign}. That means the version of you that operated through ${natalSign} — the way you thought, reacted, wanted, protected yourself — that version has completed its chapter. You probably already feel it. The things that used to work don\'t work anymore. The instincts you trusted have been replaced by new ones you\'re still learning to follow. This isn\'t a subtle shift. This is you becoming someone genuinely different — and the sooner you stop clinging to who you were in ${natalSign}, the sooner the ${sign} in you can fully come alive.`;
    interp += `${changeText}\n\n`;
  }

  // Current sign meaning
  if (signMeaning) {
    interp += `**Right now, you\'re living through ${ds}** — and here\'s what that means for you: ${signMeaning}\n\n`;
  }

  // House meaning
  if (houseMeaning) {
    interp += `**This is playing out in your ${dh}** — the part of your life where you feel it most: ${houseMeaning}`;
  }

  return interp;
}
