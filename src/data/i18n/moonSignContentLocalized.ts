/* ──────────────────────────────────────────────────────────────
   Localized Moon-sign content (SEO pilot: es / pt / fr)
   Machine-translated from the English source in moonSignContent.ts,
   merged with the shared section icons. English keys preserved.
   Generated — edit the source translations rather than this file by hand.
   ────────────────────────────────────────────────────────────── */

import type { ZodiacSign } from '@/data/moonSignContent';
import type { SeoLocale } from './seoLocale';

export interface LocalizedMoonSign {
  headline: string;
  intro: string;
  sections: { title: string; icon: string; paragraphs: string[] }[];
}

const CONTENT: Record<SeoLocale, Record<ZodiacSign, LocalizedMoonSign>> = {
  "es": {
    "aries": {
      "headline": "Luna en Aries: El corazón indómito",
      "intro": "Con tu Luna en Aries, tu mundo emocional es un horno de pasión, inmediatez y honestidad pura. Lo sientes todo a máximo volumen y lo expresas con la misma rapidez. Tus reacciones emocionales son veloces, ardientes y sorprendentemente transparentes: lo que sientes, todos lo saben.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🔥",
          "paragraphs": [
            "La Luna en Aries procesa las emociones a través de la acción. Cuando sientes algo profundamente, tu instinto no es quedarte sentada con ello, sino hacer algo al respecto. La tristeza se convierte en determinación. El enojo se convierte en combustible. La alegría se convierte en aventura espontánea. Metabolizas los sentimientos a la velocidad del rayo, lo que significa que rara vez guardas rencor: estallas con calor y te enfrías con la misma prontitud.",
            "Tu mundo interior es inquieto y pionero. Necesitas estímulo emocional del mismo modo en que otros necesitan seguridad emocional. El estancamiento es tu peor pesadilla, y floreces cuando tu vida emocional se siente dinámica y en constante avance. Los paisajes emocionales rutinarios te aburren profundamente.",
            "Hay una pureza casi infantil en tu forma de expresar las emociones. Dices lo que sientes sin filtros, y esperas que los demás hagan lo mismo. El comportamiento pasivo-agresivo genuinamente te desconcierta, porque no puedes imaginar elegir ocultar lo que sientes cuando expresarlo es mucho más sencillo."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Aries necesita una pareja capaz de sostener la intensidad sin pestañear. Necesitas a alguien que iguale tu energía, que participe en conflictos honestos sin tomárselos como algo personal y que respete tu feroz independencia. Una pareja que intente domesticar tu fuego solo terminará quemada.",
            "Anhelas emoción y espontaneidad en tus vínculos afectivos. La previsibilidad se siente como una muerte emocional para ti. La pareja que te sorprende, te desafía y te mantiene alerta se gana tu devoción más profunda. Necesitas sentir que la relación es una aventura, no una condena.",
            "El afecto físico es esencial. Procesas las emociones a través de tu cuerpo, y el contacto es la forma en que das y recibes consuelo emocional. Una pareja físicamente distante o emocionalmente reservada te dejará con una sensación de hambre."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de la actividad física. Correr, los deportes competitivos, las artes marciales o cualquier forma de movimiento intenso te ayudan a metabolizar la energía emocional. Cuando te quedas atascada en tus sentimientos, poner tu cuerpo en movimiento es el camino más rápido hacia la claridad.",
            "Tus necesidades de autocuidado emocional incluyen libertad, autonomía y el espacio para actuar según tus impulsos sin juicio. También te beneficia aprender a sostener la incomodidad en lugar de lanzarte de inmediato hacia una solución: algunas emociones necesitan sentirse, no resolverse."
          ]
        }
      ]
    },
    "taurus": {
      "headline": "Luna en Tauro: El ancla firme",
      "intro": "Con tu Luna en Tauro, tu mundo emocional es un jardín: exuberante, abundante y profundamente arraigado. La Luna está exaltada en Tauro, lo que significa que esta posición ofrece una estabilidad emocional excepcional, una profundidad sensual y una capacidad de contentamiento que otros envidian. Te sientes más tú misma cuando tus sentidos están satisfechos y tu mundo se siente seguro.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🌿",
          "paragraphs": [
            "La Luna en Tauro procesa las emociones de forma lenta y minuciosa. No reaccionas de manera impulsiva: dejas que los sentimientos se asienten, como el sedimento en aguas tranquilas, hasta que puedes verlos con claridad. Este procesamiento deliberado te otorga una notable resiliencia emocional. Donde otros son zarandeados por cada ola emocional, tú permaneces con los pies en la tierra.",
            "Tu mundo interior es sensorial y presente. Experimentas las emociones a través del gusto, el tacto, el sonido y el olfato tanto como a través del pensamiento. Una hermosa pieza musical puede conmoverte hasta las lágrimas. El aroma de la piel de tu pareja puede hacerte sentir completamente en casa. Estás emocionalmente encarnada de una manera que pocas otras posiciones logran.",
            "La seguridad es el cimiento de tu bienestar emocional. Necesitas saber que el suelo bajo tus pies es sólido antes de poder relajarte en la vulnerabilidad. La estabilidad financiera, un hogar cómodo y relaciones confiables no son lujos para ti: son necesidades emocionales."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Tauro necesita una pareja constante, físicamente afectuosa y comprometida a construir juntos una vida hermosa. No te interesan las dinámicas dramáticas de idas y venidas. Quieres un amor que se profundice con el tiempo, como el vino que envejece en roble.",
            "El contacto es tu principal lenguaje emocional. Necesitas conexión física regular: tomarse de las manos, masajes en la espalda, cocinar juntos, dormir entrelazados. Una pareja físicamente distante, por muy afectuosa que sea con las palabras, dejará tu copa emocional vacía.",
            "Demuestras amor creando comodidad y abundancia para tu pareja. Cocinar su plato favorito, mantener un hogar hermoso, brindar seguridad financiera: estas son tus cartas de amor. Necesitas una pareja que reconozca y valore estas expresiones tangibles de devoción."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través del anclaje sensorial. Un baño caliente, una comida exquisita, tiempo en la naturaleza o escuchar música en un espacio confortable: esas son tus medicinas emocionales. Cuando estás estresada, tu instinto es retirarte a tu santuario físico y restaurarte a través del placer.",
            "Tus necesidades de autocuidado emocional incluyen estabilidad, rutina y belleza. La alteración de tus ritmos diarios puede desestabilizarte de verdad. Construir una vida que nutra tus sentidos de forma constante no es indulgencia: es mantenimiento esencial para tu salud emocional."
          ]
        }
      ]
    },
    "gemini": {
      "headline": "Luna en Géminis: La mente inquieta",
      "intro": "Con tu Luna en Géminis, tu mundo emocional es una biblioteca: vasta, interconectada y en constante reorganización. Procesas los sentimientos a través del lenguaje, el análisis y la conversación. Emociones que otros viven como sensaciones en el estómago o punzadas en el corazón, tú las experimentas como corrientes de pensamiento que necesitan articularse antes de poder comprenderse.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "💨",
          "paragraphs": [
            "La Luna en Géminis procesa las emociones de forma intelectual. Cuando algo te conmueve, tu primer impulso es nombrarlo, analizarlo y hablar de ello. Esto puede hacerte parecer emocionalmente distante ante quienes son más instintivos, pero en verdad sientes profundamente: simplemente procesas a través de tu mente y no de tu cuerpo.",
            "Tu mundo interior es un diálogo constante. Puede que literalmente hables contigo misma, escribas extensamente en un diario o necesites verbalizar tus sentimientos a alguien más antes de poder comprenderlos. Las emociones no expresadas se acumulan como presión para ti: necesitas expresarlas con palabras para liberarlas.",
            "La variedad emocional es esencial para tu bienestar. Te vuelves genuinamente ansiosa cuando tu paisaje emocional se siente monótono. Necesitas estímulo intelectual, nuevas perspectivas y conversaciones cautivadoras para sentirte emocionalmente viva."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Géminis necesita una pareja capaz de cautivar tu mente tan profundamente como tu corazón. La compatibilidad intelectual no es un extra para ti: es el cimiento. Necesitas a alguien con quien puedas hablar sin fin, que te presente ideas nuevas y que trate las conversaciones como una forma de intimidad.",
            "Necesitas variedad emocional dentro de tu relación. Una pareja que pueda sorprenderte, cambiar de planes de forma espontánea y abordar los problemas desde ángulos inesperados mantiene tu mundo emocional fresco y vivo. La rutina y la previsibilidad en el amor se sienten asfixiantes.",
            "La comunicación es tu lenguaje del amor. Necesitas una pareja que responda a tus mensajes con atención, que participe en largas conversaciones nocturnas y que valore la expresión verbal de los sentimientos. El silencio emocional o la expectativa de que deberías simplemente adivinar lo que sienten te deja ansiosa."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos hablando, escribiendo y recopilando información. Llevar un diario, la terapia o simplemente desahogarte con un amigo de confianza te ayudan a dar sentido a tu mundo emocional. Leer sobre las experiencias de otras personas con sentimientos similares también puede ser profundamente validante.",
            "Tus necesidades de autocuidado emocional incluyen estímulo mental, conexión social y variedad. Cuando estás estresada, te beneficia cambiar de entorno, aprender algo nuevo o entablar una interacción social ligera en lugar de aislarte. El movimiento que involucra la mente, como caminar por un barrio nuevo, es especialmente sanador."
          ]
        }
      ]
    },
    "cancer": {
      "headline": "Luna en Cáncer: El pozo profundo",
      "intro": "Con tu Luna en Cáncer, tu mundo emocional es un océano: vasto, mareal e imposiblemente profundo. La Luna rige a Cáncer, lo que convierte a esta en su posición más poderosa y natural. Tu intuición emocional es extraordinaria, tu capacidad de nutrir no tiene límites y tu necesidad de seguridad emocional es más honda de lo que la mayoría de la gente puede imaginar.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🌊",
          "paragraphs": [
            "La Luna en Cáncer siente todo con una profundidad y una sensibilidad extraordinarias. Eres una esponja emocional que absorbe los estados de ánimo y los sentimientos de todos los que te rodean. Esta empatía es tu mayor don, pero también puede resultar abrumadora cuando no logras distinguir tus sentimientos del residuo emocional que has absorbido de otros.",
            "Tu mundo interior está lleno de memoria, nostalgia y asociaciones emocionales. Una canción, un aroma o una cualidad particular de la luz pueden transportarte al instante a un momento de hace años, con todos los sentimientos que experimentaste entonces. Tu memoria emocional es esencialmente fotográfica.",
            "La seguridad y la pertenencia son los pilares de tu bienestar emocional. Necesitas sentir que tienes un hogar, no solo un espacio físico, sino una red de personas que te aman incondicionalmente. Sin este cimiento, te sientes a la deriva y ansiosa de maneras que resultan difíciles de expresar."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Cáncer necesita una pareja que le brinde una seguridad emocional inquebrantable. Necesitas saber que tu vulnerabilidad nunca se usará en tu contra, que tus estados de ánimo serán recibidos con paciencia y que el vínculo entre ustedes es genuinamente irrompible. La confianza lo es todo.",
            "Demuestras amor a través del cuidado (cocinar, atender, crear santuarios emocionales) y necesitas una pareja que acepte y a la vez corresponda a ese cuidado. Una relación en la que siempre eres tú quien cuida y nunca la cuidada terminará por agotarte.",
            "La familia y la vida doméstica son centrales en tu visión romántica. Quieras o no tener hijos, necesitas una pareja que valore construir un hogar juntos. Los rituales domésticos compartidos (cocinar la cena del domingo, cuidar el jardín, acurrucarse en el sofá) son tu lenguaje del amor."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de actividades de cuidado y del recogimiento. Cuando te sientes abrumada, necesitas retirarte a tu caparazón: un espacio seguro y cómodo donde puedas sentir lo que sientes sin juicio. Cocinar, los baños y pasar tiempo cerca del agua te resultan profundamente reconfortantes.",
            "Tu autocuidado emocional requiere soledad regular para procesar y recargarte. También te beneficia contar con vías creativas que te permitan canalizar tu vasta energía emocional: cocinar, la jardinería, el arte, la escritura o cualquier forma de creación que transforme el sentir en algo tangible y hermoso."
          ]
        }
      ]
    },
    "leo": {
      "headline": "Luna en Leo: El corazón generoso",
      "intro": "Con tu Luna en Leo, tu mundo emocional es un escenario: brillante, dramático y profundamente interesado en ser visto. Sientes con intensidad teatral y te expresas con talento creativo. Tus necesidades emocionales giran en torno al reconocimiento, el aprecio y la libertad de expresar tu ser auténtico sin disculpas.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "☀️",
          "paragraphs": [
            "La Luna en Leo vive las emociones en un color vívido y cinematográfico. Tus sentimientos nunca son tibios: tu alegría es radiante, tu dolor es devastador y tu amor es épico. Procesas las emociones a través de la expresión, y necesitas un público que aprecie todo el espectro de lo que sientes.",
            "Tu mundo interior funciona con validación y autoexpresión creativa. Necesitas sentirte vista, admirada y valorada por quien realmente eres; no por lo que haces o lo que aportas, sino por la luz única que traes al mundo. Cuando esta necesidad se satisface, eres la persona más generosa y cálida de cualquier sala.",
            "El orgullo es a la vez tu fortaleza y tu vulnerabilidad. Te conduces con dignidad y esperas ser tratada con respeto. Cuando te humillan o te ignoran, la herida cala hondo, porque tu sentido de identidad está íntimamente ligado a cómo te perciben los demás."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Leo necesita una pareja que te adore: de forma genuina, expresiva y constante. Floreces con los cumplidos, los gestos románticos y una pareja que te haga sentir la persona más especial de su mundo. Esto no es vanidad: es una necesidad emocional legítima de reconocimiento.",
            "Aportas una enorme generosidad y calidez a tus relaciones, y necesitas una pareja que iguale esa energía. Vuelcas tu corazón en hacer que tus seres queridos se sientan celebrados, y una pareja que dé eso por sentado terminará por apagar tu luz.",
            "La complicidad creativa importa profundamente. Necesitas un amante que apoye tu autoexpresión, celebre tus triunfos y cree espacio para tu lado juguetón y dramático. Una relación que te haga sentir pequeña u ordinaria es una que no puedes sostener."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de la expresión creativa y la actuación. Cuando las emociones te abruman, canalizarlas hacia el arte, la música, la danza o cualquier forma de producción creativa transforma el sentir en bruto en algo hermoso y significativo.",
            "Tus necesidades de autocuidado emocional incluyen reconocimiento, juego y lujo. Regalarte algo especial (un atuendo hermoso, una cena elegante, un proyecto creativo) te recuerda tu propio valor. También te beneficia pasar tiempo con personas que genuinamente te aprecian y te celebran."
          ]
        }
      ]
    },
    "virgo": {
      "headline": "Luna en Virgo: La sanadora devota",
      "intro": "Con tu Luna en Virgo, tu mundo emocional es un santuario cuidado con esmero: ordenado, con propósito y consagrado a la mejora. Regida por Vesta, tu naturaleza emocional lleva una cualidad sagrada de servicio y precisión. Procesas los sentimientos a través del análisis y canalizas tu cuidado hacia la acción práctica.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🌾",
          "paragraphs": [
            "La Luna en Virgo procesa las emociones a través de un análisis cuidadoso. Cuando algo te conmueve, tu instinto es entender por qué, clasificar el sentimiento y determinar hacia qué acción útil apunta. Este enfoque analítico de las emociones no es frío: es tu forma de dar sentido a un mundo interior que se siente más manejable cuando está ordenado.",
            "Tu mundo interior es un taller de superación personal. Refinas constantemente tus hábitos, tu salud, tus rutinas y tus relaciones. Regida por Vesta, tu vida emocional tiene una cualidad devocional: abordas tus compromisos con la intensidad concentrada de quien cuida una llama sagrada.",
            "La ansiedad es la compañera sombría de tu naturaleza meticulosa. Tu conciencia de la imperfección puede inclinarse hacia la preocupación cuando te sientes incapaz de arreglar lo que te inquieta. Aprender a aceptar que algunas cosas escapan a tu control es una práctica emocional continua."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Virgo necesita una pareja que note y aprecie las pequeñas cosas que haces. Demuestras amor a través de actos de servicio: recordar cómo toma su café, organizar su agenda, notar cuándo necesita un descanso antes que ella misma. Una pareja que pase por alto estos gestos se siente devastadoramente ingrata.",
            "Necesitas orden, fiabilidad y conciencia de la salud en tus vínculos afectivos. El caos y la inestabilidad te resultan genuinamente angustiantes. Una pareja que cuida su propio bienestar y contribuye a una vida compartida bien organizada se gana tu respeto más profundo.",
            "La paciencia con tu naturaleza analítica es esencial. Puede que necesites procesar los sentimientos verbalmente, examinándolos desde todos los ángulos antes de llegar a una conclusión. Una pareja capaz de sostener espacio para este proceso sin apurarte ni descartarlo es invaluable."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de la rutina, la organización y la actividad útil. Cuando estás emocionalmente abrumada, limpiar, preparar comidas, hacer listas o trabajar en un proyecto productivo te ancla. El acto de crear orden en tu mundo externo calma el desorden de tu mundo interno.",
            "Tu autocuidado emocional requiere rutinas saludables, una alimentación limpia y prácticas conscientes. Eres profundamente sensible a tu entorno físico y a tu cuerpo, así que mantener la salud y el orden no es opcional: es el cimiento de tu estabilidad emocional."
          ]
        }
      ]
    },
    "libra": {
      "headline": "Luna en Libra: La buscadora de armonía",
      "intro": "Con tu Luna en Libra, tu mundo emocional es una galería de arte: curada para la belleza, el equilibrio y la armonía elegante. Regida por Juno, tu naturaleza emocional es fundamentalmente relacional. Te comprendes con mayor claridad a través de tus vínculos con los demás, y anhelas relaciones que sean iguales, hermosas y justas.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "⚖️",
          "paragraphs": [
            "La Luna en Libra procesa las emociones a través del lente de la relación y la equidad. Cuando algo perturba tu equilibrio, tu instinto es restaurar la balanza: mediante la conversación, el compromiso o la creación de belleza en tu entorno. Eres emocionalmente alérgica al conflicto e irás a extremos considerables para mantener la armonía.",
            "Tu mundo interior anhela el orden estético. Los entornos feos, las palabras ásperas y la discordia social afectan de verdad tu estado emocional. Regida por Juno, tu bienestar emocional está profundamente ligado a la salud de tus relaciones comprometidas: cuando tus vínculos prosperan, tú prosperas.",
            "La sombra de la Luna en Libra es la inautenticidad emocional. Tu deseo de complacer y mantener la armonía puede llevarte a reprimir tus verdaderos sentimientos, a decir que sí cuando no estás de acuerdo y a ceder cuando deberías afirmarte. Aprender a honrar tu propia verdad emocional es esencial."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Libra necesita una pareja genuinamente comprometida con la igualdad y el respeto mutuo. No puedes funcionar en relaciones donde hay un claro desequilibrio de poder. Necesitas sentir que tus opiniones, tus necesidades y tus aportes son valorados tanto como los de tu pareja.",
            "El romance y la belleza son necesidades emocionales, no lujos. Necesitas una pareja que cuide la estética de la relación: que planifique citas, mantenga el hogar hermoso y trate la relación como algo en lo que vale la pena invertir artística y emocionalmente.",
            "La compatibilidad intelectual y social es crucial. Necesitas una pareja a la que puedas presentar con orgullo a tus amigos, que participe en conversaciones estimulantes y que comparta tu aprecio por la cultura, la belleza y la gracia social."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de la conversación, la creación estética y la interacción social. Hablar las cosas con un confidente de confianza te ayuda a encontrar claridad emocional. Crear belleza (reorganizar tu espacio, componer un atuendo, hacer arte) restaura tu equilibrio interior.",
            "Tus necesidades de autocuidado emocional incluyen belleza, compañía y armonía social. Cuando estás estresada, te beneficia visitar una galería, escuchar música hermosa o pasar tiempo con personas emocionalmente equilibradas y de trato agradable. El aislamiento y el conflicto te resultan especialmente agotadores."
          ]
        }
      ]
    },
    "scorpio": {
      "headline": "Luna en Escorpio: La alquimista emocional",
      "intro": "Con tu Luna en Escorpio, tu mundo emocional es un volcán: inmensamente poderoso, parcialmente oculto y capaz de una transformación total. Esta es una de las posiciones lunares más intensas de la astrología. Sientes con una profundidad que estremece el alma, y tus experiencias emocionales te cambian de raíz cada vez.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🦅",
          "paragraphs": [
            "La Luna en Escorpio vive las emociones con una profundidad y una intensidad que la mayoría de la gente no puede imaginar. Donde otros sienten ondas, tú sientes maremotos. Tu procesamiento emocional es total: cuando atraviesas algo, lo atraviesas por completo y emerges transformada al otro lado.",
            "Tu mundo interior es un laberinto de sentimientos ocultos, perspicacia psicológica e intuición poderosa. Ves por debajo de la superficie de cada interacción, detectando motivos y dinámicas que otros pasan por alto por completo. Esto te otorga una inteligencia emocional extraordinaria, pero también significa que nunca puedes relajarte del todo: siempre estás procesando.",
            "La confianza es el tema central de tu vida emocional. Te han herido lo suficiente como para construir formidables murallas emocionales, y quien quiera llegar a tu núcleo debe probar su lealtad una y otra vez. Pero cuando confías, tu devoción es absoluta y tus vínculos emocionales son irrompibles."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Escorpio necesita una pareja capaz de sostener la intensidad emocional sin retroceder. Necesitas honestidad total, lealtad inquebrantable y disposición para ir a lo profundo: emocional, psicológica y físicamente. Las relaciones superficiales te resultan inútiles.",
            "Necesitas una pareja que no le tema a tu oscuridad. Cargas sombras, y necesitas a alguien capaz de sostener espacio para todo el espectro de tu experiencia emocional sin intentar arreglarte ni aligerar el ambiente. La profundidad emocional es tu lenguaje del amor.",
            "La privacidad y la exclusividad son esenciales. Necesitas sentir que tu vínculo emocional es sagrado y está protegido. Una pareja que comparte detalles íntimos con otros, mantiene límites ambiguos o te deja con dudas sobre su compromiso activa tus inseguridades más profundas."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de la profundidad, la soledad y la transformación. Cuando algo te activa emocionalmente, necesitas tiempo a solas para descender a tus sentimientos, sostenerlos y emerger al otro lado. Llevar un diario, la terapia y las prácticas de purga emocional son herramientas invaluables para ti.",
            "Tu autocuidado emocional requiere privacidad, intensidad y vías para la transformación. Actividades como la meditación profunda, el ejercicio de fuerza, el estudio de la psicología o las obras creativas que canalizan las emociones oscuras hacia el arte te ayudan a metabolizar tu inmensa energía emocional."
          ]
        }
      ]
    },
    "sagittarius": {
      "headline": "Luna en Sagitario: La optimista eterna",
      "intro": "Con tu Luna en Sagitario, tu mundo emocional es un camino abierto que se extiende hacia el horizonte. Procesas los sentimientos a través de la filosofía, la aventura y una fe inquebrantable en que todo sucede por una razón. Tu resiliencia emocional proviene de tu capacidad de encontrar significado en cada experiencia.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🏹",
          "paragraphs": [
            "La Luna en Sagitario procesa las emociones a través de la búsqueda de significado. Cuando ocurre algo doloroso, tu instinto es tomar distancia, encontrar la lección y replantear la experiencia como parte de un viaje más grande. Este enfoque filosófico te otorga una notable resiliencia emocional, aunque a veces puede impedirte sostener plenamente los sentimientos difíciles.",
            "Tu mundo interior es expansivo y optimista. Crees genuinamente que la vida es fundamentalmente buena y que cada revés te está preparando para algo mejor. Esto no es ingenuidad: es una profunda filosofía emocional que te sostiene a través de dificultades reales.",
            "La libertad es tu necesidad emocional esencial. Te vuelves emocionalmente claustrofóbica cuando te sientes atrapada, ya sea por las circunstancias, por las relaciones o por tus propios pensamientos negativos. Necesitas espacio para deambular, tanto física como mentalmente, para mantener tu equilibrio emocional."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Sagitario necesita una pareja que comparta tu amor por la aventura y el crecimiento. Necesitas a alguien entusiasmado con el futuro, abierto a nuevas experiencias y dispuesto a explorar la vida junto a ti. Una pareja que se aferra a la rutina y se resiste al cambio te asfixiará.",
            "La honestidad es primordial. Prefieres escuchar una verdad dolorosa que una mentira cómoda, y esperas la misma honestidad radical de tu pareja. Puedes perdonar casi cualquier cosa excepto la deshonestidad: el engaño se siente como una traición fundamental a tu confianza.",
            "Necesitas una pareja que respete tu independencia sin tomárselo como algo personal. Tu necesidad de espacio no es un reflejo de tus sentimientos hacia ella: es un requisito emocional innegociable. Una pareja lo bastante segura como para darte libertad se gana tu entrega devota."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través del movimiento, los viajes y la exploración filosófica. Cuando estás emocionalmente abrumada, salir de tu entorno habitual (incluso un largo viaje en auto o una caminata por la naturaleza) te ayuda a reiniciarte. Leer filosofía, asistir a charlas o discutir grandes ideas con amigos también te brinda alivio emocional.",
            "Tus necesidades de autocuidado emocional incluyen libertad, aventura y risa. Te recuperas más rápido cuando ríes, aprendes o exploras. Evita aislarte cuando estás decaída: tu optimismo es combustible social, y te recargas a través de interacciones positivas y expansivas."
          ]
        }
      ]
    },
    "capricorn": {
      "headline": "Luna en Capricornio: La fortaleza silenciosa",
      "intro": "Con tu Luna en Capricornio, tu mundo emocional es una montaña: sólida, perdurable y que se alza hacia algo mayor. Regida por Saturno, tu naturaleza emocional es disciplinada, reservada y profundamente dedicada a construir una vida que resista el paso del tiempo. Sientes profundamente pero expresas con parquedad.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🏔",
          "paragraphs": [
            "La Luna en Capricornio procesa las emociones a través del filtro de la practicidad y la responsabilidad. Cuando algo te conmueve, tu instinto es evaluar qué se puede hacer al respecto en lugar de simplemente permanecer en el sentimiento. Demuestras amor a través de la acción y los logros más que a través de la exhibición emocional.",
            "Tu mundo interior es más sensible de lo que cualquiera sospecha. Detrás de tu exterior sereno, cargas un profundo pozo de sentimientos que solo compartes con quienes se han ganado tu confianza absoluta. La Luna en Capricornio aprende temprano que la vulnerabilidad puede ser explotada, y te proteges en consecuencia.",
            "El logro y la seguridad emocional están profundamente entrelazados para ti. Te sientes emocionalmente estable cuando tu carrera avanza, tus finanzas son sólidas y cumples con tus responsabilidades. El éxito externo no es superficial para ti: sostiene genuinamente tu bienestar emocional."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Capricornio necesita una pareja emocionalmente madura, confiable y comprometida a construir una relación duradera. No te interesan los romances pasajeros ni los enredos dramáticos. Quieres un amor práctico, perdurable y edificado sobre el respeto mutuo.",
            "Necesitas una pareja que respete tus límites y que no te presione a ser más expresiva emocionalmente de lo que te resulta cómodo. Te revelas lentamente, y una pareja con la paciencia de esperar a que caigan las murallas descubrirá a una persona extraordinariamente leal y devota.",
            "Las metas y ambiciones compartidas son importantes. Necesitas una pareja igualmente motivada y responsable, alguien que contribuya por igual a construir juntos una vida segura. Respetas profundamente la competencia y la autodisciplina en una pareja."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través del trabajo, la estructura y la reflexión solitaria. Cuando estás emocionalmente abrumada, volcarte en una actividad productiva te ayuda a recuperar la sensación de control. Planificar, organizar y abordar problemas concretos te ancla cuando las emociones se sienten inmanejables.",
            "Tus necesidades de autocuidado emocional incluyen soledad, sentido de logro y tiempo tranquilo y de calidad con personas de confianza. Te recargas a través del trabajo significativo y encuentras consuelo en la tradición, el ritual y los ritmos predecibles de una vida bien ordenada."
          ]
        }
      ]
    },
    "aquarius": {
      "headline": "Luna en Acuario: La rebelde compasiva",
      "intro": "Con tu Luna en Acuario, tu mundo emocional opera en una frecuencia distinta a la de la mayoría. Regida por Urano, tu naturaleza emocional es poco convencional, orientada a lo intelectual y profundamente humanitaria. Te importa la humanidad con intensidad mientras a veces te cuesta la intimidad de los vínculos emocionales uno a uno.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "⚡",
          "paragraphs": [
            "La Luna en Acuario procesa las emociones a través de la comprensión intelectual y el desapego. Cuando algo te conmueve, tu primer paso es analizar por qué, entender el patrón y contextualizarlo dentro de un marco más amplio. Esto te otorga una notable claridad emocional, pero puede frustrar a las parejas que quieren una respuesta puramente emocional.",
            "Tu mundo interior es un paisaje visionario de ideas, ideales y preocupación humanitaria. Te sientes emocionalmente más conectada cuando trabajas por el cambio social, te involucras con tu comunidad o exploras maneras poco convencionales de vivir. Tus emociones están fundamentalmente ligadas a tu sentido de propósito.",
            "La independencia no es solo una preferencia: es un mecanismo de supervivencia emocional. Necesitas un espacio considerable dentro de las relaciones para mantener tu sentido de identidad. Las exigencias emocionales que se sienten controladoras o posesivas activan tu instinto de huida más que casi cualquier otra cosa."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Acuario necesita una pareja intelectualmente estimulante, emocionalmente autosuficiente y abierta a estructuras de relación poco convencionales. No te ajustas a los guiones románticos tradicionales, y necesitas una pareja que valore la autenticidad por encima de la convención.",
            "La amistad es el cimiento de tus vínculos amorosos. Necesitas apreciar y respetar genuinamente a tu pareja como persona, independientemente de la química romántica. Las relaciones más fuertes de la Luna en Acuario son las que se construyen sobre intereses intelectuales compartidos, respeto mutuo y auténtica amistad.",
            "Necesitas una pareja que no interprete tu necesidad de espacio como rechazo. Tu ritmo emocional incluye periodos de cercanía y periodos de retiro, y una pareja capaz de surfear estas olas sin ansiedad se gana tu devoción duradera."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través del análisis intelectual, la participación social y la acción humanitaria. Cuando estás emocionalmente abrumada, involucrarte con una causa que te importa, tener una conversación filosófica o trabajar en un proyecto creativo te ayuda a recuperar el equilibrio.",
            "Tus necesidades de autocuidado emocional incluyen estímulo intelectual, conexión comunitaria y libertad. Te recuperas más rápido cuando sientes que tu vida tiene propósito y que tu singularidad es valorada en lugar de cuestionada. Evita las parejas y los entornos que intentan volverte normal."
          ]
        }
      ]
    },
    "pisces": {
      "headline": "Luna en Piscis: La empática sin límites",
      "intro": "Con tu Luna en Piscis, tu mundo emocional no tiene fronteras: fluye hacia afuera, absorbiendo los sentimientos de todos los que te rodean, fundiéndose con el inconsciente colectivo y experimentando todo el espectro de la emoción humana como si fuera propio. Esta es una de las posiciones emocionalmente más sensibles de la astrología.",
      "sections": [
        {
          "title": "Naturaleza emocional y mundo interior",
          "icon": "🌊",
          "paragraphs": [
            "La Luna en Piscis lo siente todo: no solo tus propias emociones, sino las de todos en la sala, la tristeza de una noticia, el anhelo de una pieza musical. Tu sensibilidad empática es extraordinaria, lo que te convierte en un canal emocional para energías que otros ni siquiera pueden percibir.",
            "Tu mundo interior es un vasto océano de imaginación, sensibilidad espiritual y potencial creativo. Sueñas con vividez, intuyes profundamente y experimentas la realidad como algo más fluido e interconectado de lo que la mayoría de la gente puede concebir. El límite entre tus sentimientos y los de los demás es genuinamente poroso.",
            "El desafío de la Luna en Piscis es el desbordamiento emocional. Sin límites firmes, puedes inundarte del dolor del mundo, lo que lleva a tendencias escapistas: refugiarte en la fantasía, el sueño o las sustancias para adormecer la intensidad de lo que sientes."
          ]
        },
        {
          "title": "Lo que necesitas en el amor",
          "icon": "💕",
          "paragraphs": [
            "La Luna en Piscis necesita una pareja emocionalmente tierna, espiritualmente consciente y dispuesta a encontrarte en las profundidades. Necesitas un amor que se sienta trascendente: una conexión de almas que vaya más allá de lo físico y lo intelectual hacia algo sagrado.",
            "Necesitas una pareja que proteja tu sensibilidad sin explotarla. Tu empatía te hace vulnerable a la manipulación emocional, y necesitas a alguien cuyas intenciones sean tan puras como las tuyas. Una pareja que te ancle sin descartar tu profundidad emocional es lo ideal.",
            "La conexión creativa y espiritual importa profundamente. Necesitas una pareja que aprecie el arte, la música, la naturaleza y las dimensiones místicas de la vida. Una relación puramente práctica, sin poesía ni magia, no puede sostener tu espíritu."
          ]
        },
        {
          "title": "Procesar los sentimientos y autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Procesas los sentimientos a través de la expresión creativa, la práctica espiritual y el retiro solitario. Cuando estás emocionalmente abrumada, crear arte, escuchar música, meditar o pasar tiempo cerca del agua te ayuda a liberar la energía emocional que has absorbido de otros.",
            "Tu autocuidado emocional requiere límites firmes, soledad regular y vías creativas. Debes aprender a distinguir tus sentimientos de aquellos que has absorbido, y a proteger tu energía en entornos emocionalmente intensos. El sueño y el tiempo de soñar son esenciales para tu procesamiento emocional."
          ]
        }
      ]
    }
  },
  "pt": {
    "aries": {
      "headline": "Lua em Áries: O Coração Feroz",
      "intro": "Com a sua Lua em Áries, o seu mundo emocional é uma fornalha de paixão, imediatismo e honestidade crua. Você sente tudo no volume máximo e expressa com a mesma rapidez. As suas reações emocionais são velozes, ardentes e surpreendentemente transparentes — o que você sente, todos ficam sabendo.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🔥",
          "paragraphs": [
            "A Lua em Áries processa as emoções através da ação. Quando você sente algo profundamente, o seu instinto não é ficar sentado com aquilo, mas fazer algo a respeito. A tristeza vira determinação. A raiva vira combustível. A alegria vira aventura espontânea. Você metaboliza os sentimentos na velocidade de um raio, o que significa que raramente guarda rancor — você se inflama quente e esfria com a mesma rapidez.",
            "O seu mundo interior é inquieto e pioneiro. Você precisa de estímulo emocional do jeito que outros precisam de segurança emocional. A estagnação é o seu pior pesadelo, e você floresce quando a sua vida emocional se sente dinâmica e em movimento para frente. Paisagens emocionais rotineiras te entediam profundamente.",
            "Há uma pureza infantil na sua expressão emocional. Você diz o que sente sem filtrar, e espera que os outros façam o mesmo. O comportamento passivo-agressivo genuinamente te confunde, porque você não consegue imaginar escolher esconder o que sente quando expressar é muito mais simples."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Áries precisa de um parceiro que consiga lidar com a intensidade sem se encolher. Você precisa de alguém que corresponda à sua energia, que entre em conflitos honestos sem levar para o lado pessoal e que respeite a sua feroz independência. Um parceiro que tenta domesticar o seu fogo só vai acabar se queimando.",
            "Você anseia por empolgação e espontaneidade nos seus laços emocionais. A previsibilidade parece morte emocional para você. O parceiro que te surpreende, te desafia e te mantém em alerta conquista a sua mais profunda devoção. Você precisa sentir que a relação é uma aventura, não uma sentença.",
            "O afeto físico é essencial. Você processa as emoções através do corpo, e o toque é como você tanto dá quanto recebe conforto emocional. Um parceiro que é fisicamente distante ou emocionalmente reservado vai te deixar com uma sensação de fome."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da atividade física. Correr, esportes competitivos, artes marciais ou qualquer forma de movimento intenso te ajuda a metabolizar a energia emocional. Quando você está travado nos seus sentimentos, colocar o corpo em movimento é o caminho mais rápido para a clareza.",
            "As suas necessidades de autocuidado emocional incluem liberdade, autonomia e o espaço para agir conforme os seus impulsos sem julgamento. Você também se beneficia ao aprender a permanecer com o desconforto em vez de partir imediatamente para uma solução — alguns sentimentos precisam ser sentidos, não consertados."
          ]
        }
      ]
    },
    "taurus": {
      "headline": "Lua em Touro: A Âncora Firme",
      "intro": "Com a sua Lua em Touro, o seu mundo emocional é um jardim — exuberante, abundante e profundamente enraizado. A Lua está exaltada em Touro, o que significa que esta posição proporciona uma estabilidade emocional excepcional, profundidade sensual e uma capacidade de contentamento que os outros invejam. Você se sente mais você mesmo quando os seus sentidos estão satisfeitos e o seu mundo se sente seguro.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🌿",
          "paragraphs": [
            "A Lua em Touro processa as emoções lenta e minuciosamente. Você não reage por impulso — você deixa os sentimentos assentarem, como sedimento em água parada, até conseguir vê-los com clareza. Esse processamento deliberado te dá uma notável resiliência emocional. Onde outros são jogados por cada onda emocional, você permanece firme no chão.",
            "O seu mundo interior é sensorial e presente. Você vivencia as emoções através do paladar, do tato, do som e do olfato tanto quanto através do pensamento. Uma bela peça musical pode te levar às lágrimas. O cheiro da pele do seu parceiro pode fazer você se sentir completamente em casa. Você é emocionalmente incorporado de um jeito que poucas outras posições alcançam.",
            "A segurança é a base do seu bem-estar emocional. Você precisa saber que o chão sob os seus pés é sólido antes de poder relaxar na vulnerabilidade. Estabilidade financeira, um lar confortável e relacionamentos confiáveis não são luxos para você — são necessidades emocionais."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Touro precisa de um parceiro que seja consistente, fisicamente afetuoso e comprometido em construir uma vida bonita juntos. Você não tem interesse em dinâmicas dramáticas de vai e volta. Você quer um amor que se aprofunde com o tempo, como vinho envelhecendo no carvalho.",
            "O toque é a sua principal linguagem emocional. Você precisa de conexão física regular — dar as mãos, massagear as costas, cozinhar juntos, dormir entrelaçados. Um parceiro que é fisicamente distante, por mais verbalmente afetuoso que seja, vai deixar o seu copo emocional vazio.",
            "Você demonstra amor criando conforto e abundância para o seu parceiro. Cozinhar a refeição favorita dele, manter um lar bonito, oferecer segurança financeira — essas são as suas cartas de amor. Você precisa de um parceiro que reconheça e valorize essas expressões tangíveis de devoção."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através do enraizamento sensorial. Um banho quente, uma refeição gourmet, tempo na natureza ou ouvir música em um espaço confortável — essas são a sua medicina emocional. Quando estressado, o seu instinto é recuar para o seu santuário físico e se restaurar através do prazer.",
            "As suas necessidades de autocuidado emocional incluem estabilidade, rotina e beleza. A perturbação dos seus ritmos diários pode ser genuinamente desestabilizadora. Construir uma vida que nutra consistentemente os seus sentidos não é indulgência — é uma manutenção essencial para a sua saúde emocional."
          ]
        }
      ]
    },
    "gemini": {
      "headline": "Lua em Gêmeos: A Mente Inquieta",
      "intro": "Com a sua Lua em Gêmeos, o seu mundo emocional é uma biblioteca — vasta, interconectada e constantemente sendo reorganizada. Você processa os sentimentos através da linguagem, da análise e da conversa. Emoções que outros vivenciam como sensações no estômago ou pontadas no coração, você vivencia como fluxos de pensamento que precisam ser articulados antes de poderem ser compreendidos.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "💨",
          "paragraphs": [
            "A Lua em Gêmeos processa as emoções intelectualmente. Quando algo te comove, o seu primeiro impulso é nomear, analisar e falar sobre aquilo. Isso pode fazer você parecer emocionalmente distante para tipos mais instintivos, mas na verdade você sente profundamente — você simplesmente processa através da mente em vez do corpo.",
            "O seu mundo interior é um diálogo constante. Você pode literalmente falar consigo mesmo, escrever extensivamente em um diário ou precisar verbalizar os seus sentimentos para outra pessoa antes de conseguir compreendê-los. Emoções não ditas se acumulam como pressão para você — você precisa expressá-las através de palavras para liberá-las.",
            "A variedade emocional é essencial para o seu bem-estar. Você fica genuinamente ansioso quando a sua paisagem emocional se sente monótona. Você precisa de estímulo intelectual, novas perspectivas e conversas envolventes para se sentir emocionalmente vivo."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Gêmeos precisa de um parceiro que consiga envolver a sua mente tão profundamente quanto o seu coração. A compatibilidade intelectual não é um bônus para você — é a base. Você precisa de alguém com quem possa conversar sem parar, que te apresente a novas ideias e que trate as conversas como uma forma de intimidade.",
            "Você precisa de variedade emocional dentro do seu relacionamento. Um parceiro que consiga te surpreender, mudar de planos espontaneamente e abordar problemas de ângulos inesperados mantém o seu mundo emocional fresco e vivo. Rotina e previsibilidade no amor são sufocantes.",
            "A comunicação é a sua linguagem do amor. Você precisa de um parceiro que responda às mensagens com atenção, que entre em longas conversas noite adentro e que valorize a expressão verbal dos sentimentos. O silêncio emocional ou a expectativa de que você deveria simplesmente saber o que ele está sentindo te deixa ansioso."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através de falar, escrever e reunir informações. Escrever em um diário, terapia ou simplesmente desabafar com um amigo de confiança te ajuda a dar sentido ao seu mundo emocional. Ler sobre as experiências de outras pessoas com sentimentos semelhantes também pode ser profundamente validante.",
            "As suas necessidades de autocuidado emocional incluem estímulo mental, conexão social e variedade. Quando estressado, você se beneficia ao mudar de ambiente, aprender algo novo ou se envolver em uma interação social leve em vez de se isolar. Movimento que envolve a mente — como caminhar por um bairro novo — é particularmente curativo."
          ]
        }
      ]
    },
    "cancer": {
      "headline": "Lua em Câncer: O Poço Profundo",
      "intro": "Com a sua Lua em Câncer, o seu mundo emocional é um oceano — vasto, movido pelas marés e impossivelmente profundo. A Lua rege Câncer, tornando esta a sua posição mais poderosa e natural. A sua intuição emocional é extraordinária, a sua capacidade de nutrir é ilimitada e a sua necessidade de segurança emocional é mais profunda do que a maioria das pessoas consegue imaginar.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🌊",
          "paragraphs": [
            "A Lua em Câncer sente tudo com uma profundidade e sensibilidade extraordinárias. Você é uma esponja emocional, absorvendo os humores e sentimentos de todos ao seu redor. Essa empatia é o seu maior dom, mas também pode ser avassaladora quando você não consegue distinguir os seus sentimentos do resíduo emocional que absorveu dos outros.",
            "O seu mundo interior é rico em memória, nostalgia e associações emocionais. Uma canção, um cheiro ou uma qualidade específica de luz pode te transportar instantaneamente para um momento de anos atrás, completo com todos os sentimentos que você vivenciou então. A sua memória emocional é essencialmente fotográfica.",
            "Segurança e pertencimento são os pilares do seu bem-estar emocional. Você precisa sentir que tem um lar — não apenas um espaço físico, mas uma rede de pessoas que te amam incondicionalmente. Sem essa base, você se sente à deriva e ansioso de maneiras difíceis de articular."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Câncer precisa de um parceiro que ofereça uma segurança emocional inabalável. Você precisa saber que a sua vulnerabilidade nunca será usada contra você, que os seus humores serão recebidos com paciência e que o laço entre vocês é genuinamente inquebrável. A confiança é tudo.",
            "Você demonstra amor através do cuidado — cozinhando, cuidando, criando santuários emocionais — e você precisa de um parceiro que ao mesmo tempo aceite e retribua esse cuidado. Um relacionamento em que você é sempre o cuidador e nunca aquele que é cuidado acabará te esgotando.",
            "A família e a vida doméstica são centrais na sua visão romântica. Querendo ou não filhos, você precisa de um parceiro que valorize criar um lar juntos. Rituais domésticos compartilhados — cozinhar o jantar de domingo, cuidar do jardim, se aconchegar no sofá — são a sua linguagem do amor."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através de atividades de cuidado e do recolhimento. Quando sobrecarregado, você precisa se retirar para a sua concha — um espaço seguro e confortável onde possa sentir os seus sentimentos sem julgamento. Cozinhar, tomar banhos e passar tempo perto da água são profundamente reconfortantes para você.",
            "O seu autocuidado emocional requer solidão regular para processar e recarregar. Você também se beneficia de válvulas de escape criativas que te permitam canalizar a sua vasta energia emocional — cozinhar, jardinagem, arte, escrita ou qualquer forma de criação que transforme o sentimento em algo tangível e belo."
          ]
        }
      ]
    },
    "leo": {
      "headline": "Lua em Leão: O Coração Generoso",
      "intro": "Com a sua Lua em Leão, o seu mundo emocional é um palco — brilhante, dramático e profundamente investido em ser testemunhado. Você sente com intensidade teatral e se expressa com talento criativo. As suas necessidades emocionais giram em torno de reconhecimento, apreço e a liberdade de expressar o seu eu autêntico sem pedir desculpas.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "☀️",
          "paragraphs": [
            "A Lua em Leão vivencia as emoções em cores vívidas e cinematográficas. Os seus sentimentos nunca são mornos — a sua alegria é radiante, a sua mágoa é devastadora e o seu amor é épico. Você processa as emoções através da expressão, e precisa de uma plateia que aprecie todo o espectro do que você sente.",
            "O seu mundo interior funciona movido a validação e autoexpressão criativa. Você precisa se sentir visto, admirado e valorizado por quem você realmente é — não pelo que faz ou pelo que oferece, mas pela luz única que você traz ao mundo. Quando essa necessidade é atendida, você é a pessoa mais generosa e de coração mais caloroso em qualquer ambiente.",
            "O orgulho é ao mesmo tempo a sua força e a sua vulnerabilidade. Você se porta com dignidade e espera ser tratado com respeito. Quando humilhado ou desprezado, a ferida corta fundo, porque o seu senso de si mesmo está intimamente ligado a como os outros o percebem."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Leão precisa de um parceiro que te adore — genuinamente, de forma expressa e consistente. Você floresce com elogios, gestos românticos e um parceiro que te faça sentir a pessoa mais especial do mundo dele. Isso não é vaidade — é uma legítima necessidade emocional de reconhecimento.",
            "Você traz enorme generosidade e calor aos seus relacionamentos, e precisa de um parceiro que corresponda a essa energia. Você derrama o seu coração em fazer os seus entes queridos se sentirem celebrados, e um parceiro que toma isso como garantido acabará ofuscando a sua luz.",
            "A parceria criativa importa profundamente. Você precisa de um amor que apoie a sua autoexpressão, celebre as suas vitórias e crie espaço para o seu lado brincalhão e dramático. Um relacionamento que te faz sentir pequeno ou comum é um que você não consegue sustentar."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da expressão criativa e da performance. Quando as emoções te sobrecarregam, canalizá-las em arte, música, dança ou qualquer forma de produção criativa transforma o sentimento cru em algo belo e cheio de significado.",
            "As suas necessidades de autocuidado emocional incluem reconhecimento, diversão e luxo. Presentear a si mesmo com algo especial — uma roupa bonita, um jantar sofisticado, um projeto criativo — te lembra do seu próprio valor. Você também se beneficia de passar tempo com pessoas que genuinamente te apreciam e te celebram."
          ]
        }
      ]
    },
    "virgo": {
      "headline": "Lua em Virgem: A Curadora Devotada",
      "intro": "Com a sua Lua em Virgem, o seu mundo emocional é um santuário cuidadosamente cultivado — organizado, propositado e devotado ao aperfeiçoamento. Regida por Vesta, a sua natureza emocional carrega uma qualidade sagrada de serviço e precisão. Você processa os sentimentos através da análise e canaliza o seu cuidado em ação prática.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🌾",
          "paragraphs": [
            "A Lua em Virgem processa as emoções através de uma análise cuidadosa. Quando algo te comove, o seu instinto é entender o porquê, categorizar o sentimento e determinar para qual ação útil ele aponta. Essa abordagem analítica das emoções não é fria — é como você dá sentido a um mundo interior que se sente mais gerenciável quando organizado.",
            "O seu mundo interior é uma oficina de autoaperfeiçoamento. Você está constantemente refinando os seus hábitos, a sua saúde, as suas rotinas e os seus relacionamentos. Regida por Vesta, a sua vida emocional tem uma qualidade devocional — você aborda os seus compromissos com a intensidade focada de alguém cuidando de uma chama sagrada.",
            "A ansiedade é a companheira sombria da sua natureza meticulosa. A sua consciência da imperfeição pode se transformar em preocupação quando você se sente incapaz de consertar o que te incomoda. Aprender a aceitar que algumas coisas estão além do seu controle é uma prática emocional contínua."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Virgem precisa de um parceiro que perceba e aprecie as pequenas coisas que você faz. Você demonstra amor através de atos de serviço — lembrar do pedido de café dele, organizar a agenda dele, perceber quando ele precisa de uma pausa antes mesmo que ele perceba. Um parceiro que ignora esses gestos parece devastadoramente ingrato.",
            "Você precisa de ordem, confiabilidade e consciência sobre saúde nas suas parcerias emocionais. O caos e a instabilidade são genuinamente angustiantes para você. Um parceiro que cuida do próprio bem-estar e contribui para uma vida compartilhada bem organizada conquista o seu mais profundo respeito.",
            "A paciência com a sua natureza analítica é essencial. Você pode precisar processar os sentimentos verbalmente, examinando-os de todos os ângulos antes de chegar a uma conclusão. Um parceiro que consiga sustentar esse processo sem te apressar ou desprezá-lo é inestimável."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da rotina, da organização e da atividade útil. Quando emocionalmente sobrecarregado, limpar, preparar refeições, fazer listas ou trabalhar em um projeto produtivo te aterra. O ato de criar ordem no seu mundo externo acalma a desordem no seu mundo interno.",
            "O seu autocuidado emocional requer rotinas saudáveis, alimentação limpa e práticas conscientes. Você é profundamente sensível ao seu ambiente físico e ao seu corpo, então manter a saúde e a ordem não é opcional — é a base da sua estabilidade emocional."
          ]
        }
      ]
    },
    "libra": {
      "headline": "Lua em Libra: A Buscadora de Harmonia",
      "intro": "Com a sua Lua em Libra, o seu mundo emocional é uma galeria de arte — curada para a beleza, o equilíbrio e a harmonia elegante. Regida por Juno, a sua natureza emocional é fundamentalmente relacional. Você compreende a si mesmo mais claramente através das suas conexões com os outros, e anseia por parcerias que sejam iguais, belas e justas.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "⚖️",
          "paragraphs": [
            "A Lua em Libra processa as emoções através da lente do relacionamento e da justiça. Quando algo perturba o seu equilíbrio, o seu instinto é restaurar a balança — por meio de conversa, concessão ou criando beleza no seu ambiente. Você é emocionalmente alérgico a conflitos e irá a extremos consideráveis para manter a harmonia.",
            "O seu mundo interior anseia por ordem estética. Ambientes feios, palavras duras e discórdia social afetam genuinamente o seu estado emocional. Regida por Juno, o seu bem-estar emocional está profundamente atrelado à saúde dos seus relacionamentos comprometidos — quando as suas parcerias florescem, você floresce.",
            "A sombra da Lua em Libra é a inautenticidade emocional. O seu desejo de agradar e manter a harmonia pode te levar a suprimir os seus verdadeiros sentimentos, concordar quando você discorda e ceder quando deveria se impor. Aprender a honrar a sua própria verdade emocional é essencial."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Libra precisa de um parceiro que seja genuinamente comprometido com a igualdade e o respeito mútuo. Você não consegue funcionar em relacionamentos onde há um claro desequilíbrio de poder. Você precisa sentir que as suas opiniões, necessidades e contribuições são valorizadas tanto quanto as do seu parceiro.",
            "Romance e beleza são necessidades emocionais, não luxos. Você precisa de um parceiro que mantenha a estética do relacionamento — que planeje encontros, mantenha a casa bonita e trate a parceria como algo que vale a pena investir artística e emocionalmente.",
            "A compatibilidade intelectual e social é crucial. Você precisa de um parceiro que possa apresentar com orgulho aos seus amigos, que se envolva em conversas estimulantes e que compartilhe o seu apreço por cultura, beleza e graça social."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da conversa, da criação estética e da interação social. Conversar sobre as coisas com um confidente de confiança te ajuda a encontrar clareza emocional. Criar beleza — reorganizar o seu espaço, montar um visual, fazer arte — restaura o seu equilíbrio interior.",
            "As suas necessidades de autocuidado emocional incluem beleza, parceria e harmonia social. Quando estressado, você se beneficia ao visitar uma galeria, ouvir música bonita ou passar tempo com pessoas emocionalmente equilibradas e socialmente graciosas. O isolamento e o conflito são particularmente exaustivos para você."
          ]
        }
      ]
    },
    "scorpio": {
      "headline": "Lua em Escorpião: O Alquimista Emocional",
      "intro": "Com a sua Lua em Escorpião, o seu mundo emocional é um vulcão — imensamente poderoso, parcialmente oculto e capaz de transformação total. Esta é uma das posições lunares mais intensas da astrologia. Você sente com uma profundidade que abala a alma, e as suas experiências emocionais te transformam fundamentalmente a cada vez.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🦅",
          "paragraphs": [
            "A Lua em Escorpião vivencia as emoções com uma profundidade e intensidade que a maioria das pessoas não consegue conceber. Onde outros sentem ondulações, você sente maremotos. O seu processamento emocional é total — quando você atravessa algo, você atravessa até o fim, emergindo transformado do outro lado.",
            "O seu mundo interior é um labirinto de sentimentos ocultos, percepção psicológica e intuição poderosa. Você enxerga por baixo da superfície de cada interação, detectando motivos e dinâmicas que os outros deixam totalmente escapar. Isso te dá uma inteligência emocional extraordinária, mas também significa que você nunca consegue relaxar por completo — você está sempre processando.",
            "A confiança é o tema central da sua vida emocional. Você já foi ferido profundamente o suficiente para construir muros emocionais formidáveis, e qualquer um que queira alcançar o seu núcleo precisa provar a sua lealdade repetidamente. Mas quando você confia, a sua devoção é absoluta e os seus laços emocionais são inquebráveis."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Escorpião precisa de um parceiro que consiga lidar com a intensidade emocional sem recuar. Você precisa de honestidade total, lealdade inabalável e uma disposição para ir fundo — emocional, psicológica e fisicamente. Relacionamentos superficiais parecem sem sentido para você.",
            "Você precisa de um parceiro que não tenha medo da sua escuridão. Você carrega sombras, e precisa de alguém que consiga sustentar todo o espectro da sua experiência emocional sem tentar te consertar ou aliviar o clima. A profundidade emocional é a sua linguagem do amor.",
            "A privacidade e a exclusividade são essenciais. Você precisa sentir que o seu laço emocional é sagrado e protegido. Um parceiro que compartilha detalhes íntimos com outros, mantém limites ambíguos ou te deixa em dúvida sobre o compromisso dele dispara as suas mais profundas inseguranças."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da profundidade, da solidão e da transformação. Quando emocionalmente ativado, você precisa de tempo sozinho para descer até os seus sentimentos, permanecer com eles e emergir do outro lado. Escrever em um diário, terapia e práticas de purgação emocional são ferramentas inestimáveis para você.",
            "O seu autocuidado emocional requer privacidade, intensidade e válvulas de escape para a transformação. Atividades como meditação profunda, exercícios baseados em força, estudo psicológico ou obras criativas que canalizam emoções sombrias em arte te ajudam a metabolizar a sua imensa energia emocional."
          ]
        }
      ]
    },
    "sagittarius": {
      "headline": "Lua em Sagitário: O Eterno Otimista",
      "intro": "Com a sua Lua em Sagitário, o seu mundo emocional é uma estrada aberta que se estende em direção ao horizonte. Você processa os sentimentos através da filosofia, da aventura e de uma fé inabalável de que tudo acontece por uma razão. A sua resiliência emocional vem da sua capacidade de encontrar significado em cada experiência.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🏹",
          "paragraphs": [
            "A Lua em Sagitário processa as emoções através da construção de significado. Quando algo doloroso acontece, o seu instinto é dar um passo atrás, encontrar a lição e reformular a experiência como parte de uma jornada maior. Essa abordagem filosófica te dá uma notável resiliência emocional, embora às vezes possa te impedir de permanecer plenamente com sentimentos difíceis.",
            "O seu mundo interior é expansivo e otimista. Você acredita genuinamente que a vida é fundamentalmente boa e que cada revés está te preparando para algo melhor. Isso não é ingenuidade — é uma profunda filosofia emocional que te sustenta através de dificuldades reais.",
            "A liberdade é a sua necessidade emocional central. Você fica emocionalmente claustrofóbico quando se sente preso — por circunstâncias, por relacionamentos ou pelos seus próprios pensamentos negativos. Você precisa de espaço para vagar, tanto física quanto mentalmente, para manter o seu equilíbrio emocional."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Sagitário precisa de um parceiro que compartilhe o seu amor pela aventura e pelo crescimento. Você precisa de alguém que esteja animado com o futuro, aberto a novas experiências e disposto a explorar a vida ao seu lado. Um parceiro que se apega à rotina e resiste à mudança vai te sufocar.",
            "A honestidade é primordial. Você prefere ouvir uma verdade dolorosa a uma mentira confortável, e espera a mesma honestidade radical do seu parceiro. Você consegue perdoar quase tudo, exceto a desonestidade — o engano parece uma traição fundamental da sua confiança.",
            "Você precisa de um parceiro que respeite a sua independência sem levar para o lado pessoal. A sua necessidade de espaço não é um reflexo dos seus sentimentos por ele — é um requisito emocional inegociável. Um parceiro que seja seguro o suficiente para te dar liberdade conquista o seu retorno devotado."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através do movimento, das viagens e da exploração filosófica. Quando emocionalmente sobrecarregado, sair do seu ambiente habitual — mesmo que seja uma longa viagem de carro ou uma trilha na natureza — te ajuda a se recompor. Ler filosofia, assistir a palestras ou discutir grandes ideias com amigos também oferece alívio emocional.",
            "As suas necessidades de autocuidado emocional incluem liberdade, aventura e risadas. Você se recupera mais rápido quando está rindo, aprendendo ou explorando. Evite se isolar quando estiver para baixo — o seu otimismo é combustível social, e você recarrega através de interações positivas e expansivas."
          ]
        }
      ]
    },
    "capricorn": {
      "headline": "Lua em Capricórnio: A Fortaleza Silenciosa",
      "intro": "Com a sua Lua em Capricórnio, o seu mundo emocional é uma montanha — sólido, duradouro e alcançando algo maior. Regida por Saturno, a sua natureza emocional é disciplinada, reservada e profundamente investida em construir uma vida que resista ao teste do tempo. Você sente profundamente, mas expressa com parcimônia.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🏔",
          "paragraphs": [
            "A Lua em Capricórnio processa as emoções através do filtro da praticidade e da responsabilidade. Quando algo te comove, o seu instinto é avaliar o que pode ser feito a respeito, em vez de simplesmente permanecer no sentimento. Você demonstra amor através da ação e da realização, e não da exibição emocional.",
            "O seu mundo interior é mais sensível do que qualquer um suspeita. Por trás da sua fachada serena, você carrega um profundo poço de sentimento que compartilha apenas com aqueles que conquistaram a sua confiança absoluta. A Lua em Capricórnio aprende cedo que a vulnerabilidade pode ser explorada, e você se protege de acordo.",
            "A realização e a segurança emocional estão profundamente entrelaçadas para você. Você se sente emocionalmente estável quando a sua carreira está progredindo, as suas finanças estão sólidas e você está cumprindo as suas responsabilidades. O sucesso externo não é superficial para você — ele genuinamente sustenta o seu bem-estar emocional."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Capricórnio precisa de um parceiro que seja emocionalmente maduro, confiável e comprometido em construir uma parceria duradoura. Você não tem interesse em casos passageiros ou enredos dramáticos. Você quer um amor que seja prático, duradouro e construído sobre respeito mútuo.",
            "Você precisa de um parceiro que respeite os seus limites e não te pressione a ser mais emocionalmente expressivo do que você se sente confortável em ser. Você se revela lentamente, e um parceiro que tenha a paciência de esperar os muros caírem descobrirá uma pessoa extraordinariamente leal e devotada.",
            "Objetivos e ambições compartilhados são importantes. Você precisa de um parceiro que seja igualmente determinado e responsável, alguém que contribua igualmente para construir uma vida segura juntos. Você respeita profundamente a competência e a autodisciplina em um parceiro."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através do trabalho, da estrutura e da reflexão solitária. Quando emocionalmente sobrecarregado, mergulhar em uma atividade produtiva te ajuda a recuperar a sensação de controle. Planejar, organizar e enfrentar problemas tangíveis te aterra quando as emoções parecem ingerenciáveis.",
            "As suas necessidades de autocuidado emocional incluem solidão, realização e tempo de qualidade tranquilo com pessoas de confiança. Você recarrega através de trabalho significativo e encontra conforto na tradição, no ritual e nos ritmos previsíveis de uma vida bem ordenada."
          ]
        }
      ]
    },
    "aquarius": {
      "headline": "Lua em Aquário: O Rebelde Compassivo",
      "intro": "Com a sua Lua em Aquário, o seu mundo emocional opera em uma frequência diferente da da maioria. Regida por Urano, a sua natureza emocional é não convencional, orientada para o intelecto e profundamente humanitária. Você se importa intensamente com a humanidade, embora às vezes tenha dificuldade com a intimidade dos laços emocionais um a um.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "⚡",
          "paragraphs": [
            "A Lua em Aquário processa as emoções através da compreensão intelectual e do distanciamento. Quando algo te comove, o seu primeiro passo é analisar o porquê, entender o padrão e contextualizá-lo dentro de um quadro mais amplo. Isso te dá uma notável clareza emocional, mas pode frustrar parceiros que querem uma resposta puramente emocional.",
            "O seu mundo interior é uma paisagem visionária de ideias, ideais e preocupação humanitária. Você se sente mais emocionalmente conectado quando está trabalhando por uma mudança social, engajado com a sua comunidade ou explorando maneiras não convencionais de viver. As suas emoções estão fundamentalmente ligadas ao seu senso de propósito.",
            "A independência não é apenas uma preferência — é um mecanismo de sobrevivência emocional. Você precisa de bastante espaço dentro dos relacionamentos para manter o seu senso de si mesmo. Exigências emocionais que pareçam controladoras ou possessivas disparam o seu instinto de fuga mais do que quase qualquer outra coisa."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Aquário precisa de um parceiro que seja intelectualmente estimulante, emocionalmente autossuficiente e aberto a estruturas de relacionamento não convencionais. Você não se conforma a roteiros românticos tradicionais, e precisa de um parceiro que valorize a autenticidade acima da convenção.",
            "A amizade é a base dos seus laços românticos. Você precisa genuinamente gostar e respeitar o seu parceiro como pessoa, independentemente da química romântica. Os relacionamentos mais fortes da Lua em Aquário são aqueles construídos sobre interesses intelectuais compartilhados, respeito mútuo e amizade genuína.",
            "Você precisa de um parceiro que não interprete a sua necessidade de espaço como rejeição. O seu ritmo emocional inclui períodos de proximidade e períodos de recolhimento, e um parceiro que consiga navegar essas ondas sem ansiedade conquista a sua devoção duradoura."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da análise intelectual, do engajamento social e da ação humanitária. Quando emocionalmente sobrecarregado, se envolver com uma causa que te importa, ter uma conversa filosófica ou trabalhar em um projeto criativo te ajuda a recuperar o equilíbrio.",
            "As suas necessidades de autocuidado emocional incluem estímulo intelectual, conexão comunitária e liberdade. Você se recupera mais rápido quando sente que a sua vida tem propósito e que a sua singularidade é valorizada em vez de questionada. Evite parceiros e ambientes que tentam te tornar normal."
          ]
        }
      ]
    },
    "pisces": {
      "headline": "Lua em Peixes: O Empata Ilimitado",
      "intro": "Com a sua Lua em Peixes, o seu mundo emocional não tem fronteiras — ele flui para fora, absorvendo os sentimentos de todos ao seu redor, fundindo-se com o inconsciente coletivo e vivenciando todo o espectro da emoção humana como se fosse o seu próprio. Esta é uma das posições emocionalmente mais sensíveis da astrologia.",
      "sections": [
        {
          "title": "Natureza Emocional e Mundo Interior",
          "icon": "🌊",
          "paragraphs": [
            "A Lua em Peixes sente tudo — não apenas as suas próprias emoções, mas as emoções de todos no ambiente, a tristeza em uma notícia, a saudade em uma peça musical. A sua sensibilidade empática é extraordinária, fazendo de você um canal emocional para energias que os outros nem sequer conseguem perceber.",
            "O seu mundo interior é um vasto oceano de imaginação, sensibilidade espiritual e potencial criativo. Você sonha vividamente, intui profundamente e vivencia a realidade como algo mais fluido e interconectado do que a maioria das pessoas consegue conceber. A fronteira entre os seus sentimentos e os sentimentos dos outros é genuinamente porosa.",
            "O desafio da Lua em Peixes é a sobrecarga emocional. Sem limites firmes, você pode ficar inundado pela dor do mundo, levando a tendências escapistas — refugiando-se na fantasia, no sono ou em substâncias para anestesiar a intensidade do que você sente."
          ]
        },
        {
          "title": "O Que Você Precisa no Amor",
          "icon": "💕",
          "paragraphs": [
            "A Lua em Peixes precisa de um parceiro que seja emocionalmente gentil, espiritualmente consciente e disposto a te encontrar nas profundezas. Você precisa de um amor que se sinta transcendente — uma conexão de alma que vá além do físico e do intelectual, para algo sagrado.",
            "Você precisa de um parceiro que proteja a sua sensibilidade sem explorá-la. A sua empatia te torna vulnerável à manipulação emocional, e você precisa de alguém cujas intenções sejam tão puras quanto as suas. Um parceiro que te aterra sem desprezar a sua profundidade emocional é ideal.",
            "A conexão criativa e espiritual importa profundamente. Você precisa de um parceiro que aprecie arte, música, natureza e as dimensões místicas da vida. Um relacionamento que seja puramente prático, sem poesia ou magia, não consegue sustentar o seu espírito."
          ]
        },
        {
          "title": "Processando Sentimentos e Autocuidado",
          "icon": "🧘",
          "paragraphs": [
            "Você processa os sentimentos através da expressão criativa, da prática espiritual e do recolhimento solitário. Quando emocionalmente sobrecarregado, criar arte, ouvir música, meditar ou passar tempo perto da água te ajuda a liberar a energia emocional que você absorveu dos outros.",
            "O seu autocuidado emocional requer limites firmes, solidão regular e válvulas de escape criativas. Você precisa aprender a distinguir os seus sentimentos daqueles que absorveu, e a proteger a sua energia em ambientes que sejam emocionalmente intensos. O sono e o tempo dos sonhos são essenciais para o seu processamento emocional."
          ]
        }
      ]
    }
  },
  "fr": {
    "aries": {
      "headline": "Lune en Bélier : le cœur ardent",
      "intro": "Avec votre Lune en Bélier, votre monde émotionnel est un brasier de passion, d'immédiateté et d'honnêteté brute. Vous ressentez tout à plein volume et l'exprimez tout aussi vite. Vos réactions émotionnelles sont vives, incandescentes et étonnamment transparentes : ce que vous ressentez, tout le monde le sait.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🔥",
          "paragraphs": [
            "La Lune en Bélier traite les émotions par l'action. Quand vous ressentez quelque chose profondément, votre instinct n'est pas de le laisser reposer mais d'agir en conséquence. La tristesse devient détermination. La colère devient carburant. La joie devient aventure spontanée. Vous métabolisez vos sentiments à la vitesse de l'éclair, ce qui fait que vous gardez rarement rancune : vous vous enflammez d'un coup et vous vous apaisez tout aussi vite.",
            "Votre monde intérieur est agité et pionnier. Vous avez besoin de stimulation émotionnelle comme d'autres ont besoin de sécurité émotionnelle. La stagnation est votre pire cauchemar, et vous vous épanouissez quand votre vie affective est dynamique et tournée vers l'avant. Les paysages émotionnels routiniers vous ennuient profondément.",
            "Il y a une pureté enfantine dans votre expression émotionnelle. Vous dites ce que vous ressentez sans filtre, et vous attendez des autres qu'ils fassent de même. Le comportement passif-agressif vous déroute sincèrement, car vous ne pouvez imaginer choisir de cacher ce que vous ressentez alors que l'exprimer est tellement plus simple."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Bélier a besoin d'un partenaire capable de gérer l'intensité sans broncher. Il vous faut quelqu'un qui égale votre énergie, qui s'engage dans un conflit honnête sans le prendre personnellement, et qui respecte votre farouche indépendance. Un partenaire qui tente de domestiquer votre feu ne fera que se brûler.",
            "Vous avez soif d'excitation et de spontanéité dans vos liens affectifs. La prévisibilité vous semble être une mort émotionnelle. Le partenaire qui vous surprend, vous défie et vous tient en éveil gagne votre dévotion la plus profonde. Vous avez besoin de sentir que la relation est une aventure, pas une condamnation.",
            "L'affection physique est essentielle. Vous traitez vos émotions à travers votre corps, et le toucher est la façon dont vous donnez et recevez du réconfort affectif. Un partenaire physiquement distant ou émotionnellement avare vous laissera affamé."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par l'activité physique. La course à pied, les sports de compétition, les arts martiaux ou toute forme de mouvement intense vous aident à métaboliser votre énergie émotionnelle. Quand vous êtes bloqué dans vos ressentis, mettre votre corps en mouvement est le chemin le plus rapide vers la clarté.",
            "Vos besoins en matière de bien-être émotionnel incluent la liberté, l'autonomie et l'espace pour agir sur vos impulsions sans jugement. Vous gagnez aussi à apprendre à rester avec l'inconfort plutôt que de foncer immédiatement vers une solution : certaines émotions doivent être ressenties, pas réparées."
          ]
        }
      ]
    },
    "taurus": {
      "headline": "Lune en Taureau : l'ancre stable",
      "intro": "Avec votre Lune en Taureau, votre monde émotionnel est un jardin luxuriant, abondant et profondément enraciné. La Lune est en exaltation dans le Taureau, ce qui signifie que cette position offre une stabilité émotionnelle exceptionnelle, une profondeur sensuelle et une capacité de contentement que les autres vous envient. Vous vous sentez le plus vous-même quand vos sens sont comblés et que votre monde vous paraît sûr.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🌿",
          "paragraphs": [
            "La Lune en Taureau traite les émotions lentement et en profondeur. Vous ne réagissez pas de façon impulsive : vous laissez les sentiments se déposer, comme un sédiment dans une eau tranquille, jusqu'à les voir clairement. Ce traitement délibéré vous confère une remarquable résilience émotionnelle. Là où d'autres sont ballottés par chaque vague affective, vous restez ancré.",
            "Votre monde intérieur est sensoriel et ancré dans le présent. Vous éprouvez les émotions par le goût, le toucher, le son et l'odorat autant que par la pensée. Un beau morceau de musique peut vous émouvoir aux larmes. Le parfum de la peau de votre partenaire peut vous faire sentir tout à fait chez vous. Vous êtes émotionnellement incarné d'une façon que peu d'autres positions atteignent.",
            "La sécurité est le fondement de votre bien-être émotionnel. Vous avez besoin de savoir que le sol sous vos pieds est solide avant de pouvoir vous détendre dans la vulnérabilité. La stabilité financière, un foyer confortable et des relations fiables ne sont pas des luxes pour vous : ce sont des nécessités émotionnelles."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Taureau a besoin d'un partenaire constant, physiquement affectueux et déterminé à construire une belle vie à deux. Les dynamiques dramatiques faites de ruptures et de retrouvailles ne vous intéressent pas. Vous voulez un amour qui s'approfondit avec le temps, comme un vin qui vieillit en fût de chêne.",
            "Le toucher est votre langage affectif principal. Vous avez besoin d'un contact physique régulier : se tenir la main, des massages du dos, cuisiner ensemble, dormir enlacés. Un partenaire physiquement distant, aussi affectueux soit-il en paroles, laissera votre coupe émotionnelle vide.",
            "Vous montrez votre amour en créant du confort et de l'abondance pour votre partenaire. Cuisiner son plat préféré, entretenir un beau foyer, offrir la sécurité financière : ce sont vos lettres d'amour. Vous avez besoin d'un partenaire qui reconnaît et valorise ces expressions tangibles de dévotion."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par l'ancrage sensoriel. Un bain chaud, un repas gastronomique, du temps dans la nature ou écouter de la musique dans un espace confortable : voilà votre médecine émotionnelle. Sous le stress, votre instinct est de vous retirer dans votre sanctuaire physique et de vous restaurer par le plaisir.",
            "Vos besoins en matière de bien-être émotionnel incluent la stabilité, la routine et la beauté. La perturbation de vos rythmes quotidiens peut être véritablement déstabilisante. Construire une vie qui nourrit constamment vos sens n'est pas un caprice : c'est un entretien essentiel de votre santé émotionnelle."
          ]
        }
      ]
    },
    "gemini": {
      "headline": "Lune en Gémeaux : l'esprit agité",
      "intro": "Avec votre Lune en Gémeaux, votre monde émotionnel est une bibliothèque vaste, interconnectée et sans cesse réorganisée. Vous traitez vos sentiments par le langage, l'analyse et la conversation. Les émotions que les autres vivent comme des sensations viscérales ou des serrements au cœur, vous les vivez comme des flux de pensée qu'il faut articuler avant de pouvoir les comprendre.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "💨",
          "paragraphs": [
            "La Lune en Gémeaux traite les émotions de manière intellectuelle. Quand quelque chose vous émeut, votre première impulsion est de le nommer, de l'analyser et d'en parler. Cela peut vous faire paraître émotionnellement détaché aux yeux des tempéraments plus instinctifs, mais en vérité vous ressentez profondément : vous traitez simplement par l'esprit plutôt que par le corps.",
            "Votre monde intérieur est un dialogue permanent. Il se peut que vous vous parliez littéralement à vous-même, que vous teniez un journal détaillé ou que vous ayez besoin de verbaliser vos sentiments à quelqu'un avant de pouvoir les comprendre. Les émotions tues s'accumulent en vous comme une pression : vous devez les exprimer par les mots pour les relâcher.",
            "La variété émotionnelle est essentielle à votre bien-être. Vous devenez sincèrement anxieux quand votre paysage affectif devient monotone. Vous avez besoin de stimulation intellectuelle, de perspectives nouvelles et de conversations captivantes pour vous sentir émotionnellement vivant."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Gémeaux a besoin d'un partenaire capable de solliciter votre esprit aussi profondément que votre cœur. La compatibilité intellectuelle n'est pas un bonus pour vous : c'est le fondement. Il vous faut quelqu'un à qui parler sans fin, qui vous fait découvrir de nouvelles idées et qui traite les conversations comme une forme d'intimité.",
            "Vous avez besoin de variété émotionnelle au sein de votre relation. Un partenaire qui sait vous surprendre, changer de plans spontanément et aborder les problèmes sous des angles inattendus garde votre monde affectif frais et vivant. La routine et la prévisibilité en amour vous semblent étouffantes.",
            "La communication est votre langage amoureux. Vous avez besoin d'un partenaire qui répond à vos messages avec attention, qui s'engage dans de longues conversations nocturnes et qui valorise l'expression verbale des sentiments. Le silence émotionnel, ou l'attente que vous deviez simplement deviner ce qu'il ressent, vous rend anxieux."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions en parlant, en écrivant et en recueillant des informations. Tenir un journal, la thérapie ou simplement vous confier à un ami de confiance vous aide à donner un sens à votre monde affectif. Lire les expériences d'autres personnes vivant des sentiments semblables peut aussi être profondément rassurant.",
            "Vos besoins en matière de bien-être émotionnel incluent la stimulation mentale, le lien social et la variété. Sous le stress, vous gagnez à changer d'environnement, à apprendre quelque chose de nouveau ou à avoir des interactions sociales légères plutôt qu'à vous isoler. Un mouvement qui sollicite l'esprit, comme se promener dans un quartier inconnu, est particulièrement apaisant."
          ]
        }
      ]
    },
    "cancer": {
      "headline": "Lune en Cancer : le puits profond",
      "intro": "Avec votre Lune en Cancer, votre monde émotionnel est un océan vaste, changeant au gré des marées et d'une profondeur inouïe. La Lune gouverne le Cancer, ce qui en fait sa position la plus puissante et la plus naturelle. Votre intuition émotionnelle est extraordinaire, votre capacité à prendre soin des autres est infinie, et votre besoin de sécurité affective est plus profond que la plupart des gens ne peuvent l'imaginer.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🌊",
          "paragraphs": [
            "La Lune en Cancer ressent tout avec une profondeur et une sensibilité extraordinaires. Vous êtes une éponge émotionnelle, absorbant les humeurs et les sentiments de tous ceux qui vous entourent. Cette empathie est votre plus grand don, mais elle peut aussi vous submerger lorsque vous ne parvenez plus à distinguer vos propres ressentis des résidus émotionnels que vous avez absorbés des autres.",
            "Votre monde intérieur est riche de souvenirs, de nostalgie et d'associations émotionnelles. Une chanson, un parfum ou une qualité particulière de lumière peut vous transporter instantanément à un instant vécu il y a des années, avec tous les sentiments que vous éprouviez alors. Votre mémoire émotionnelle est pour ainsi dire photographique.",
            "La sécurité et l'appartenance sont les piliers de votre bien-être émotionnel. Vous avez besoin de sentir que vous avez un foyer, non seulement un espace physique, mais un réseau de personnes qui vous aiment sans condition. Sans cette base, vous vous sentez à la dérive et anxieux d'une manière difficile à exprimer."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Cancer a besoin d'un partenaire qui offre une sécurité émotionnelle inébranlable. Vous avez besoin de savoir que votre vulnérabilité ne sera jamais utilisée contre vous, que vos humeurs seront accueillies avec patience et que le lien entre vous est véritablement incassable. La confiance est primordiale.",
            "Vous montrez votre amour en prenant soin des autres — cuisiner, veiller sur eux, créer des sanctuaires émotionnels — et vous avez besoin d'un partenaire qui accepte et rend cette attention. Une relation où vous êtes toujours celui qui prend soin et jamais celui dont on prend soin finira par vous épuiser.",
            "La famille et la vie domestique sont au cœur de votre vision romantique. Que vous vouliez ou non des enfants, vous avez besoin d'un partenaire qui accorde de la valeur à la construction d'un foyer commun. Les rituels domestiques partagés — préparer le dîner du dimanche, entretenir le jardin, se blottir sur le canapé — sont votre langage amoureux."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par des activités nourricières et le retrait. Quand vous êtes submergé, vous avez besoin de vous retirer dans votre coquille, un espace sûr et confortable où vous pouvez ressentir vos émotions sans jugement. Cuisiner, prendre des bains et passer du temps près de l'eau vous apaisent profondément.",
            "Votre bien-être émotionnel exige une solitude régulière pour digérer et vous ressourcer. Vous gagnez aussi à disposer d'exutoires créatifs qui vous permettent de canaliser votre vaste énergie émotionnelle : cuisine, jardinage, art, écriture, ou toute forme de création qui transforme le ressenti en quelque chose de tangible et de beau."
          ]
        }
      ]
    },
    "leo": {
      "headline": "Lune en Lion : le cœur généreux",
      "intro": "Avec votre Lune en Lion, votre monde émotionnel est une scène lumineuse, dramatique et profondément soucieuse d'être vue. Vous ressentez avec une intensité théâtrale et vous exprimez avec un flair créatif. Vos besoins émotionnels tournent autour de la reconnaissance, de l'appréciation et de la liberté d'exprimer votre moi authentique sans vous excuser.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "☀️",
          "paragraphs": [
            "La Lune en Lion vit ses émotions dans des couleurs vives et cinématographiques. Vos sentiments ne sont jamais tièdes : votre joie est rayonnante, votre blessure est dévastatrice et votre amour est épique. Vous traitez vos émotions par l'expression, et vous avez besoin d'un public qui apprécie tout le spectre de ce que vous ressentez.",
            "Votre monde intérieur fonctionne à la validation et à l'expression créative de soi. Vous avez besoin de vous sentir vu, admiré et apprécié pour qui vous êtes vraiment — non pour ce que vous faites ou ce que vous apportez, mais pour la lumière unique que vous offrez au monde. Quand ce besoin est comblé, vous êtes la personne la plus généreuse et la plus chaleureuse de la pièce.",
            "La fierté est à la fois votre force et votre vulnérabilité. Vous vous tenez avec dignité et attendez d'être traité avec respect. Humilié ou dédaigné, la blessure vous coupe profondément, car votre sens de vous-même est intimement lié à la façon dont les autres vous perçoivent."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Lion a besoin d'un partenaire qui vous adore — sincèrement, ouvertement et constamment. Vous vous épanouissez avec les compliments, les gestes romantiques et un partenaire qui vous fait sentir la personne la plus spéciale de son univers. Ce n'est pas de la vanité : c'est un besoin émotionnel légitime de reconnaissance.",
            "Vous apportez une immense générosité et chaleur à vos relations, et vous avez besoin d'un partenaire qui égale cette énergie. Vous mettez tout votre cœur à faire sentir à vos proches qu'ils sont célébrés, et un partenaire qui tient cela pour acquis finira par ternir votre éclat.",
            "Le partenariat créatif compte profondément. Vous avez besoin d'un amant qui soutient votre expression de soi, célèbre vos victoires et laisse de la place à votre côté joueur et théâtral. Une relation qui vous fait sentir petit ou ordinaire est une relation que vous ne pouvez pas soutenir."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par l'expression créative et la performance. Quand les émotions vous submergent, les canaliser dans l'art, la musique, la danse ou toute forme de création transforme le ressenti brut en quelque chose de beau et de porteur de sens.",
            "Vos besoins en matière de bien-être émotionnel incluent la reconnaissance, le jeu et le luxe. Vous offrir quelque chose de spécial — une belle tenue, un dîner raffiné, un projet créatif — vous rappelle votre propre valeur. Vous gagnez aussi à passer du temps avec des personnes qui vous apprécient et vous célèbrent sincèrement."
          ]
        }
      ]
    },
    "virgo": {
      "headline": "Lune en Vierge : la guérisseuse dévouée",
      "intro": "Avec votre Lune en Vierge, votre monde émotionnel est un sanctuaire soigneusement entretenu — organisé, orienté vers un but et voué à l'amélioration. Gouvernée par Vesta, votre nature émotionnelle porte une qualité sacrée de service et de précision. Vous traitez vos sentiments par l'analyse et canalisez votre attention en actions concrètes.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🌾",
          "paragraphs": [
            "La Lune en Vierge traite les émotions par une analyse minutieuse. Quand quelque chose vous émeut, votre instinct est de comprendre pourquoi, de classer le sentiment et de déterminer vers quelle action utile il pointe. Cette approche analytique des émotions n'est pas froide : c'est ainsi que vous donnez du sens à un monde intérieur qui vous semble plus gérable une fois organisé.",
            "Votre monde intérieur est un atelier d'amélioration de soi. Vous affinez sans cesse vos habitudes, votre santé, vos routines et vos relations. Gouvernée par Vesta, votre vie émotionnelle a une qualité de dévotion : vous abordez vos engagements avec l'intensité concentrée de quelqu'un qui veille sur une flamme sacrée.",
            "L'anxiété est la compagne d'ombre de votre nature méticuleuse. Votre conscience de l'imperfection peut basculer dans l'inquiétude lorsque vous vous sentez incapable de réparer ce qui vous trouble. Apprendre à accepter que certaines choses échappent à votre contrôle est une pratique émotionnelle continue."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Vierge a besoin d'un partenaire qui remarque et apprécie les petites choses que vous faites. Vous montrez votre amour par des actes de service : vous rappeler sa commande de café, organiser son emploi du temps, remarquer qu'il a besoin d'une pause avant même lui. Un partenaire qui néglige ces gestes vous semble d'une ingratitude dévastatrice.",
            "Vous avez besoin d'ordre, de fiabilité et de conscience de la santé dans vos partenariats affectifs. Le chaos et l'instabilité vous sont sincèrement pénibles. Un partenaire qui prend soin de son propre bien-être et contribue à une vie commune bien organisée gagne votre plus profond respect.",
            "La patience envers votre nature analytique est essentielle. Il se peut que vous ayez besoin de traiter vos sentiments à voix haute, en les examinant sous tous les angles avant d'arriver à une conclusion. Un partenaire capable de faire place à ce processus sans vous presser ni le rejeter est inestimable."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par la routine, l'organisation et l'activité utile. Quand vous êtes émotionnellement submergé, faire le ménage, préparer les repas, dresser des listes ou travailler sur un projet productif vous ancre. L'acte de créer de l'ordre dans votre monde extérieur apaise le désordre de votre monde intérieur.",
            "Votre bien-être émotionnel exige des routines saines, une alimentation propre et des pratiques de pleine conscience. Vous êtes profondément sensible à votre environnement physique et à votre corps, si bien que maintenir la santé et l'ordre n'est pas facultatif : c'est le fondement de votre stabilité émotionnelle."
          ]
        }
      ]
    },
    "libra": {
      "headline": "Lune en Balance : en quête d'harmonie",
      "intro": "Avec votre Lune en Balance, votre monde émotionnel est une galerie d'art, pensée pour la beauté, l'équilibre et l'harmonie élégante. Gouvernée par Junon, votre nature émotionnelle est fondamentalement relationnelle. Vous vous comprenez le plus clairement à travers vos liens avec les autres, et vous aspirez à des partenariats égalitaires, beaux et justes.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "⚖️",
          "paragraphs": [
            "La Lune en Balance traite les émotions à travers le prisme de la relation et de l'équité. Quand quelque chose trouble votre équilibre, votre instinct est de le restaurer — par la conversation, le compromis ou la création de beauté dans votre environnement. Vous êtes émotionnellement allergique au conflit et vous irez loin pour préserver l'harmonie.",
            "Votre monde intérieur aspire à un ordre esthétique. Les environnements laids, les mots durs et la discorde sociale affectent véritablement votre état émotionnel. Gouvernée par Junon, votre bien-être émotionnel est profondément lié à la santé de vos relations engagées : quand vos partenariats prospèrent, vous prospérez.",
            "L'ombre de la Lune en Balance est l'inauthenticité émotionnelle. Votre désir de plaire et de maintenir l'harmonie peut vous conduire à réprimer vos vrais sentiments, à approuver quand vous êtes en désaccord et à vous accommoder quand vous devriez vous affirmer. Apprendre à honorer votre propre vérité émotionnelle est essentiel."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Balance a besoin d'un partenaire sincèrement attaché à l'égalité et au respect mutuel. Vous ne pouvez pas fonctionner dans des relations où existe un net déséquilibre de pouvoir. Vous avez besoin de sentir que vos opinions, vos besoins et vos contributions sont valorisés autant que ceux de votre partenaire.",
            "Le romantisme et la beauté sont des nécessités émotionnelles, pas des luxes. Vous avez besoin d'un partenaire qui entretient l'esthétique de la relation — qui organise des rendez-vous, garde la maison belle et traite le partenariat comme quelque chose dans lequel il vaut la peine d'investir, artistiquement et émotionnellement.",
            "La compatibilité intellectuelle et sociale est cruciale. Vous avez besoin d'un partenaire que vous pouvez présenter fièrement à vos amis, qui s'engage dans des conversations stimulantes et qui partage votre goût pour la culture, la beauté et la grâce sociale."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par la conversation, la création esthétique et l'interaction sociale. Discuter les choses avec un confident de confiance vous aide à trouver la clarté émotionnelle. Créer de la beauté — réagencer votre espace, composer une tenue, faire de l'art — restaure votre équilibre intérieur.",
            "Vos besoins en matière de bien-être émotionnel incluent la beauté, le partenariat et l'harmonie sociale. Sous le stress, vous gagnez à visiter une galerie, à écouter de la belle musique ou à passer du temps avec des personnes émotionnellement équilibrées et pleines de grâce sociale. L'isolement et le conflit sont particulièrement épuisants pour vous."
          ]
        }
      ]
    },
    "scorpio": {
      "headline": "Lune en Scorpion : l'alchimiste des émotions",
      "intro": "Avec votre Lune en Scorpion, votre monde émotionnel est un volcan immensément puissant, en partie caché et capable d'une transformation totale. C'est l'une des positions lunaires les plus intenses de l'astrologie. Vous ressentez avec une profondeur qui ébranle l'âme, et vos expériences émotionnelles vous changent fondamentalement à chaque fois.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🦅",
          "paragraphs": [
            "La Lune en Scorpion vit ses émotions avec une profondeur et une intensité que la plupart des gens ne peuvent concevoir. Là où d'autres sentent des ondulations, vous sentez des raz-de-marée. Votre traitement émotionnel est total : quand vous traversez quelque chose, vous le traversez de part en part, en ressortant transformé de l'autre côté.",
            "Votre monde intérieur est un labyrinthe de sentiments cachés, de perspicacité psychologique et d'intuition puissante. Vous voyez sous la surface de chaque interaction, décelant des motivations et des dynamiques qui échappent totalement aux autres. Cela vous donne une intelligence émotionnelle extraordinaire, mais cela signifie aussi que vous ne pouvez jamais vraiment vous détendre : vous êtes toujours en train de traiter.",
            "La confiance est le thème central de votre vie émotionnelle. Vous avez été blessé assez profondément pour ériger de redoutables murs affectifs, et quiconque veut atteindre votre cœur doit prouver sa loyauté de façon répétée. Mais quand vous accordez votre confiance, votre dévotion est absolue et vos liens affectifs sont incassables."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Scorpion a besoin d'un partenaire capable de gérer l'intensité émotionnelle sans se retirer. Vous avez besoin d'une honnêteté totale, d'une loyauté inébranlable et d'une volonté d'aller en profondeur — émotionnellement, psychologiquement et physiquement. Les relations superficielles vous semblent vaines.",
            "Vous avez besoin d'un partenaire qui n'a pas peur de votre part d'ombre. Vous portez des ténèbres, et vous avez besoin de quelqu'un capable de faire place à tout le spectre de votre expérience émotionnelle sans tenter de vous réparer ou d'alléger l'ambiance. La profondeur émotionnelle est votre langage amoureux.",
            "L'intimité et l'exclusivité sont essentielles. Vous avez besoin de sentir que votre lien affectif est sacré et protégé. Un partenaire qui partage des détails intimes avec d'autres, entretient des limites ambiguës ou vous laisse deviner son engagement déclenche vos insécurités les plus profondes."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par la profondeur, la solitude et la transformation. Quand vous êtes émotionnellement activé, vous avez besoin de temps seul pour descendre dans vos ressentis, y demeurer et ressortir de l'autre côté. Tenir un journal, la thérapie et les pratiques de purge émotionnelle sont des outils inestimables pour vous.",
            "Votre bien-être émotionnel exige de l'intimité, de l'intensité et des exutoires de transformation. Des activités comme la méditation profonde, l'exercice basé sur la puissance, l'étude psychologique ou les œuvres créatives qui canalisent les émotions sombres en art vous aident à métaboliser votre immense énergie émotionnelle."
          ]
        }
      ]
    },
    "sagittarius": {
      "headline": "Lune en Sagittaire : l'éternel optimiste",
      "intro": "Avec votre Lune en Sagittaire, votre monde émotionnel est une route ouverte qui s'étire vers l'horizon. Vous traitez vos sentiments par la philosophie, l'aventure et une foi inébranlable que tout arrive pour une raison. Votre résilience émotionnelle vient de votre capacité à trouver du sens dans chaque expérience.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🏹",
          "paragraphs": [
            "La Lune en Sagittaire traite les émotions par la construction de sens. Quand quelque chose de douloureux se produit, votre instinct est de prendre du recul, de trouver la leçon et de recadrer l'expérience comme faisant partie d'un voyage plus vaste. Cette approche philosophique vous confère une remarquable résilience émotionnelle, même si elle peut parfois vous empêcher de rester pleinement avec des sentiments difficiles.",
            "Votre monde intérieur est expansif et optimiste. Vous croyez sincèrement que la vie est fondamentalement bonne et que chaque revers vous prépare à quelque chose de meilleur. Ce n'est pas de la naïveté : c'est une profonde philosophie émotionnelle qui vous soutient à travers de véritables épreuves.",
            "La liberté est votre besoin émotionnel central. Vous devenez claustrophobe sur le plan émotionnel quand vous vous sentez piégé — par les circonstances, par les relations ou par vos propres pensées négatives. Vous avez besoin d'espace pour vagabonder, physiquement et mentalement, afin de maintenir votre équilibre émotionnel."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Sagittaire a besoin d'un partenaire qui partage votre amour de l'aventure et de la croissance. Il vous faut quelqu'un d'enthousiaste face à l'avenir, ouvert aux nouvelles expériences et prêt à explorer la vie à vos côtés. Un partenaire cramponné à la routine et rétif au changement vous étouffera.",
            "L'honnêteté est primordiale. Vous préférez entendre une vérité douloureuse qu'un mensonge confortable, et vous attendez la même honnêteté radicale de votre partenaire. Vous pouvez pardonner presque tout, sauf la malhonnêteté : la tromperie vous semble une trahison fondamentale de votre confiance.",
            "Vous avez besoin d'un partenaire qui respecte votre indépendance sans la prendre personnellement. Votre besoin d'espace n'est pas le reflet de vos sentiments à son égard : c'est une exigence émotionnelle non négociable. Un partenaire assez sûr de lui pour vous donner cette liberté gagne votre retour dévoué."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par le mouvement, le voyage et l'exploration philosophique. Quand vous êtes émotionnellement submergé, sortir de votre environnement habituel — même un long trajet en voiture ou une randonnée dans la nature — vous aide à vous réinitialiser. Lire de la philosophie, assister à des conférences ou discuter de grandes idées avec des amis apporte aussi un soulagement émotionnel.",
            "Vos besoins en matière de bien-être émotionnel incluent la liberté, l'aventure et le rire. Vous récupérez le plus vite quand vous riez, apprenez ou explorez. Évitez de vous isoler quand vous êtes abattu : votre optimisme est un carburant social, et vous vous rechargez par des interactions positives et expansives."
          ]
        }
      ]
    },
    "capricorn": {
      "headline": "Lune en Capricorne : la forteresse silencieuse",
      "intro": "Avec votre Lune en Capricorne, votre monde émotionnel est une montagne solide, durable et tendue vers quelque chose de plus grand. Gouvernée par Saturne, votre nature émotionnelle est disciplinée, discrète et profondément investie dans la construction d'une vie qui résiste à l'épreuve du temps. Vous ressentez profondément mais exprimez avec parcimonie.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🏔",
          "paragraphs": [
            "La Lune en Capricorne traite les émotions à travers le filtre du pragmatisme et de la responsabilité. Quand quelque chose vous émeut, votre instinct est d'évaluer ce qu'on peut y faire plutôt que de simplement demeurer dans le sentiment. Vous montrez votre amour par l'action et l'accomplissement plutôt que par la démonstration émotionnelle.",
            "Votre monde intérieur est plus sensible que quiconque ne le soupçonne. Derrière votre extérieur posé, vous portez un puits profond de sentiments que vous ne partagez qu'avec ceux qui ont gagné votre confiance absolue. La Lune en Capricorne apprend tôt que la vulnérabilité peut être exploitée, et vous vous protégez en conséquence.",
            "L'accomplissement et la sécurité émotionnelle sont profondément entremêlés chez vous. Vous vous sentez émotionnellement stable quand votre carrière progresse, que vos finances sont solides et que vous remplissez vos responsabilités. Le succès extérieur n'est pas superficiel pour vous : il soutient véritablement votre bien-être émotionnel."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Capricorne a besoin d'un partenaire émotionnellement mûr, fiable et engagé à bâtir un partenariat durable. Les aventures sans lendemain ou les enchevêtrements dramatiques ne vous intéressent pas. Vous voulez un amour pragmatique, durable et fondé sur le respect mutuel.",
            "Vous avez besoin d'un partenaire qui respecte vos limites et ne vous pousse pas à être plus expressif émotionnellement que vous n'êtes à l'aise de l'être. Vous vous dévoilez lentement, et un partenaire qui a la patience d'attendre que les murs tombent découvrira une personne extraordinairement loyale et dévouée.",
            "Les objectifs et les ambitions partagés sont importants. Vous avez besoin d'un partenaire tout aussi déterminé et responsable, quelqu'un qui contribue à parts égales à la construction d'une vie sûre à deux. Vous respectez profondément la compétence et l'autodiscipline chez un partenaire."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par le travail, la structure et la réflexion solitaire. Quand vous êtes émotionnellement submergé, vous jeter dans une activité productive vous aide à retrouver un sentiment de contrôle. Planifier, organiser et vous attaquer à des problèmes concrets vous ancre lorsque les émotions deviennent ingérables.",
            "Vos besoins en matière de bien-être émotionnel incluent la solitude, l'accomplissement et des moments de qualité tranquilles avec des personnes de confiance. Vous vous rechargez par un travail porteur de sens et trouvez du réconfort dans la tradition, le rituel et les rythmes prévisibles d'une vie bien ordonnée."
          ]
        }
      ]
    },
    "aquarius": {
      "headline": "Lune en Verseau : le rebelle bienveillant",
      "intro": "Avec votre Lune en Verseau, votre monde émotionnel fonctionne sur une autre fréquence que la plupart. Gouvernée par Uranus, votre nature émotionnelle est non conventionnelle, orientée vers l'intellect et profondément humaniste. Vous vous souciez intensément de l'humanité tout en peinant parfois avec l'intimité des liens affectifs en tête-à-tête.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "⚡",
          "paragraphs": [
            "La Lune en Verseau traite les émotions par la compréhension intellectuelle et le détachement. Quand quelque chose vous émeut, votre premier réflexe est d'analyser pourquoi, de comprendre le schéma et de le replacer dans un cadre plus large. Cela vous donne une remarquable clarté émotionnelle mais peut frustrer les partenaires qui souhaitent une réponse purement émotionnelle.",
            "Votre monde intérieur est un paysage visionnaire d'idées, d'idéaux et de préoccupation humaniste. Vous vous sentez le plus connecté émotionnellement quand vous œuvrez au changement social, vous engagez dans votre communauté ou explorez des façons de vivre non conventionnelles. Vos émotions sont fondamentalement liées à votre sens du but.",
            "L'indépendance n'est pas qu'une préférence : c'est un mécanisme de survie émotionnelle. Vous avez besoin d'un espace considérable au sein des relations pour maintenir votre sens de vous-même. Les exigences affectives qui paraissent contrôlantes ou possessives déclenchent votre instinct de fuite plus que presque tout le reste."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Verseau a besoin d'un partenaire intellectuellement stimulant, émotionnellement autonome et ouvert à des structures relationnelles non conventionnelles. Vous ne vous conformez pas aux scénarios romantiques traditionnels, et vous avez besoin d'un partenaire qui valorise l'authenticité plutôt que la convention.",
            "L'amitié est le fondement de vos liens amoureux. Vous avez besoin d'apprécier et de respecter sincèrement votre partenaire en tant que personne, indépendamment de l'alchimie romantique. Les plus solides relations de la Lune en Verseau sont celles bâties sur des intérêts intellectuels partagés, le respect mutuel et une amitié sincère.",
            "Vous avez besoin d'un partenaire qui n'interprète pas votre besoin d'espace comme un rejet. Votre rythme émotionnel comporte des périodes de proximité et des périodes de retrait, et un partenaire capable de suivre ces vagues sans anxiété gagne votre dévotion durable."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par l'analyse intellectuelle, l'engagement social et l'action humaniste. Quand vous êtes émotionnellement submergé, vous impliquer dans une cause qui vous tient à cœur, avoir une conversation philosophique ou travailler sur un projet créatif vous aide à retrouver l'équilibre.",
            "Vos besoins en matière de bien-être émotionnel incluent la stimulation intellectuelle, le lien communautaire et la liberté. Vous récupérez le plus vite quand vous sentez que votre vie a un but et que votre singularité est valorisée plutôt que remise en question. Évitez les partenaires et les environnements qui cherchent à vous rendre normal."
          ]
        }
      ]
    },
    "pisces": {
      "headline": "Lune en Poissons : l'empathe sans limites",
      "intro": "Avec votre Lune en Poissons, votre monde émotionnel n'a pas de frontières : il s'écoule vers l'extérieur, absorbant les sentiments de tous ceux qui vous entourent, se fondant dans l'inconscient collectif et éprouvant tout le spectre de l'émotion humaine comme s'il était le vôtre. C'est l'une des positions les plus émotionnellement sensibles de l'astrologie.",
      "sections": [
        {
          "title": "Nature émotionnelle et monde intérieur",
          "icon": "🌊",
          "paragraphs": [
            "La Lune en Poissons ressent tout — non seulement vos propres émotions, mais celles de toutes les personnes dans la pièce, la tristesse d'un fait divers, la nostalgie d'un morceau de musique. Votre sensibilité empathique est extraordinaire, faisant de vous un canal émotionnel pour des énergies que d'autres ne peuvent même pas percevoir.",
            "Votre monde intérieur est un vaste océan d'imagination, de sensibilité spirituelle et de potentiel créatif. Vous rêvez avec vivacité, intuitez profondément et vivez la réalité comme plus fluide et interconnectée que la plupart des gens ne peuvent le concevoir. La frontière entre vos sentiments et ceux des autres est véritablement poreuse.",
            "Le défi de la Lune en Poissons est le débordement émotionnel. Sans limites solides, vous pouvez être inondé par la douleur du monde, ce qui conduit à des tendances d'évasion : vous réfugier dans le fantasme, le sommeil ou des substances pour anesthésier l'intensité de ce que vous ressentez."
          ]
        },
        {
          "title": "Ce dont vous avez besoin en amour",
          "icon": "💕",
          "paragraphs": [
            "La Lune en Poissons a besoin d'un partenaire émotionnellement doux, spirituellement conscient et prêt à vous rejoindre dans les profondeurs. Vous avez besoin d'un amour qui semble transcendant — une connexion d'âme qui dépasse le physique et l'intellectuel pour atteindre quelque chose de sacré.",
            "Vous avez besoin d'un partenaire qui protège votre sensibilité sans l'exploiter. Votre empathie vous rend vulnérable à la manipulation émotionnelle, et vous avez besoin de quelqu'un dont les intentions sont aussi pures que les vôtres. Un partenaire qui vous ancre sans rejeter votre profondeur émotionnelle est idéal.",
            "La connexion créative et spirituelle compte profondément. Vous avez besoin d'un partenaire qui apprécie l'art, la musique, la nature et les dimensions mystiques de la vie. Une relation purement pratique, sans poésie ni magie, ne peut nourrir votre esprit."
          ]
        },
        {
          "title": "Gérer ses émotions et prendre soin de soi",
          "icon": "🧘",
          "paragraphs": [
            "Vous traitez vos émotions par l'expression créative, la pratique spirituelle et le retrait solitaire. Quand vous êtes émotionnellement submergé, créer de l'art, écouter de la musique, méditer ou passer du temps près de l'eau vous aide à relâcher l'énergie émotionnelle que vous avez absorbée des autres.",
            "Votre bien-être émotionnel exige des limites solides, une solitude régulière et des exutoires créatifs. Vous devez apprendre à distinguer vos sentiments de ceux que vous avez absorbés, et à protéger votre énergie dans les environnements émotionnellement intenses. Le sommeil et le temps du rêve sont essentiels à votre traitement émotionnel."
          ]
        }
      ]
    }
  }
};

/** Localized Moon-sign content, or null if the locale/sign is unknown. */
export function getLocalizedMoonContent(
  locale: SeoLocale,
  sign: ZodiacSign,
): LocalizedMoonSign | null {
  return CONTENT[locale]?.[sign] ?? null;
}
