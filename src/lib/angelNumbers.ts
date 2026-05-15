// Comprehensive Angel Number database — web port of align-app/src/services/angelNumbers.ts

export interface AngelNumberMeaning {
  number: string;
  title: string;
  meaning: string;
  love: string;
  career: string;
  spiritual: string;
  /** Optional synthesized guidance line used by the share card. */
  guidance?: string;
}

const ANGEL_DATABASE: Record<string, AngelNumberMeaning> = {
  '0': { number: '0', title: 'Infinite Potential', meaning: 'Wholeness, eternity, and the blank-slate at the start of a cycle. Zero is the open loop — no script yet. What you bring to it becomes what it is.', love: 'A bond returns to its starting point. Either a genuine fresh start or a full-circle moment with an old energy. Watch what tries to begin again.', career: 'A blank-canvas hour. Every direction reads as possible because none has claimed the space yet. Sit with the quiet before filling it.', spiritual: 'Stillness is doing real work today. Five silent minutes outperforms an hour of striving while this number is around.' },
  '1': { number: '1', title: 'New Beginnings', meaning: 'Creation, independence, and the first move. One is the signal that the opening action is yours to make.', love: 'A new chapter in love is cracking open. If single, a new face. If partnered, a new flavor of the same bond.', career: 'Take the first step. Start the project, make the pitch, send the email. The initiative is what gets amplified today.', spiritual: 'Your thoughts are landing on fertile ground right now — quick return, higher fidelity than usual. Think on purpose.' },
  '2': { number: '2', title: 'Balance & Trust', meaning: 'Partnership, patience, and background-timing. Two says the work is happening off-camera. Your only job is to keep faith with what you already set in motion.', love: 'Partnership energy runs high. Give and receive in equal measure. If you\'ve been waiting on someone, the gap is closing.', career: 'Collaboration beats solo today. The right person or team doubles your output — look for the match, not the win.', spiritual: 'Your intuition is sharp and quiet. The true signal today is inside, not on the feed.' },
  '3': { number: '3', title: 'Creative Expression', meaning: 'Creativity, joy, and the pulse of self-expression. Three is a nudge to use the voice, the hand, the color, the music.', love: 'Say what you feel out loud. Play, flirt, laugh more than usual. Feeling beats analyzing today.', career: 'Your creative ideas have weight right now. Share one, pitch one, build one. The medium rewards the maker this week.', spiritual: 'Support from teachers, mentors, and unseen guides is closer than it has been. Ask a question and watch for the answer in the next 48 hours.' },
  '4': { number: '4', title: 'Foundation & Protection', meaning: 'Stability, patient work, and quiet protection. Four is the signal to build — slow, solid, and without shortcuts.', love: 'Stability in love is available. Small consistent acts outweigh grand gestures in the four-cycle.', career: 'Put in the reps. What gets built now lasts — and the structure matters more than the flourish. No shortcuts on the foundation.', spiritual: 'The protective current is strong around you. If anxiety is loud, treat that as the signal to release it rather than feed it.' },
  '5': { number: '5', title: 'Major Change', meaning: 'Transformation, freedom, and motion. Five is the cycle\'s rearrangement — what was stuck moves, sometimes whether or not you approved it.', love: 'Your love life is shifting under you. Disruptive on the surface, accurate underneath — what emerges will fit better than what leaves.', career: 'Change is coming to your work. A pivot, an offer, an exit, a leap. Follow what excites you even when it scares you.', spiritual: 'A version of you is being retired. The discomfort is the cost of growth — pay it and keep moving.' },
  '6': { number: '6', title: 'Harmony & Nurturing', meaning: 'Home, family, responsibility, and the long current of care. Six asks for attention to the people, rooms, and routines that hold you.', love: 'Domestic rhythm takes priority. If there\'s been tension at home, the repair is available today. Lead with softness.', career: 'Service-oriented work gets highlighted. How your work helps the people around you is where the fulfillment lives this cycle.', spiritual: 'Balance the practical and the spiritual — they\'re not competing for your attention, they\'re asking for the same kind of it.' },
  '7': { number: '7', title: 'Spiritual Awakening', meaning: 'Inner wisdom, introspection, and a quiet run of luck. Seven is the universe\'s nod: you\'re on the right path, keep walking.', love: 'Go deeper, not wider. One person who truly sees you outweighs a dozen who almost do.', career: 'Follow your gut over the spreadsheet today. The unconventional angle is the accurate one. The data catches up later.', spiritual: 'Big growth phase in quiet form. Journal, read, sit with. The answers are already in you — seven is asking you to listen for them.' },
  '8': { number: '8', title: 'Abundance & Power', meaning: 'Abundance, authority, and the closing of loops. Eight is a balance sheet being settled — what you invested is returning.', love: 'Power dynamics are rebalancing. Step into your worth. The love that matches your energy shows up when you stop accepting less.', career: 'Money and recognition tilt toward you. Harvest season. Accept without apology — you already paid for this.', spiritual: 'What you put out is coming back fast. Keep intentions clean and actions aligned — eight keeps records.' },
  '9': { number: '9', title: 'Completion & Release', meaning: 'Endings, service, and the mature close of a cycle. Nine marks the point where a chapter ends on purpose, not by accident.', love: 'If a relationship has run its course, release it cleanly. If love is deepening, you\'ve reached the grown-up phase — the one built on real understanding.', career: 'A project, role, or era is wrapping. Honor what it taught and get the next chapter ready.', spiritual: 'A soul cycle is graduating. What you learned here wants to become what you teach next.' },
  '00': { number: '00', title: 'Amplified Infinity', meaning: 'Double zero doubles the blank slate. Total openness with the universe — the only limit in play today is the shape of your own intention.', love: 'Love in pure potential. Release specific expectations and let the universe write a better casting than the one on your list.', career: 'A wholly new chapter is available. You are not bound by what you have done before — the record resets.', spiritual: 'You\'re in the hush between one thing ending and the next beginning. This is sacred negative space. Don\'t rush to fill it.' },
  '11': { number: '11', title: 'Spiritual Gateway', meaning: 'Master Number 11 is the doorway to higher awareness. Your thoughts are imprinting at unusual speed — choose them like you mean them.', love: 'A soul-level connection is present or on approach. Less ordinary attraction, more the kind of magnetism that feels inevitable.', career: 'Inspirational work is calling. Teaching, creating, leading — the purpose is bigger than the paycheck in the eleven-cycle.', spiritual: 'Your sensitivity is the instrument, not the problem. The eleven chose the people who can feel things before they arrive.' },
  '22': { number: '22', title: 'Master Builder', meaning: 'Master Number 22 is vision plus architecture. You can turn large dreams into concrete structures — the 22 is where the blueprint meets the foundation.', love: 'You\'re laying the floor of a partnership meant to last. Think in years, not weeks. The first bricks decide everything.', career: 'You can build something significant. Think bigger than feels responsible — then double it. The 22 carries what the 11 only glimpses.', spiritual: 'Your purpose has a real-world form. Legacy is the keyword — the spiritual expresses itself through what you put into the world.' },
  '33': { number: '33', title: 'Master Teacher', meaning: 'Master Number 33 carries the 11\'s vision and the 22\'s architecture, aimed outward as service. Teacher, healer, example.', love: 'Your love is quietly restorative. People change simply by being close to you. Don\'t underestimate presence.', career: 'Teaching, healing, counseling, creating — work that feeds the world feeds you back. Anything transactional runs dry in the 33.', spiritual: 'A high-frequency assignment. The responsibility rides on the privilege — the 33 doesn\'t get handed out lightly.' },
  '44': { number: '44', title: 'Angelic Foundation', meaning: 'A strong, protective support is being built around you. Double 4 is the quiet-but-solid number — unshowy, steady, unshakeable.', love: 'Your close bonds are being reinforced at a structural level. Whatever survives this period is built to keep standing.', career: 'A serious stability is forming in your work. The effort is compounding into something permanent — the foundation is catching up with the vision.', spiritual: 'Bigger support than usual is available. Ask for it explicitly — the help waits on the invitation.' },
  '55': { number: '55', title: 'Rapid Transformation', meaning: 'Fast, multi-front change. Double 5 means the rearrangement is already underway — arguing with it only extends it.', love: 'Your love life is about to look different. What leaves was leaving. What arrives matches who you are becoming, not who you were.', career: 'A career pivot or large opportunity is surfacing. Sudden on the outside, long-prepared on the inside.', spiritual: 'A version of you is being cleared out at speed. Old beliefs, habits, and self-images are the material being composted.' },
  '66': { number: '66', title: 'Nurturing Harmony', meaning: 'Home, family, and your inner world need focused attention. Double 6 is the rebalance call — the external has been outpacing the internal.', love: 'Emotional closeness takes priority over everything else in this window. The deepest repair work happens behind closed doors.', career: 'Work-life balance stops being optional and starts being urgent. Rest increases productivity inside this cycle — the math reverses.', spiritual: 'Tend the relationships with home, family, and the lineage behind you. Old family weather is asking to be felt through rather than avoided.' },
  '77': { number: '77', title: 'Divine Confirmation', meaning: 'You\'re where you\'re supposed to be. Double 7 is confirmation in number form — your choices, your instincts, your direction are accurate.', love: 'The relationship you\'ve been questioning — your heart already has the answer your mind keeps debating. Trust the earlier, quieter vote.', career: 'You\'re on the right track. Less second-guessing, more throttle.', spiritual: 'Synchronicities multiply under 77 — the repeated name, the song at the right moment, the coincidence that isn\'t. Write them down.' },
  '88': { number: '88', title: 'Infinite Abundance', meaning: 'A wide current of prosperity is running in your direction — financial, emotional, social. Double 8 asks you to receive without shrinking.', love: 'Love flows in surplus, not scarcity. Stop rationing warmth. There\'s enough in the room.', career: 'A financial opening is close — a raise, a deal, a windfall, a promotion. The current is locked onto you; keep hands open.', spiritual: 'Returns on old generosity are landing. Everything you\'ve given is finding its way back on its own schedule.' },
  '99': { number: '99', title: 'Sacred Completion', meaning: 'A major chapter is finishing. Double 9 is the ceremonial close — an ending that needs marking, not minimizing.', love: 'Forgiveness is the key — toward someone else or toward yourself. The weight you\'ve been carrying was never your debt.', career: 'A role, project, or era is ending. Let it end well; the next chapter rides on the closing.', spiritual: 'A long assignment is complete. The lessons stuck. Graduation, not failure.' },
  '111': { number: '111', title: 'Manifestation Portal', meaning: 'Triple 1 is the short-latency manifestation signal. Thoughts return as reality faster than usual — which means watching what you feed your mind matters more today than yesterday.', love: 'A new love, or a reset inside an existing one, is forming. Set the intention clearly — specificity is what the signal needs.', career: 'The business idea, the creative project, the bold move — the window is open. Step through it before it narrows.', spiritual: 'You\'re shaping reality in real time. Guard the interior conversation — it\'s the pen doing the writing.' },
  '222': { number: '222', title: 'Divine Alignment', meaning: 'Things are lining up — quietly, behind the scenes. Triple 2 is the patience signal. The timing isn\'t wrong; you\'re just not at the finish line yet.', love: 'Balance is being restored in your love life. If it\'s felt off, it\'s recalibrating. Stop pushing and let the re-sync complete.', career: 'Movement on the deal, the promotion, or the opportunity is happening out of sight. Don\'t force the visible — force the preparation.', spiritual: 'Your higher self, your guides, and the current moment are synchronized. Stay in your heart and the rhythm holds.' },
  '333': { number: '333', title: 'Ascended Master Support', meaning: 'Triple 3 signals that high-caliber spiritual support is nearby — teachers and guides who have walked this road before. You\'re not navigating alone.', love: 'Speak your feelings without hedging. The guides are encouraging vulnerability; the connection needs the real thing from you.', career: 'Your creative gifts carry unusual backing right now. Create, share, teach, inspire. The world can hear you at this frequency.', spiritual: 'Insights are arriving faster than usual. Journal the downloads — the record becomes the map later.' },
  '444': { number: '444', title: 'Angelic Protection', meaning: 'Triple 4 signals close protection around you. If fear has been loud, the number is asking you to notice the opposite: the support is closer than the worry.', love: 'Close relationships are being sorted. The right people are staying, the wrong ones are being gently drawn away. Trust the sort.', career: 'The work is being seen by the right eyes. The foundation under you is holding. Continuity is the reward in the 444.', spiritual: 'The angels want a conversation. Literally talk to them. The help waits on the ask.' },
  '555': { number: '555', title: 'Life-Changing Transformation', meaning: 'Triple 5 is an unmistakable change signal. Big, loud, multi-channel. Gripping the old version of things only lengthens the ride.', love: 'Your love life is transforming completely. Chaos on the surface, direction underneath — what emerges will be more honest than what leaves.', career: 'A major change is either happening or asking to. The 555 says the leap is safe. Jump.', spiritual: 'A rebirth is underway. The old identity is dissolving; don\'t mistake the dissolve for disaster.' },
  '666': { number: '666', title: 'Realign Your Focus', meaning: 'Despite its reputation, the triple 6 isn\'t a warning about evil — it\'s a rebalance call. Too much weight has moved to worry, money, or material detail. The correction is to return to the heart.', love: 'Stop overthinking love and start feeling it. Your head has taken over the job your heart was supposed to do.', career: 'You\'re overworking or over-worrying about money. The abundance you\'re after doesn\'t answer anxiety — it answers alignment. Step back.', spiritual: 'Ground yourself. Drift into the material world is the diagnosis; five quiet minutes is the first half of the prescription.' },
  '777': { number: '777', title: 'Divine Luck & Miracles', meaning: 'Triple 7 is the deeply fortunate frequency. Miracles tilt from possible to probable. Your job is gratitude, not effort.', love: 'A meaningful love encounter is near. Force is the wrong tool here — the 777 arranges what effort cannot.', career: 'Lucky timing, right-place-right-time moments, doors opening without introduction. Say yes quickly when they appear.', spiritual: 'A full awakening is clicking into place. What you\'ve been studying or sensing is consolidating into knowing.' },
  '888': { number: '888', title: 'Unlimited Abundance', meaning: 'Triple 8 is a prosperity signal with very wide bandwidth. Financial, emotional, social — whichever channel is open in your life, the current arrives through it.', love: 'Love abundance is overflowing. Your magnetism is high — the love you send out is returning at a multiplier.', career: 'A financial breakthrough is close. Raise, deal, windfall, promotion. The energy of prosperity is locked onto you.', spiritual: 'Quiet returns are landing. The ledger keeps itself; your old generosity is finding its way back.' },
  '999': { number: '999', title: 'Completion & New Dawn', meaning: 'A large cycle of your life is ending. Triple 9 marks the ceremonial close — the sacred pause before the next one opens.', love: 'A relationship or pattern has reached its natural end. Let it go with grace; what\'s next is built on wisdom, not the same wounds.', career: 'A career chapter is closing — by choice or by circumstance. The ending is part of the plan. The next chapter uses what this one taught.', spiritual: 'A soul contract is completing. The lessons stuck. The karma is resolved. You\'re free to start again.' },
  '000': { number: '000', title: 'The God Source', meaning: 'Triple 0 is the rare signal of direct contact with source. You\'re not separate from whatever you call the infinite — the number is a reminder of that, not a promise of it.', love: 'Love in its purest form is available. Drop the conditions, the expectations, the armor. What remains is the real signal.', career: 'Start fresh without baggage. If constraints didn\'t exist, what would you build? The 000 is asking you that question for a reason.', spiritual: 'Direct line to source. This is the highest frequency available in number form. Everything else, for a moment, is background noise.' },
  '1010': { number: '1010', title: 'Spiritual Awakening', meaning: 'A significant awakening is in progress. The 1-and-0 interlace means new beginnings emerging from pure potential — creation still in draft form.', love: 'A spiritually significant relationship is forming or deepening. This one has purpose beyond the ordinary arc.', career: 'A divinely timed idea is trying to land through you. Notice the flash of insight — it\'s the delivery method.', spiritual: 'Third-eye activity runs high. Vivid dreams, coincidences, knowing things ahead of their arrival — all within expected range this week.' },
  '1111': { number: '1111', title: 'The Awakening Code', meaning: 'The most recognized angel number. When 1111 appears, the message is: wake up, pay attention. A manifestation portal is wide open — thoughts, words, and beliefs land with unusual fidelity.', love: 'A karmic or twin-flame connection is activating. The person on your mind right now — there\'s a reason they won\'t leave it.', career: 'Make a wish, literally. The career goal, the dream project, the vision you\'ve been holding — plant it now. The soil is ready.', spiritual: 'You\'re waking up to who you actually are. The old frame is glitching because you\'re starting to see around it.' },
  '1212': { number: '1212', title: 'Trust Your Path', meaning: 'You\'re on the right path and the call is to keep going — with faith and a little more optimism than feels natural. The 1s and 2s interlace action with divine timing.', love: 'Your love life is aligning with what\'s actually good for you. Keep believing in what you deserve — the frame is accurate.', career: 'Stay on the goals. Progress is slower than your pulse wants, but the arrangement behind the scenes is correct.', spiritual: 'You\'re exactly where you\'re meant to be on the path. The unfolding is trustworthy.' },
  '1234': { number: '1234', title: 'Steps Are Aligning', meaning: 'Step-by-step guidance toward your purpose. The ascending sequence means things are landing in the right order — skipping ahead shortchanges the next rung.', love: 'Your relationship is progressing naturally. Each stage is building the next. Let the pace be the pace.', career: 'Career progress is happening in a clean, sequential order. Keep climbing — each step is earned.', spiritual: 'Your spiritual growth is sequential. Every lesson sets up the next. The curriculum is doing its job.' },
};

