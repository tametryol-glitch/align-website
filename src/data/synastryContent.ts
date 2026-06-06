/* ──────────────────────────────────────────────────────────────
   Synastry Aspect Content
   35 pages: 7 planet pairs x 5 aspects.
   ────────────────────────────────────────────────────────────── */

export interface SynastryAspect {
  slug: string;
  planet1: string;
  planet2: string;
  aspect: string;
  aspectSymbol: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
  keywords: string[];
}

const ASPECT_DATA: Record<string, { symbol: string; nature: string }> = {
  conjunct: { symbol: '☌', nature: 'fusion' },
  sextile: { symbol: '⚹', nature: 'opportunity' },
  square: { symbol: '□', nature: 'tension' },
  trine: { symbol: '△', nature: 'harmony' },
  opposition: { symbol: '☍', nature: 'polarity' },
};

const SYNASTRY_CONTENT: Record<string, { intro: string; sections: { heading: string; body: string }[] }> = {
  // Sun-Moon
  'sun-conjunct-moon': {
    intro: 'When one person\'s Sun conjuncts another\'s Moon, the fundamental identities and emotional needs of both partners align in a profoundly harmonious way. The Sun person illuminates the Moon person\'s inner world, while the Moon person instinctively nurtures the Sun person\'s core identity. This is one of the strongest indicators of compatibility in synastry.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This conjunction creates an almost telepathic understanding between partners. The Sun person feels seen and appreciated for who they truly are, while the Moon person feels emotionally safe and supported. There is a natural rhythm to the relationship, a sense of coming home that transcends rational explanation. You understand each other\'s moods, motivations, and needs without requiring lengthy explanations. This aspect is a powerful indicator of marriage potential because it suggests that both partners can sustain each other through life\'s inevitable challenges.' },
      { heading: 'Gifts & Challenges', body: 'The gifts of this aspect include effortless emotional attunement, deep mutual respect, and a relationship that feels fated. The Sun person gives the Moon person confidence and direction, while the Moon person provides the Sun person with emotional grounding and a sense of belonging. The challenge lies in potential enmeshment: the Moon person may become too dependent on the Sun person for their sense of identity, while the Sun person may take the Moon person\'s emotional support for granted. Maintaining individual identities within such a close bond requires conscious effort.' },
      { heading: 'Long-Term Potential', body: 'For long-term partnership, this aspect is exceptionally favorable. It provides the emotional foundation upon which other, more challenging aspects can be managed. Even when the relationship faces external pressures or internal conflicts, this underlying sense of belonging keeps both partners committed to working through difficulties. The relationship tends to improve with time as both partners deepen their understanding of this fundamental connection.' },
    ],
  },
  'sun-sextile-moon': {
    intro: 'The Sun sextile Moon in synastry creates a gentle, supportive flow between one partner\'s identity and the other\'s emotional nature. This is a harmonious aspect that requires active engagement to reach its full potential.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile brings a pleasant ease to the relationship without the intensity of harder aspects. The Sun person and Moon person naturally support each other\'s goals and emotional needs, creating a partnership that feels both comfortable and growth-oriented. Communication flows naturally, and both partners feel encouraged to express themselves authentically. There is a gentle stimulation that keeps the relationship interesting without creating the kind of friction that leads to conflict.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include natural compatibility, mutual encouragement, and a relationship that grows through shared opportunities rather than shared crises. Both partners feel that the other enhances their life without demanding radical change. The challenge is that sextiles require active engagement; without conscious effort to nurture the connection, the ease of this aspect can become complacency. The relationship needs shared projects, mutual goals, or creative endeavors to keep the energy flowing and prevent it from settling into pleasant but unfulfilling routine.' },
    ],
  },
  'sun-square-moon': {
    intro: 'The Sun square Moon in synastry creates a dynamic tension between one partner\'s core identity and the other\'s emotional needs. This aspect generates friction that, while challenging, can also be the catalyst for profound growth.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square creates a fundamental mismatch between what the Sun person wants to express and what the Moon person needs to feel safe. The Sun person may feel that the Moon person is overly sensitive or emotionally demanding, while the Moon person may feel that the Sun person is insensitive to their emotional needs. Disagreements about lifestyle, family, and domestic life are common. Yet this very tension creates a compelling dynamic that keeps both partners engaged and growing, provided they are willing to do the work of understanding each other.' },
      { heading: 'Gifts & Challenges', body: 'The paradoxical gift of this aspect is motivation. Neither partner can rest in the comfortable illusion that they have figured out love, because the square constantly presents new challenges that demand emotional growth. The Moon person learns to develop emotional resilience, while the Sun person learns to consider the emotional impact of their actions. The primary challenge is that the friction can exhaust both partners if they do not develop effective communication skills and a willingness to compromise. When both partners commit to growth, this aspect can forge an extraordinarily strong bond.' },
    ],
  },
  'sun-trine-moon': {
    intro: 'The Sun trine Moon in synastry is one of the most naturally harmonious aspects in relationship astrology. The flow between one partner\'s identity and the other\'s emotions is effortless and deeply nourishing.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This trine creates an almost magical ease between partners. You understand each other instinctively, and the relationship feels like a natural extension of each person\'s best self. The Sun person\'s goals and identity are naturally supported by the Moon person\'s emotional nature, and the Moon person feels genuinely safe and appreciated by the Sun person. There is a warmth to this connection that persists even during difficult times, providing a reliable emotional anchor that sustains the relationship through challenges.' },
      { heading: 'Gifts & Challenges', body: 'The gifts are abundant: emotional harmony, mutual support, effortless communication, and a deep sense of belonging. This is a strong indicator of long-term compatibility because it suggests that both partners\' fundamental natures are aligned. The subtle challenge is that the very ease of this aspect can lead to taking the relationship for granted. Without conscious appreciation and continued investment, the natural harmony can flatten into routine. The best expression of this trine involves actively celebrating and nurturing the beautiful connection it provides, rather than assuming it will sustain itself without attention.' },
    ],
  },
  'sun-opposition-moon': {
    intro: 'The Sun opposite Moon in synastry creates a magnetic polarity between partners. You are drawn together by the very differences that also create your greatest challenges, each person embodying what the other needs to develop.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition creates an irresistible pull between partners who represent complementary energies. The Sun person embodies qualities the Moon person needs to develop, and vice versa. There is a powerful attraction based on this complementarity, a feeling that together you are complete in a way that neither of you can achieve alone. However, this also means that your fundamental approaches to life differ significantly, and bridging these differences requires maturity, communication, and a genuine willingness to learn from each other.' },
      { heading: 'Gifts & Challenges', body: 'The gift of this opposition is wholeness. When both partners embrace their differences as complementary rather than competitive, the relationship becomes a powerful vehicle for personal growth. Each person develops qualities they might never have accessed alone. The challenge is the constant awareness of difference: what initially fascinated you about your partner may eventually frustrate you. The Sun person may feel the Moon person is too emotional, while the Moon person may feel the Sun person is too self-focused. Success requires learning to appreciate what your partner brings rather than trying to make them more like you.' },
    ],
  },

  // Venus-Mars
  'venus-conjunct-mars': {
    intro: 'Venus conjunct Mars in synastry is one of the most powerful indicators of sexual and romantic attraction. The planet of love meets the planet of desire, creating a chemistry that is almost impossible to resist.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'The attraction between these two people is immediate, visceral, and electric. The Venus person embodies everything the Mars person desires, while the Mars person\'s assertive energy activates the Venus person\'s capacity for pleasure and love. The romantic and sexual chemistry is extraordinary, often described as love at first sight. Physical affection is a primary love language for this couple, and their intimate life tends to be passionate and fulfilling. Beyond the physical, there is a creative synergy that makes everything they do together feel more alive and beautiful.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include unparalleled romantic chemistry, creative inspiration, and a relationship that never loses its spark of physical attraction. The Venus person softens the Mars person\'s aggressive edges, while the Mars person energizes the Venus person\'s passive tendencies. The challenge is that such intense attraction can override judgment, leading to impulsive romantic decisions. If other aspects in the synastry are challenging, the powerful chemistry of this conjunction may keep partners in a relationship that does not serve their higher good. The key is ensuring that the connection includes emotional depth and shared values alongside its undeniable physical magnetism.' },
    ],
  },
  'venus-sextile-mars': {
    intro: 'Venus sextile Mars in synastry creates a pleasant, stimulating attraction that combines romantic interest with genuine friendship. The chemistry is real but not overwhelming, allowing both partners to build a balanced connection.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile brings a delightful balance of attraction and ease to the relationship. The Venus person and Mars person find each other appealing without the compulsive intensity of harder aspects. Flirtation flows naturally, dates feel effortless, and physical chemistry develops at a comfortable pace. Both partners feel stimulated and appreciated, and there is a natural give-and-take in romantic expressions. The Mars person takes initiative in ways that please the Venus person, while the Venus person responds with warmth and encouragement that motivates the Mars person.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include mutual attraction, romantic compatibility, and a creative synergy that enhances both partners\' lives. This is an excellent aspect for sustained partnership because it provides enough chemistry to maintain interest without the volatility of more intense aspects. The challenge, like all sextiles, is that it requires active engagement to realize its full potential. Without deliberate effort to keep romance alive, the pleasant attraction can settle into friendship that lacks romantic intensity. Regular date nights, creative projects, and physical affection keep this aspect vibrant.' },
    ],
  },
  'venus-square-mars': {
    intro: 'Venus square Mars in synastry creates an irresistible but turbulent attraction. The chemistry is explosive, the passion is undeniable, but the path to harmony requires navigating fundamental differences in how each person gives and receives love.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square generates a powerful sexual and romantic tension that is simultaneously exciting and frustrating. The Venus person may feel that the Mars person is too aggressive, too demanding, or too focused on physical expression. The Mars person may feel that the Venus person is too passive, too withholding, or too focused on emotional connection at the expense of physical desire. Yet both are drawn to each other with an intensity that defies rational objection. Arguments may be frequent but are often followed by passionate reconciliation.' },
      { heading: 'Gifts & Challenges', body: 'The gift is passion that never dies. This square ensures that the relationship never becomes boring, and the sexual chemistry remains electric throughout the partnership. Both partners are constantly stimulated by the other, and the tension itself can be channeled into creative collaboration and personal growth. The challenge is that the friction can become exhausting if not managed with maturity. The Venus person needs to communicate their needs clearly rather than expecting the Mars person to intuit them, while the Mars person needs to develop patience and sensitivity. When both partners learn to navigate this tension, the result is a relationship of extraordinary passion and depth.' },
    ],
  },
  'venus-trine-mars': {
    intro: 'Venus trine Mars in synastry is the gold standard for romantic and sexual compatibility. The planet of love flows effortlessly with the planet of desire, creating a relationship where attraction, affection, and passion are naturally balanced.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This trine creates a beautiful, natural flow between romantic love and physical desire. The Venus person feels genuinely desired and appreciated, while the Mars person feels that their advances are welcomed and reciprocated with warmth. Physical intimacy is deeply satisfying for both partners because each instinctively knows how to please the other. Beyond the bedroom, there is a creative harmony that makes shared activities, from cooking dinner to building a business, feel effortless and enjoyable.' },
      { heading: 'Gifts & Challenges', body: 'The gifts are extraordinary: natural sexual compatibility, romantic ease, mutual respect in matters of love and desire, and a creative synergy that enhances both partners\' lives. This aspect often indicates a relationship that brings genuine pleasure and satisfaction over the long term. The subtle challenge is complacency. Because the chemistry is so natural, both partners may stop investing effort in romance, assuming the attraction will sustain itself. The relationship flourishes most when both partners actively celebrate and nurture the natural harmony they share.' },
    ],
  },
  'venus-opposition-mars': {
    intro: 'Venus opposite Mars in synastry creates an intense magnetic polarity between the forces of love and desire. The attraction is powerful and undeniable, fueled by the tension between receptivity and pursuit.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition generates a classic dynamic of pursuit and attraction. The Mars person is intensely drawn to pursue the Venus person, who represents everything they desire. The Venus person is flattered and attracted by the Mars person\'s passionate pursuit, though they may sometimes feel overwhelmed by its intensity. The sexual chemistry is powerful, often leading to a rapid physical connection that both partners find deeply satisfying. There is a constant dance of push and pull that keeps the relationship electrically charged.' },
      { heading: 'Gifts & Challenges', body: 'The gift is a relationship where desire and love remain alive and active because the polarity between the two planets keeps both partners engaged. Neither can take the other for granted because the opposition maintains a productive tension that prevents complacency. The challenge is the same polarity that fuels attraction: the Mars person may become too aggressive in pursuit, while the Venus person may feel objectified or reduced to the role of prize. Balance comes when both partners learn to alternate between giving and receiving, pursuing and welcoming, and when they develop mutual respect alongside their mutual desire.' },
    ],
  },

  // Moon-Venus
  'moon-conjunct-venus': {
    intro: 'Moon conjunct Venus in synastry creates one of the sweetest connections in all of relationship astrology. Emotional security meets loving appreciation, producing a bond of tender, genuine affection.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This conjunction creates an instant sense of emotional comfort and aesthetic harmony. The Moon person feels deeply loved and emotionally nourished by the Venus person, whose warmth and affection provide exactly the kind of emotional environment the Moon person needs. The Venus person finds the Moon person endearing, instinctively protective feelings arising alongside genuine romantic interest. Together, they create a domestic and emotional atmosphere of beauty, warmth, and genuine care that feels like a sanctuary from the outside world.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include deep emotional affection, a shared love of beauty and comfort, and a relationship that feels nurturing and aesthetically pleasing. Both partners enjoy creating a beautiful home, sharing meals, and engaging in simple pleasures that deepen their bond. The challenge is that so much sweetness can lack the dynamic tension that drives growth. Without challenging aspects elsewhere in the synastry, the relationship may become so comfortable that both partners stop growing individually. Maintaining personal development alongside the beautiful comfort of this conjunction keeps the relationship vital.' },
    ],
  },
  'moon-sextile-venus': {
    intro: 'Moon sextile Venus in synastry creates a gentle, supportive emotional and romantic connection. Both partners feel appreciated and cared for, with a natural flow of affection that enriches the relationship.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile brings a pleasant harmony to emotional exchanges. The Moon person feels that the Venus person genuinely values and appreciates their emotional nature, while the Venus person is emotionally nourished by the Moon person\'s care and attention. The relationship has an easy, friendly quality alongside its romantic dimension, making both partners feel that they are with someone who is both lover and friend. Social activities, shared aesthetic interests, and domestic pleasures are natural bonding activities for this couple.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include emotional compatibility, mutual appreciation, and a relationship that enhances both partners\' sense of well-being. This is an excellent aspect for friendship that deepens into romance, as it provides both emotional comfort and romantic interest. The challenge is that the gentle nature of the sextile requires active nurturing. Without deliberate attention to maintaining romance and emotional connection, the relationship can slip into a comfortable but unremarkable friendship. Regular expressions of appreciation and romantic gestures keep this aspect alive.' },
    ],
  },
  'moon-square-venus': {
    intro: 'Moon square Venus in synastry creates tension between emotional needs and expressions of love. What one partner needs emotionally may conflict with how the other naturally expresses affection.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square generates a frustrating disconnect between how the Venus person shows love and what the Moon person needs to feel emotionally secure. The Venus person may express affection through social activities, aesthetics, and verbal appreciation, while the Moon person needs more private, emotionally intense demonstrations of care. Or the reverse: the Moon person\'s emotional intensity may overwhelm the Venus person\'s desire for pleasantness and ease. Both partners genuinely care for each other but struggle to express it in ways the other can receive.' },
      { heading: 'Gifts & Challenges', body: 'The gift is that this square motivates both partners to learn each other\'s emotional and romantic languages. Through the friction, both develop greater emotional intelligence and a deeper understanding of love\'s many expressions. The challenge is persistent feelings of not being loved or appreciated in the way you need, despite your partner\'s genuine efforts. Growth requires clear communication about needs, a willingness to adapt your love expression to your partner\'s requirements, and patience with each other\'s different emotional rhythms.' },
    ],
  },
  'moon-trine-venus': {
    intro: 'Moon trine Venus in synastry creates a beautiful, flowing connection between emotional needs and loving expression. This is one of the most naturally harmonious aspects for sustained romantic happiness.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'The emotional and romantic dimensions of this relationship are naturally aligned. The Moon person feels deeply loved and appreciated by the Venus person, whose expressions of affection seem perfectly calibrated to meet the Moon person\'s emotional needs. The Venus person finds the Moon person\'s emotional nature genuinely endearing and is naturally motivated to create a beautiful, loving atmosphere. Domestic life is harmonious, and both partners find deep satisfaction in simple shared pleasures: meals together, quiet evenings, and the daily rituals of domestic intimacy.' },
      { heading: 'Gifts & Challenges', body: 'The gifts are exceptional: emotional harmony, romantic fulfillment, and a shared aesthetic sense that makes both partners\' lives more beautiful. This aspect is a strong indicator of lasting romantic satisfaction because it ensures that both partners feel genuinely loved. The subtle challenge is identical to the trine between Sun and Moon: the risk of taking this beautiful connection for granted. Active appreciation, regular expressions of gratitude, and continued investment in the romantic dimension of the relationship ensure that this naturally harmonious aspect reaches its full, magnificent potential.' },
    ],
  },
  'moon-opposition-venus': {
    intro: 'Moon opposite Venus in synastry creates a compelling polarity between emotional depth and romantic expression. Partners are drawn together by their differences, each embodying qualities the other needs to integrate.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition creates a magnetic attraction based on complementary emotional and romantic styles. The Moon person is drawn to the Venus person\'s grace, charm, and social ease, qualities that balance their own emotional intensity. The Venus person is fascinated by the Moon person\'s emotional depth and authenticity, which provides a grounding counterpoint to their own tendency toward social pleasantness. Together, they create a relationship that is both emotionally deep and aesthetically beautiful, though maintaining this balance requires conscious effort from both partners.' },
      { heading: 'Gifts & Challenges', body: 'The gift is a relationship that combines emotional depth with romantic beauty. Each partner expands the other\'s experience of love: the Moon person learns that love can be light and beautiful, while the Venus person learns that love can be deep and transformative. The challenge is the fundamental difference in emotional styles: the Moon person may find the Venus person superficial, while the Venus person may find the Moon person\'s emotional intensity overwhelming. Success depends on appreciating each other\'s gifts rather than trying to change each other\'s fundamental nature.' },
    ],
  },

  // Sun-Venus
  'sun-conjunct-venus': {
    intro: 'Sun conjunct Venus in synastry creates a warm, affectionate bond where one partner\'s core identity is naturally aligned with the other\'s love nature. Admiration, appreciation, and genuine fondness define this connection.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'The Venus person is genuinely enchanted by the Sun person\'s identity and self-expression. The Sun person, in turn, feels deeply appreciated and valued by the Venus person\'s admiration. There is a natural mutual fan club dynamic: each partner sees the best in the other and reflects it back with warmth and sincerity. Social interactions as a couple tend to be pleasant, and others often comment on how well-matched you appear. The relationship has a golden quality, a sense that being together makes everything a little more beautiful and enjoyable.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include genuine mutual appreciation, social harmony, and a relationship that enhances both partners\' self-esteem and enjoyment of life. The Venus person inspires the Sun person to be their most charming and creative self, while the Sun person gives the Venus person a worthy object for their devotion and admiration. The challenge is potential superficiality: if the relationship rests entirely on mutual admiration without deeper emotional or psychological engagement, it may lack the resilience to survive genuine difficulties. Building emotional depth alongside the natural charm of this aspect creates a relationship that is both beautiful and strong.' },
    ],
  },
  'sun-sextile-venus': {
    intro: 'Sun sextile Venus in synastry brings a pleasant, stimulating warmth to the relationship. Both partners feel liked, appreciated, and socially compatible, with natural opportunities for romance and creative collaboration.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile creates an easy, enjoyable rapport between partners. The Sun person appreciates the Venus person\'s aesthetic sensibility and social grace, while the Venus person admires the Sun person\'s vitality and self-expression. The relationship benefits from shared interests in art, culture, entertainment, and social activities. There is a natural friendliness that makes spending time together genuinely pleasant, and both partners feel that the other enhances their social life and creative endeavors.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include social compatibility, mutual encouragement, and a relationship that is consistently enjoyable. This is an excellent foundation for both friendship and romance, providing enough attraction to spark interest and enough ease to sustain comfort. The challenge is that sextiles, while pleasant, do not generate the intensity that some people need to feel deeply engaged. Without harder aspects elsewhere in the synastry to provide depth, this aspect alone may produce a pleasant relationship that lacks transformative power. Actively deepening emotional intimacy beyond social pleasantries brings out the best of this aspect.' },
    ],
  },
  'sun-square-venus': {
    intro: 'Sun square Venus in synastry creates a compelling tension between one partner\'s identity and the other\'s values and love nature. The attraction is real but comes with fundamental differences in style and priorities.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square generates a frustrating yet compelling dynamic. The Sun person may feel that the Venus person is too focused on appearances, pleasure, or social harmony at the expense of deeper authenticity. The Venus person may feel that the Sun person is too self-focused, too intense, or insufficiently attentive to the relationship\'s aesthetic and social dimensions. Yet both are attracted to each other because each represents qualities the other needs to develop. The tension can manifest as disagreements about how to spend money, social priorities, or the balance between individual expression and relationship harmony.' },
      { heading: 'Gifts & Challenges', body: 'The gift is growth. This square pushes both partners to expand their understanding of love and self-expression. The Sun person learns to appreciate beauty, harmony, and the art of compromise, while the Venus person learns to value authenticity and courage alongside grace and diplomacy. The challenge is persistent friction over values and priorities that requires ongoing negotiation. When both partners approach these differences as opportunities for growth rather than sources of resentment, the relationship deepens into something far more substantial than either could achieve alone.' },
    ],
  },
  'sun-trine-venus': {
    intro: 'Sun trine Venus in synastry is a naturally beautiful aspect that creates warmth, mutual admiration, and an effortless flow of affection. The relationship feels blessed, and both partners bring out the best in each other.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This trine creates a golden ease between partners. The Sun person feels genuinely adored, and the Venus person feels that their love is naturally received and appreciated. There is a harmonious balance between the Sun person\'s self-expression and the Venus person\'s aesthetic and romantic nature, creating a relationship that feels both authentic and beautiful. Social interactions are pleasant, creative collaboration is effortless, and both partners feel enhanced by the other\'s presence. This is one of those aspects that makes others wonder what your secret is: the relationship just seems to work.' },
      { heading: 'Gifts & Challenges', body: 'The gifts are abundant: natural affection, mutual respect, creative synergy, and a relationship that genuinely improves both partners\' quality of life. This aspect is particularly favorable for partnerships that involve creative or aesthetic collaboration. The challenge, as with all trines, is the potential for complacency. The ease of the connection may lead both partners to invest less effort in maintaining romance and appreciation over time. Conscious gratitude and continued investment in the relationship\'s beauty keep this naturally harmonious aspect vibrant and alive.' },
    ],
  },
  'sun-opposition-venus': {
    intro: 'Sun opposite Venus in synastry creates a magnetic attraction based on the polarity between identity and love. Each partner is fascinated by what the other represents, creating a dynamic of admiration and desire across the axis of the chart.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition generates a powerful mutual fascination. The Sun person is drawn to the Venus person\'s beauty, charm, and grace, while the Venus person is captivated by the Sun person\'s vitality, confidence, and self-expression. There is a quality of mirroring in this aspect: each partner reflects back to the other qualities they admire but may not fully express in themselves. The initial attraction is strong, often immediate, and the relationship has a sense of fated significance that keeps both partners deeply engaged.' },
      { heading: 'Gifts & Challenges', body: 'The gift is a relationship of complementary strengths. Together, the Sun-Venus opposition creates a partnership that is both authentic and beautiful, combining the Sun person\'s courage and individuality with the Venus person\'s diplomacy and aesthetic sensibility. The challenge is the fundamental polarity itself: the Sun person may feel the Venus person is too accommodating or too focused on pleasing others, while the Venus person may feel the Sun person is too self-centered or too indifferent to the relationship\'s social and aesthetic dimensions. Balance comes through mutual respect and the recognition that both approaches to life have equal value.' },
    ],
  },

  // Mars-Saturn
  'mars-conjunct-saturn': {
    intro: 'Mars conjunct Saturn in synastry creates a complex, powerful dynamic between ambition and discipline. This aspect can be either deeply constructive or profoundly frustrating, depending on how both partners handle the tension between drive and restriction.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'The Saturn person acts as a restraining or structuring force on the Mars person\'s drive and ambition. This can manifest positively as the Saturn person helping the Mars person channel their energy productively, or negatively as the Saturn person blocking, criticizing, or suppressing the Mars person\'s initiative. The Mars person may feel limited or controlled, while the Saturn person may feel destabilized or threatened by the Mars person\'s raw energy. When this dynamic works well, it produces extraordinary practical achievement; when it does not, it creates deep resentment.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include the ability to accomplish significant things together, combining Mars energy with Saturn discipline to produce tangible, lasting results. This is an excellent aspect for business partnerships and professional collaborations where structured effort leads to concrete achievement. The challenges are significant: the Mars person may feel chronically frustrated, while the Saturn person may feel perpetually anxious about the Mars person\'s impulsiveness. Growth requires both partners to recognize the value of what the other brings. Mars needs Saturn\'s structure, and Saturn needs Mars\'s courage. When both acknowledge this, the partnership becomes a powerhouse of productive achievement.' },
    ],
  },
  'mars-sextile-saturn': {
    intro: 'Mars sextile Saturn in synastry creates a productive, supportive dynamic where drive and discipline work together harmoniously. Both partners help each other achieve their goals through a balanced combination of energy and structure.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile brings out the best of both planets. The Mars person feels supported by the Saturn person\'s wisdom and discipline, while the Saturn person is energized and motivated by the Mars person\'s initiative and courage. Together, you can accomplish practical goals that neither could achieve alone. There is a natural respect between you: the Mars person admires Saturn\'s patience and strategic thinking, while the Saturn person appreciates Mars\'s willingness to take action and push through obstacles.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include productive collaboration, mutual respect, and a relationship that helps both partners achieve their ambitions. This is an excellent aspect for couples who work together or share long-term goals that require sustained effort. The challenge is that the practical nature of this aspect may lack the romantic intensity that some partners crave. Ensuring that the relationship includes passion and play alongside its productive achievements keeps both partners emotionally fulfilled as well as practically successful.' },
    ],
  },
  'mars-square-saturn': {
    intro: 'Mars square Saturn in synastry is one of the most challenging aspects in relationship astrology. It creates a fundamental tension between freedom and restriction, action and caution, that can either forge exceptional strength or generate bitter resentment.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square creates a dynamic where the Saturn person feels compelled to control, limit, or correct the Mars person\'s actions, while the Mars person feels blocked, criticized, and frustrated. The Saturn person may come across as cold, judgmental, or excessively cautious, while the Mars person may appear reckless, aggressive, or disrespectful of boundaries. Power struggles are common, often centering on issues of control, timing, and the right way to do things. Beneath the friction, however, lies a profound potential for growth: Mars learns discipline, and Saturn learns courage.' },
      { heading: 'Gifts & Challenges', body: 'The paradoxical gift of this square is that it forces both partners to develop qualities they lack. The Mars person develops patience, strategy, and respect for structure, while the Saturn person develops assertiveness, spontaneity, and the courage to take risks. If both partners are committed to growth, this aspect can forge an exceptionally resilient partnership. The challenge is that the friction is real and persistent: both partners must be willing to endure discomfort in service of growth. Without this commitment, the relationship can become a battleground of will versus authority, where neither partner feels respected or free.' },
    ],
  },
  'mars-trine-saturn': {
    intro: 'Mars trine Saturn in synastry creates a powerful, naturally productive alignment between drive and discipline. Both partners help each other build things of lasting value with an ease that feels almost effortless.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This trine brings an effortless synergy between action and structure. The Mars person feels that the Saturn person\'s wisdom and discipline enhance rather than restrict their drive, while the Saturn person feels that the Mars person\'s energy and initiative bring their plans to life. There is a deep, practical respect between partners: each sees in the other qualities they genuinely admire. Together, you can build businesses, homes, careers, and legacies that stand the test of time.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include exceptional practical achievement, mutual respect, and a relationship that produces tangible results. This is one of the best aspects for couples who share long-term goals, particularly in career, finances, or property. The challenge is that the practical nature of this trine can overshadow the emotional and romantic dimensions of the relationship. Ensuring that you invest as much energy in your emotional connection as you do in your practical goals keeps the relationship balanced and fulfilling on every level.' },
    ],
  },
  'mars-opposition-saturn': {
    intro: 'Mars opposite Saturn in synastry creates a powerful polarity between the forces of assertion and restriction. This aspect demands that both partners learn to balance freedom with responsibility in their relationship.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition sets up a dynamic where the Mars person pushes forward while the Saturn person holds back, creating a tug-of-war that can be either productive or destructive. The Mars person may see the Saturn person as a barrier to their ambitions, while the Saturn person may see the Mars person as reckless and undisciplined. Yet both are drawn to each other because each represents qualities the other needs. The key is recognizing that the opposition is not a battle to be won but a balance to be achieved.' },
      { heading: 'Gifts & Challenges', body: 'The gift is the potential for balanced, sustainable achievement. When both partners find the middle ground between Mars\'s impulse and Saturn\'s caution, they can accomplish remarkable things with both energy and wisdom. The challenge is the persistent pull toward opposite extremes: every decision becomes a negotiation between action and restraint. Growth comes from developing genuine respect for each other\'s approach and learning that neither pure impulse nor pure caution leads to the best outcomes. The partnership thrives when both partners influence each other toward a wiser middle path.' },
    ],
  },

  // Moon-Pluto
  'moon-conjunct-pluto': {
    intro: 'Moon conjunct Pluto in synastry is one of the most emotionally intense aspects in relationship astrology. This conjunction creates a bond of extraordinary depth, transformative emotional intimacy, and, if not handled with care, obsessive attachment.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This conjunction creates an immediate, almost overwhelming emotional connection. The Moon person feels completely exposed to the Pluto person, as though their deepest emotional patterns and secret vulnerabilities are visible. The Pluto person is intensely drawn to the Moon person\'s emotional nature, feeling a compulsive need to merge with and perhaps transform the Moon person\'s inner world. The emotional bond is so deep that both partners may feel they have known each other across lifetimes. Nothing in this relationship is superficial; every interaction carries weight and meaning.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include emotional intimacy of extraordinary depth, the power to heal deep psychological wounds through the relationship, and a bond that transforms both partners at the soul level. This aspect often indicates a relationship that permanently changes who both people are. The challenges are equally intense: emotional manipulation, jealousy, possessiveness, and power struggles over emotional control can poison the very intimacy both partners crave. The Pluto person must resist the urge to dominate the Moon person\'s emotional life, while the Moon person must maintain their own emotional center rather than surrendering it to the Pluto person\'s intensity.' },
      { heading: 'Long-Term Potential', body: 'This aspect creates relationships that are impossible to forget, regardless of whether they last. When both partners approach the intensity with maturity and mutual respect, the result is a transformative bond that heals deep wounds and unlocks emotional capacities neither knew they possessed. When either partner uses the intensity for control rather than healing, the relationship can become psychologically damaging. The difference lies entirely in the level of emotional maturity both partners bring to this extraordinarily powerful connection.' },
    ],
  },
  'moon-sextile-pluto': {
    intro: 'Moon sextile Pluto in synastry creates a subtly powerful emotional connection that deepens over time. Emotional intimacy has a transformative quality without the overwhelming intensity of harder aspects.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile brings a gentle but real depth to emotional exchanges. The Moon person feels that the Pluto person understands their emotional nature at a level that goes beyond the surface, while the Pluto person finds the Moon person\'s emotional responses genuinely engaging and worth exploring. There is a natural flow of emotional honesty between you, and conversations tend to go deeper than either of you expected. The transformative potential is real but not forced, allowing both partners to grow emotionally at a comfortable pace.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include emotional depth, genuine psychological insight, and a relationship that helps both partners heal and grow without the turbulence of more intense aspects. This is an excellent foundation for therapeutic, healing relationships that transform both partners gently and naturally. The challenge is that the subtlety of the sextile means its power can be overlooked or underleveraged. Actively engaging with the emotional depth available through this aspect, through honest conversation, shared vulnerability, and willingness to explore psychological material together, unlocks its full transformative potential.' },
    ],
  },
  'moon-square-pluto': {
    intro: 'Moon square Pluto in synastry creates a volatile emotional dynamic charged with power, intensity, and the potential for both profound healing and psychological wounding. This is one of the most challenging aspects in synastry.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square generates an emotional intensity that is difficult to manage. The Pluto person may attempt to control, dominate, or transform the Moon person\'s emotional nature, triggering deep insecurity and defensive reactions. The Moon person feels emotionally exposed and vulnerable, oscillating between attraction to the Pluto person\'s depth and fear of their psychological power. Power struggles over emotional territory are common, with both partners alternating between intense closeness and defensive withdrawal. The attraction is magnetic but the dynamic can become psychologically exhausting.' },
      { heading: 'Gifts & Challenges', body: 'The brutal gift of this square is that it exposes both partners\' deepest emotional patterns, including the ones they would prefer to keep hidden. Through the intensity, both partners have the opportunity to confront and heal psychological wounds that have shaped their emotional lives since childhood. The challenge is that this healing process is neither gentle nor voluntary; the square forces emotional material to the surface whether or not either partner is ready to deal with it. Success requires both partners to seek professional support for the psychological material that arises, and to commit to using the intensity for healing rather than for power.' },
    ],
  },
  'moon-trine-pluto': {
    intro: 'Moon trine Pluto in synastry creates a deep, transformative emotional bond that flows with a natural ease. Emotional intimacy reaches profound depths without the power struggles of harder aspects.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This trine creates an emotional connection of remarkable depth that feels natural rather than forced. The Moon person feels safe opening their deepest emotional layers to the Pluto person, who receives them with genuine respect and transformative insight. The Pluto person is drawn to the Moon person\'s emotional authenticity and finds their vulnerability genuinely moving rather than something to be exploited. Together, you create an emotional sanctuary where both partners can explore the deepest dimensions of their inner lives without fear of judgment or manipulation.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include profound emotional intimacy, genuine psychological healing, and a bond that transforms both partners\' relationship with their own emotions. This is one of the most powerful aspects for sustained emotional depth in a long-term partnership. The challenge is the familiar trine risk of taking the depth for granted. Because the emotional intensity flows so naturally, both partners may stop actively engaging with the transformative potential of the connection. Regularly sharing your deepest feelings, continuing to explore new emotional territory together, and maintaining the courage to be vulnerable keep this aspect alive and evolving.' },
    ],
  },
  'moon-opposition-pluto': {
    intro: 'Moon opposite Pluto in synastry creates an intense emotional polarity that draws partners together with irresistible force. The connection is deeply transformative but requires careful navigation to avoid destructive power dynamics.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition creates a compelling, almost fated attraction between the emotional depth of the Moon and the transformative power of Pluto. The Moon person is drawn to the Pluto person\'s intensity and psychological depth, while the Pluto person is fascinated by the Moon person\'s emotional openness and vulnerability. There is a constant push-pull dynamic: the Moon person opens emotionally, triggering the Pluto person\'s desire for control; the Pluto person asserts emotional power, triggering the Moon person\'s instinct to withdraw. This dance of approach and retreat creates an emotional intensity that both partners find compelling despite its difficulties.' },
      { heading: 'Gifts & Challenges', body: 'The gift is the potential for complete emotional transformation through the relationship. Both partners are changed fundamentally by the depth of their connection, and the emotional material that surfaces through the opposition provides exactly the psychological content each person needs to heal. The challenge is that the intensity can overwhelm both partners, leading to cycles of emotional fusion and painful separation. The Pluto person must learn that emotional power is not the same as emotional intimacy, while the Moon person must develop enough emotional strength to remain centered in the face of Pluto\'s intensity. When both partners bring maturity and a genuine commitment to healing, this opposition produces a relationship of extraordinary emotional depth and transformative power.' },
    ],
  },

  // Venus-Pluto
  'venus-conjunct-pluto': {
    intro: 'Venus conjunct Pluto in synastry creates one of the most intensely magnetic attractions in all of astrology. Love becomes an all-consuming, transformative force that reaches into the deepest dimensions of both partners\' souls.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'The attraction between these two people is obsessive, transformative, and impossible to ignore. The Venus person is irresistibly drawn to the Pluto person\'s depth and psychological power, finding them magnetically attractive in ways that defy rational explanation. The Pluto person, in turn, is captivated by the Venus person\'s beauty and capacity for love, feeling a compulsive need to possess and transform this love into something even deeper. The relationship has a quality of destiny, as though both partners have been drawn together by forces beyond their conscious control.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include a love of extraordinary depth and intensity, a transformative intimacy that changes both partners permanently, and a passionate connection that never fades into mundane routine. The challenges are equally powerful: jealousy, possessiveness, obsessive attachment, and power struggles over love can transform what should be healing into something destructive. The Pluto person must resist the urge to control the Venus person\'s love nature, while the Venus person must maintain their own values and boundaries within the intensity of Pluto\'s transformative pull. When both partners approach this conjunction with maturity, the love they create is genuinely life-changing.' },
    ],
  },
  'venus-sextile-pluto': {
    intro: 'Venus sextile Pluto in synastry creates a subtly magnetic attraction that deepens over time. The connection carries transformative potential without the overwhelming intensity of harder Venus-Pluto aspects.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This sextile brings a pleasant depth to romantic and sexual interactions. The Venus person feels that the Pluto person adds a layer of meaning and intensity to their experience of love, while the Pluto person finds the Venus person\'s love nature genuinely healing and attractive. There is a natural flow of trust that allows both partners to explore deeper dimensions of intimacy at their own pace. The attraction is real and sustained, deepening gradually rather than overwhelming both partners from the start.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include deepening romantic and sexual intimacy, genuine emotional trust, and a relationship that becomes more meaningful over time. This is an excellent aspect for relationships that begin as friendship and gradually reveal their deeper romantic potential. The challenge is that the subtlety of the sextile means its transformative potential can be overlooked. Actively choosing to explore deeper levels of intimacy, both emotional and physical, unlocks the considerable power hidden within this gentle aspect.' },
    ],
  },
  'venus-square-pluto': {
    intro: 'Venus square Pluto in synastry creates an obsessive, volatile attraction that is as dangerous as it is compelling. The power of love and the love of power collide in a dynamic that can either transform or destroy.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This square generates an attraction that feels compulsive and inescapable. The Venus person may feel both irresistibly drawn to and profoundly unsettled by the Pluto person\'s intensity, while the Pluto person may use love as a vehicle for control, attempting to remake the Venus person according to their own vision. Jealousy, possessiveness, and financial power struggles are common manifestations. The sexual chemistry is often explosive, but the emotional dynamic can be exhausting as both partners cycle through periods of intense attachment and painful conflict.' },
      { heading: 'Gifts & Challenges', body: 'The gift is the potential for radical self-knowledge. This square forces both partners to confront their deepest patterns around love, power, and worthiness. Through the intensity, both can heal wounds they may not have known they carried. The challenges are severe: manipulation, emotional abuse, and destructive jealousy can emerge if either partner lacks the maturity to handle the intensity responsibly. This aspect demands psychological awareness and a commitment to growth that not all partnerships can sustain. When both partners are committed to conscious transformation, the relationship becomes a crucible for profound personal evolution.' },
    ],
  },
  'venus-trine-pluto': {
    intro: 'Venus trine Pluto in synastry creates a deep, naturally flowing connection between love and transformative power. Intimacy reaches profound depths with an ease that feels both natural and fated.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This trine brings depth and intensity to the romantic connection without the power struggles of harder aspects. The Venus person feels genuinely safe with the Pluto person, instinctively trusting that their intensity serves love rather than control. The Pluto person finds in the Venus person a love that is strong enough to match their depth, and they are naturally motivated to use their transformative power for healing rather than domination. The sexual connection is deeply satisfying, with both partners experiencing intimate encounters as genuinely transformative experiences.' },
      { heading: 'Gifts & Challenges', body: 'The gifts include profound romantic and sexual intimacy, a love that deepens rather than diminishes over time, and a relationship that transforms both partners in lasting, positive ways. This is one of the strongest aspects for sustained passionate love in a long-term commitment. The challenge, as always with trines, is the potential to take the depth for granted. Because the transformative energy flows so naturally, both partners may stop actively engaging with the profound potential this aspect offers. Continuing to explore new dimensions of intimacy, sharing your deepest truths, and maintaining the courage to be vulnerable keep this extraordinary connection alive and evolving.' },
    ],
  },
  'venus-opposition-pluto': {
    intro: 'Venus opposite Pluto in synastry creates an intense magnetic pull between the forces of love and transformation. The attraction is compulsive and the emotional stakes are extraordinarily high.',
    sections: [
      { heading: 'Relationship Dynamics', body: 'This opposition generates a powerful polarity between love and power. The Venus person represents beauty, harmony, and the desire for peaceful relationship, while the Pluto person represents depth, intensity, and the drive toward transformation. Both are irresistibly drawn to what the other embodies, creating a relationship of compelling emotional and sexual intensity. The push-pull dynamic keeps both partners engaged but can also create exhausting cycles of attraction and resistance, intimacy and withdrawal.' },
      { heading: 'Gifts & Challenges', body: 'The gift is the potential for a love that encompasses both beauty and depth, both pleasure and transformation. When both partners integrate the qualities the other represents, they create a relationship that is both genuinely beautiful and profoundly meaningful. The challenge is the intensity of the polarity itself: the Venus person may feel overwhelmed by the Pluto person\'s desire for emotional depth, while the Pluto person may feel that the Venus person\'s need for harmony prevents the relationship from reaching its transformative potential. Balance comes through mutual respect and the recognition that both lightness and depth are essential dimensions of love.' },
    ],
  },
};

