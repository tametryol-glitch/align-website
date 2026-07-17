// Progressed chart interpretations — what each progressed planet means.
// Different from natal: progressed positions show EVOLUTION and CURRENT THEMES.
//
// The composed reading must never sound like natal text. Natal says "this is
// who you are"; progressed says "this is who you have become — watch it
// happening in real time." It uses its own sign/house tables
// (PROGRESSED_SIGN_NOW / PROGRESSED_HOUSE_NOW) plus the hidden sub-sign
// undercurrent for the progressed degree (never named in user-facing text).

import { PLANET_LEADS, PROGRESSED_SIGN_NOW, PROGRESSED_HOUSE_NOW, DUAD_TEXTURE, MATRIX_SIGNATURE } from './hiddenLayers';
import { calculateDuad, calculateCompendium, calculateMatrix } from '@/lib/engines/duadCompendium';

const PROGRESSED_CONTEXT: Record<string, string> = {
  Sun: 'You are not the same person you were ten years ago — and this is the proof. This is the slow, quiet revolution happening at the core of who you are. The things that used to define you don\'t fit anymore, and the person you\'re becoming hasn\'t fully arrived yet. You\'re in between. And that in-between place? That\'s where all the real growth happens. Pay attention to what\'s pulling you forward right now.',
  Moon: 'There\'s a reason your emotional world feels different than it did a few years ago. Everything you need to feel safe, held, and alive has shifted. The cravings you can\'t explain, the tears that come out of nowhere, the sudden hunger for something you never wanted before — this is your inner world reshaping itself in real time. Every couple of years it asks you to feel in a completely new way. Right now, this is what your soul is hungry for.',
  Mercury: 'The way you think has quietly, profoundly changed — and you may not have even noticed. The mind you\'re using today is not the mind you were born with. The way you argue, the things you notice, the books that call to you, the words that come out when you\'re not filtering — all of it has evolved. You\'re not thinking the way you used to. And that\'s not confusion. That\'s growth.',
  Venus: 'What you love has changed. Who you\'re attracted to, what you find beautiful, what you\'re willing to give and what you refuse to settle for — none of it is the same as it was. Your heart\'s requirements have been quietly rewritten. If the relationships that once satisfied you now feel hollow, or if you\'re suddenly drawn to a completely different kind of person or pleasure — this is why. Your heart has outgrown its old shape.',
  Mars: 'The way you fight, the way you chase, the way you burn — it\'s all different now. The fire inside you has changed form. Maybe you used to swallow your anger and now it comes out clean and direct. Maybe you used to charge in and now you wait, choosing your battles with terrifying precision. Your ambition, your desire, your survival instincts — they\'ve all been quietly forged into something new. This is who you are when you want something now.',
  Jupiter: 'Your faith has been evolving so slowly you might not have felt it move. But it has. There\'s been a quiet, tectonic shift in what you believe is possible for your life. The things that once felt like wild dreams may now feel like certainties. Or the beliefs that once anchored you may have softened into something more honest, more yours. This is the slow widening of everything you thought you knew about how good life can be.',
  Saturn: 'This one moves almost imperceptibly — but even a few degrees of change here means something ancient in you has shifted. Your relationship with discipline, with authority, with the weight of responsibility — it\'s not what it was. Maybe rules that once felt like protection now feel like cages. Maybe the structure you resisted for years has quietly become your foundation. This part of you evolves the way mountains erode — and you feel it in your bones.',
  Ascendant: 'People see you differently now — and it\'s not your imagination. The entire energy you radiate when you walk into a room has shifted. The first impression you make, the way strangers read you, even the way your face holds emotion — it\'s all transformed. You might catch glimpses of it in old photos and think, "That doesn\'t even look like me anymore." It doesn\'t. Because the person the world sees has genuinely, quietly become someone new.',
  MC: 'The career that once felt like your calling may have stopped fitting — and this is exactly why. Your public identity, your professional hunger, the legacy you want to leave — all of it has been shifting beneath the surface. If you feel restless at work, if the success you achieved feels strangely empty, if you\'re haunted by a direction you haven\'t taken yet — the chapter has turned. The question isn\'t whether you\'ve changed. It\'s whether you\'re ready to let the world see it.',
};

export function getProgressedInterpretation(
  planetName: string,
  sign: string,
  house: number,
  natalSign?: string,
  changedSign?: boolean,
  degreeInSign?: number,
): string {
  const sections: string[] = [];

  // Evolution framing for this body
  const context = PROGRESSED_CONTEXT[planetName];
  if (context) {
    sections.push(context);
  } else {
    const lead = PLANET_LEADS[planetName];
    if (lead) {
      sections.push(`${lead} And that part of you has been quietly evolving — what follows is where it has arrived, not where it started.`);
    }
  }

  // Sign change alert — one of the most important signals in the whole chart
  if (changedSign && natalSign) {
    sections.push(
      `**Something fundamental has shifted — ${natalSign} → ${sign}:** Read this carefully. The version of you that operated through ${natalSign} — the way you thought, reacted, wanted, protected yourself — has completed its chapter. You probably already feel it. The things that used to work don\'t work anymore. The instincts you trusted have been replaced by new ones you\'re still learning to follow. This isn\'t a subtle shift. This is you becoming someone genuinely different — and the sooner you stop clinging to who you were, the sooner the new you can fully arrive.`
    );
  }

  // What they have evolved into (present-tense becoming, never natal voice)
  const now = PROGRESSED_SIGN_NOW[sign];
  if (now) sections.push(now);

  // Where it's playing out right now
  const houseNow = PROGRESSED_HOUSE_NOW[house];
  if (houseNow) sections.push(houseNow);

  // The fine print of this chapter — undercurrent + micro-tell at the exact
  // progressed degree. Deliberately shorter than the natal layer section so
  // the two readings stay structurally distinct.
  if (degreeInSign !== undefined && degreeInSign !== null && isFinite(degreeInSign)) {
    try {
      const duadSign = calculateDuad(sign, degreeInSign);
      const compSign = calculateCompendium(duadSign, degreeInSign);
      const matrixSign = calculateMatrix(compSign, degreeInSign);
      const fine: string[] = [];
      if (duadSign !== sign) {
        const texture = DUAD_TEXTURE[duadSign];
        if (texture) fine.push(`The fine print of this chapter — the part only you would recognize: underneath the change everyone can see, ${texture}`);
      }
      const signature = MATRIX_SIGNATURE[matrixSign];
      if (signature) fine.push(`${fine.length ? 'And the' : 'The'} newest tell, the one that gives the current you away — ${signature}`);
      if (fine.length) sections.push(fine.join(' '));
    } catch { /* layered content is optional */ }
  }

  return sections.join('\n\n');
}