export function lookupAngelNumber(input: string): AngelNumberMeaning | null {
  const cleaned = input.replace(/[^0-9]/g, '');
  if (!cleaned) return null;

  // Direct match
  if (ANGEL_DATABASE[cleaned]) return ANGEL_DATABASE[cleaned];

  // Check if it is a repeating pattern of one digit (e.g., 1111 -> 1111 or 111)
  const unique = Array.from(new Set(cleaned.split('')));
  if (unique.length === 1 && cleaned.length >= 2) {
    for (let len = cleaned.length; len >= 2; len--) {
      const key = unique[0].repeat(len);
      if (ANGEL_DATABASE[key]) return ANGEL_DATABASE[key];
    }
    if (ANGEL_DATABASE[unique[0]]) return ANGEL_DATABASE[unique[0]];
  }

  // For mixed numbers, break into component meanings and combine them
  const components: AngelNumberMeaning[] = [];
  let remaining = cleaned;

  while (remaining.length > 0) {
    let matched = false;
    for (let len = Math.min(remaining.length, 4); len >= 1; len--) {
      const sub = remaining.substring(0, len);
      if (ANGEL_DATABASE[sub]) {
        components.push(ANGEL_DATABASE[sub]);
        remaining = remaining.substring(len);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (ANGEL_DATABASE[remaining[0]]) {
        components.push(ANGEL_DATABASE[remaining[0]]);
      }
      remaining = remaining.substring(1);
    }
  }

  if (components.length === 0) {
    let sum = cleaned.split('').reduce((s, d) => s + parseInt(d), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = String(sum).split('').reduce((s, d) => s + parseInt(d), 0);
    }
    if (ANGEL_DATABASE[String(sum)]) return ANGEL_DATABASE[String(sum)];
    return null;
  }

  if (components.length === 1) return components[0];

  // Combine multiple component meanings into a single blended reading
  const titles = components.map(c => c.title);
  const combined: AngelNumberMeaning = {
    number: cleaned,
    title: titles.join(' + '),
    meaning: `You typed ${cleaned}, and this number carries a layered message. It combines the energy of ${components.map(c => `${c.number} (${c.title})`).join(' and ')}.\n\n` +
      components.map(c => `**The ${c.number} energy:** ${c.meaning}`).join('\n\n'),
    love: components.map(c => `**${c.number}:** ${c.love}`).join('\n\n'),
    career: components.map(c => `**${c.number}:** ${c.career}`).join('\n\n'),
    spiritual: components.map(c => `**${c.number}:** ${c.spiritual}`).join('\n\n'),
  };

  return combined;
}

export function getAllAngelNumbers(): AngelNumberMeaning[] {
  return Object.values(ANGEL_DATABASE).sort((a, b) => {
    const na = parseInt(a.number);
    const nb = parseInt(b.number);
    return na - nb;
  });
}