/* ── Build all 35 aspects ────────────────────────────────────────── */

const PLANET_PAIRS = [
  { p1: 'Sun', p2: 'Moon' },
  { p1: 'Venus', p2: 'Mars' },
  { p1: 'Moon', p2: 'Venus' },
  { p1: 'Sun', p2: 'Venus' },
  { p1: 'Mars', p2: 'Saturn' },
  { p1: 'Moon', p2: 'Pluto' },
  { p1: 'Venus', p2: 'Pluto' },
];

const ASPECT_NAMES = ['conjunct', 'sextile', 'square', 'trine', 'opposition'] as const;

function buildAllAspects(): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];

  for (const pair of PLANET_PAIRS) {
    for (const aspect of ASPECT_NAMES) {
      const slug = `${pair.p1.toLowerCase()}-${aspect}-${pair.p2.toLowerCase()}`;
      const content = SYNASTRY_CONTENT[slug];
      if (!content) continue;

      const a = ASPECT_DATA[aspect];
      aspects.push({
        slug,
        planet1: pair.p1,
        planet2: pair.p2,
        aspect,
        aspectSymbol: a.symbol,
        title: `${pair.p1} ${aspect.charAt(0).toUpperCase() + aspect.slice(1)} ${pair.p2} in Synastry`,
        intro: content.intro,
        sections: content.sections,
        keywords: [
          `${pair.p1.toLowerCase()} ${aspect} ${pair.p2.toLowerCase()}`,
          `${pair.p1.toLowerCase()} ${pair.p2.toLowerCase()} synastry`,
          `${aspect} in synastry`,
          'synastry aspects',
          'relationship astrology',
          'compatibility',
          'natal chart compatibility',
          `${pair.p1.toLowerCase()} aspects`,
          `${pair.p2.toLowerCase()} aspects`,
        ],
      });
    }
  }

  return aspects;
}

export const ALL_SYNASTRY_ASPECTS = buildAllAspects();

export function getSynastryAspect(slug: string): SynastryAspect | undefined {
  return ALL_SYNASTRY_ASPECTS.find((a) => a.slug === slug);
}

export function getAllSynastrySlug(): string[] {
  return ALL_SYNASTRY_ASPECTS.map((a) => a.slug);
}

export function getAspectsForPair(p1: string, p2: string): SynastryAspect[] {
  return ALL_SYNASTRY_ASPECTS.filter(
    (a) =>
      (a.planet1 === p1 && a.planet2 === p2) ||
      (a.planet1 === p2 && a.planet2 === p1)
  );
}

export { PLANET_PAIRS, ASPECT_NAMES, ASPECT_DATA };
