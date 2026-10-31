import { ltr, type Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

export const memoryQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'mem-offset-bits': {
      prompt: 'גודל ה-page הוא 4 KiB, כלומר 4096 בתים. כמה ביטים של כתובת וירטואלית משמשים ל-offset בתוך ה-page?',
      unit: 'ביטים',
      explanation: `${ltr('4096 = 2^12')}, ולכן 12 הביטים הנמוכים בוחרים את הבית בתוך ה-page. שאר הביטים, הגבוהים, הם מספר ה-page.`,
    },
    'mem-translate': {
      prompt: 'גודל ה-page הוא 256 בתים, ו-page 3 ממופה ל-frame 7. לאיזו כתובת פיזית מתורגמת הכתובת הווירטואלית 800?',
      explanation: `${ltr('800 / 256')} נותן page 3 עם offset של ${ltr('800 - 768 = 32')}. Frame 7 מתחיל ב-${ltr('7 x 256 = 1792')}, ולכן הכתובת הפיזית היא ${ltr('1792 + 32 = 1824')}.`,
    },
    'mem-fifo-faults': {
      prompt: 'עם 3 frames (ריקים בהתחלה) ו-replacement מסוג FIFO, כמה page faults מתרחשים?',
      scenario: `מחרוזת ההפניות: ${ltr('1 2 3 4 1 2 5 1 2 3 4 5')}`,
      unit: 'page faults',
      explanation: `ב-FIFO יש fault על ${ltr('1,2,3,4,1,2,5')}, hit על ${ltr('1,2')}, ואז fault על ${ltr('3,4')} (5 עדיין בזיכרון): בסך הכול 9 faults. באופן מפתיע, עם 4 frames מגיע FIFO ל-10 faults: זו Belady's anomaly.`,
    },
    'mem-opt': {
      prompt: 'למה אלגוריתם ה-page replacement האופטימלי (OPT) לא משמש במערכות הפעלה אמיתיות?',
      options: ['החישוב שלו איטי מדי', 'הוא צריך לדעת מראש את הגישות העתידיות לזיכרון', 'הוא גורם ל-Belady\'s anomaly', 'הוא עובד רק עם frame אחד'],
      explanation: 'OPT מפנה את ה-page שלא ישמש הכי הרבה זמן, וזה דורש לדעת את העתיד. משתמשים בו כנקודת השוואה; בפועל משתמשים ב-LRU ובקירובים כמו clock.',
    },
    'mem-external-frag': {
      prompt: 'יש בסך הכול 50 KB פנויים, אבל בקשה ל-20 KB נכשלת. מה הסיבה הסבירה ביותר?',
      options: ['Fragmentation פנימית', 'Fragmentation חיצונית', 'Page fault', 'Thrashing'],
      explanation: 'הזיכרון הפנוי מפוצל להרבה חורים קטנים, ואף אחד מהם אינו בגודל 20 KB. Compaction או paging (שלא צריך זיכרון פיזי רציף) פותרים את זה.',
    },
    'mem-fault-steps': {
      prompt: 'סדרו את שלבי הטיפול ב-page fault.',
      items: [
        'ה-CPU ניגש ל-page שמסומן כ-invalid ב-page table',
        'ה-MMU מעלה trap של page fault אל ה-kernel',
        'ה-kernel מוצא frame פנוי (ומפנה קורבן אם צריך)',
        'ה-page נקרא מהדיסק אל ה-frame',
        'הרשומה ב-page table מתעדכנת ומסומנת כ-valid',
        'הפקודה שגרמה ל-fault מורצת מחדש',
      ],
      explanation: 'החומרה מזהה שה-page חסר, ה-kernel מביא אותו מהאחסון, מתקן את המיפוי ומריץ שוב את הפקודה כאילו לא קרה כלום.',
    },
  },
  ar: {
    'mem-offset-bits': {
      prompt: 'حجم الـ page هو 4 KiB، أي 4096 بايت. كم بتًا من العنوان الافتراضي يُستخدم للـ offset داخل الـ page؟',
      unit: 'بت',
      explanation: `${ltr('4096 = 2^12')}، لذا تحدد البتات الـ 12 الدنيا البايت داخل الـ page. أما البتات العليا المتبقية فهي رقم الـ page.`,
    },
    'mem-translate': {
      prompt: 'حجم الـ page هو 256 بايت، والـ page 3 مربوط بالـ frame 7. إلى أي عنوان فعلي يُترجم العنوان الافتراضي 800؟',
      explanation: `${ltr('800 / 256')} يعطي page 3 مع offset قدره ${ltr('800 - 768 = 32')}. يبدأ الـ frame 7 عند ${ltr('7 x 256 = 1792')}، لذا العنوان الفعلي هو ${ltr('1792 + 32 = 1824')}.`,
    },
    'mem-fifo-faults': {
      prompt: 'مع 3 frames (فارغة في البداية) واستبدال من نوع FIFO، كم page fault يحدث؟',
      scenario: `سلسلة المراجع: ${ltr('1 2 3 4 1 2 5 1 2 3 4 5')}`,
      unit: 'page faults',
      explanation: `يحدث في FIFO ‏fault عند ${ltr('1,2,3,4,1,2,5')}، ثم hit عند ${ltr('1,2')}، ثم fault عند ${ltr('3,4')} (لا يزال 5 في الذاكرة): المجموع 9 faults. والغريب أن FIFO مع 4 frames يصل إلى 10 faults: هذه هي Belady's anomaly.`,
    },
    'mem-opt': {
      prompt: 'لماذا لا تستخدم أنظمة التشغيل الحقيقية خوارزمية الـ page replacement المثلى (OPT)؟',
      options: ['حسابها بطيء جدًا', 'تحتاج إلى معرفة الوصولات المستقبلية إلى الذاكرة', 'تسبب Belady\'s anomaly', 'لا تعمل إلا مع frame واحد'],
      explanation: 'تُخرج OPT الـ page الذي لن يُستخدم لأطول مدة، وهذا يتطلب معرفة المستقبل. تُستخدم كمعيار للمقارنة؛ أما عمليًا فتُستخدم LRU وتقريبات مثل clock.',
    },
    'mem-external-frag': {
      prompt: 'المساحة الحرة الإجمالية 50 KB، لكن طلبًا بحجم 20 KB يفشل. ما السبب الأرجح؟',
      options: ['Fragmentation داخلي', 'Fragmentation خارجي', 'Page fault', 'Thrashing'],
      explanation: 'المساحة الحرة مقسَّمة إلى فجوات صغيرة كثيرة، ولا تبلغ أي منها 20 KB. يحل الـ compaction أو الـ paging (الذي لا يحتاج إلى ذاكرة فعلية متصلة) هذه المشكلة.',
    },
    'mem-fault-steps': {
      prompt: 'رتّب خطوات معالجة الـ page fault.',
      items: [
        'تصل الـ CPU إلى page معلَّم بأنه invalid في الـ page table',
        'يرفع الـ MMU ‏trap من نوع page fault إلى الـ kernel',
        'يجد الـ kernel ‏frame حرًا (ويُخرج ضحية إذا لزم الأمر)',
        'يُقرأ الـ page من القرص إلى الـ frame',
        'يُحدَّث سجل الـ page table ويُعلَّم بأنه valid',
        'يُعاد تنفيذ التعليمة التي سببت الـ fault',
      ],
      explanation: 'يكتشف العتاد أن الـ page مفقود، فيجلبه الـ kernel من وحدة التخزين، ويصلح الربط، ثم يعيد تنفيذ التعليمة كأن شيئًا لم يحدث.',
    },
  },
  es: {
    'mem-offset-bits': {
      prompt: 'Las pages son de 4 KiB (4096 bytes). ¿Cuántos bits de una dirección virtual se usan para el offset dentro de la page?',
      unit: 'bits',
      explanation: '4096 = 2^12, así que los 12 bits bajos seleccionan el byte dentro de la page. Los bits altos restantes son el número de page.',
    },
    'mem-translate': {
      prompt: 'El tamaño de page es de 256 bytes y la page 3 está asignada al frame 7. ¿A qué dirección física se traduce la dirección virtual 800?',
      explanation: '800 / 256 = page 3, offset 800 - 768 = 32. El frame 7 empieza en 7 x 256 = 1792, así que la dirección física es 1792 + 32 = 1824.',
    },
    'mem-fifo-faults': {
      prompt: 'Con 3 frames (inicialmente vacíos) y reemplazo FIFO, ¿cuántos page faults se producen?',
      scenario: 'Cadena de referencias: 1 2 3 4 1 2 5 1 2 3 4 5',
      unit: 'page faults',
      explanation: 'FIFO tiene fault en 1,2,3,4,1,2,5, hit en 1,2, y luego fault en 3,4 (5 sigue en memoria): 9 faults. Curiosamente, con 4 frames FIFO tiene 10 faults: es la Belady\'s anomaly.',
    },
    'mem-opt': {
      prompt: '¿Por qué el algoritmo de page replacement óptimo (OPT) no se usa en sistemas operativos reales?',
      options: ['Es demasiado lento de calcular', 'Necesita conocer los accesos futuros a memoria', 'Provoca la Belady\'s anomaly', 'Solo funciona con un frame'],
      explanation: 'OPT expulsa la page que no se usará durante más tiempo, lo que exige conocer el futuro. Se usa como referencia de comparación; en la práctica se usan LRU y aproximaciones como clock.',
    },
    'mem-external-frag': {
      prompt: 'Hay 50 KB libres en total, pero una petición de 20 KB falla. ¿Cuál es la causa más probable?',
      options: ['Fragmentation interna', 'Fragmentation externa', 'Un page fault', 'Thrashing'],
      explanation: 'El espacio libre está dividido en muchos huecos pequeños y ninguno llega a 20 KB. La compactación o el paging (que no necesita memoria física contigua) lo resuelven.',
    },
    'mem-fault-steps': {
      prompt: 'Ordena los pasos para atender un page fault.',
      items: [
        'La CPU accede a una page marcada como invalid en la page table',
        'La MMU lanza un trap de page fault al kernel',
        'El kernel busca un frame libre (expulsando una víctima si hace falta)',
        'La page se lee del disco al frame',
        'La entrada de la page table se actualiza y se marca como valid',
        'La instrucción que causó el fault se reinicia',
      ],
      explanation: 'El hardware detecta que falta la page, el kernel la trae del almacenamiento, corrige la asignación y vuelve a ejecutar la instrucción como si nada hubiera pasado.',
    },
  },
}

export const memoryChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-mem-fault': ['לגרום ל-page fault ולטפל בו', 'הקלידו כתובת שנופלת ב-page שמסומן "i" (invalid), ואז לחצו על "טיפול ב-page fault".'],
    'ch-mem-lru': ['למצוא מחרוזת הפניות שבה ל-LRU יש לפחות 4 faults פחות מאשר ל-FIFO', 'במחרוזת ברירת המחדל הפער הוא 3. LRU מנצח כשכמה pages נמצאים בשימוש כל הזמן; FIFO מפנה אותם בכל זאת כי הם נטענו מזמן.'],
    'ch-mem-belady': ['להראות את Belady\'s anomaly: יותר frames, יותר faults ב-FIFO', 'לחצו על "הדוגמה של Belady" ובחרו 3 frames עם FIFO.'],
    'ch-mem-frag': ['לגרום להקצאה להיכשל למרות שיש מספיק זיכרון פנוי בסך הכול', 'טענו את הדוגמה המפוצלת ובקשו 25 KB.'],
  },
  ar: {
    'ch-mem-fault': ['تسبّب في page fault وعالجه', 'اكتب عنوانًا يقع في page معلَّم بـ "i" (invalid)، ثم اضغط "معالجة الـ page fault".'],
    'ch-mem-lru': ['جد سلسلة مراجع يكون فيها لـ LRU أقل من FIFO بـ 4 faults على الأقل', 'الفرق في السلسلة الافتراضية 3. تتفوق LRU عندما تُستخدم بضع pages باستمرار؛ أما FIFO فتُخرجها على أي حال لأنها حُمّلت منذ وقت طويل.'],
    'ch-mem-belady': ['أظهر Belady\'s anomaly: frames أكثر، faults أكثر في FIFO', 'اضغط "مثال Belady" واختر 3 frames مع FIFO.'],
    'ch-mem-frag': ['اجعل تخصيصًا يفشل رغم وجود ذاكرة حرة كافية إجمالًا', 'حمّل المثال المجزّأ واطلب 25 KB.'],
  },
  es: {
    'ch-mem-fault': ['Provocar y atender un page fault', 'Escribe una dirección que caiga en una page marcada con "i" (invalid) y pulsa "Atender page fault".'],
    'ch-mem-lru': ['Encontrar una cadena de referencias donde LRU tenga al menos 4 faults menos que FIFO', 'La cadena por defecto tiene una diferencia de 3. LRU gana cuando unas pocas pages se reutilizan constantemente; FIFO las expulsa igualmente porque se cargaron hace mucho.'],
    'ch-mem-belady': ['Mostrar la Belady\'s anomaly: más frames, más faults con FIFO', 'Pulsa "Ejemplo de Belady" y elige 3 frames con FIFO.'],
    'ch-mem-frag': ['Hacer que una asignación falle aunque haya suficiente memoria libre en total', 'Carga el ejemplo fragmentado y pide 25 KB.'],
  },
}

interface GenText {
  trPrompt: (pageSize: number, va: number) => string
  trTable: string
  invalid: string
  trExplain: (va: number, pageSize: number, page: number, offset: number, frame: number, physical: number) => string
  faultsPrompt: (frames: number, algo: 'FIFO' | 'LRU' | 'OPT') => string
  refString: string
  faultsUnit: string
  totalFaults: (n: number) => string
  offsetPrompt: (pageSize: string) => string
  bitsUnit: string
  offsetExplain: (pageSize: number, k: number) => string
  pageBitsPrompt: (bitsTotal: number, pageSize: string) => string
  pageBitsExplain: (k: number, pageSize: number, bitsTotal: number) => string
  /** Wraps number sequences and table lines that must stay left to right. */
  seq: (s: string) => string
}

export const memoryGenText: Localized<GenText> = {
  en: {
    trPrompt: (ps, va) => `Page size is ${ps} bytes. What physical address does virtual address ${va} map to?`,
    trTable: 'Page table (page -> frame):',
    invalid: 'invalid',
    trExplain: (va, ps, page, offset, frame, phys) =>
      `${va} / ${ps} = page ${page}, offset ${offset}. Page ${page} is in frame ${frame}, so the physical address is ${frame} x ${ps} + ${offset} = ${phys}.`,
    faultsPrompt: (frames, algo) => `With ${frames} empty frames and ${algo === 'OPT' ? 'Optimal' : algo} replacement, how many page faults occur?`,
    refString: 'Reference string',
    faultsUnit: 'faults',
    totalFaults: (n) => `Total faults: ${n}.`,
    offsetPrompt: (ps) => `Pages are ${ps} bytes. How many bits of the address are the page offset?`,
    bitsUnit: 'bits',
    offsetExplain: (ps, k) => `${ps} = 2^${k}, so ${k} bits are needed to address every byte within a page.`,
    pageBitsPrompt: (bits, ps) => `A ${bits}-bit virtual address space uses ${ps}-byte pages. How many bits are the page number?`,
    pageBitsExplain: (k, ps, bits) => `The offset takes ${k} bits (2^${k} = ${ps}); the remaining ${bits} - ${k} = ${bits - k} bits select the page.`,
    seq: (s) => s,
  },
  he: {
    trPrompt: (ps, va) => `גודל ה-page הוא ${ps} בתים. לאיזו כתובת פיזית ממופה הכתובת הווירטואלית ${va}?`,
    trTable: 'Page table (page -> frame):',
    invalid: 'invalid',
    trExplain: (va, ps, page, offset, frame, phys) =>
      `${ltr(`${va} / ${ps}`)} נותן page ${page} עם offset ${offset}. Page ${page} נמצא ב-frame ${frame}, ולכן הכתובת הפיזית היא ${ltr(`${frame} x ${ps} + ${offset} = ${phys}`)}.`,
    faultsPrompt: (frames, algo) => `עם ${frames} frames ריקים ו-replacement מסוג ${algo}, כמה page faults מתרחשים?`,
    refString: 'מחרוזת ההפניות',
    faultsUnit: 'page faults',
    totalFaults: (n) => `סך הכול faults: ${n}.`,
    offsetPrompt: (ps) => `גודל ה-pages הוא ${ltr(ps)} בתים. כמה ביטים של הכתובת הם ה-offset בתוך ה-page?`,
    bitsUnit: 'ביטים',
    offsetExplain: (ps, k) => `${ltr(`${ps} = 2^${k}`)}, ולכן צריך ${k} ביטים כדי לפנות לכל בית בתוך page.`,
    pageBitsPrompt: (bits, ps) => `מרחב כתובות וירטואלי של ${bits} ביט משתמש ב-pages בגודל ${ltr(ps)} בתים. כמה ביטים הם מספר ה-page?`,
    pageBitsExplain: (k, ps, bits) => `ה-offset תופס ${k} ביטים (${ltr(`2^${k} = ${ps}`)}); שאר ${ltr(`${bits} - ${k} = ${bits - k}`)} הביטים בוחרים את ה-page.`,
    seq: ltr,
  },
  ar: {
    trPrompt: (ps, va) => `حجم الـ page هو ${ps} بايت. إلى أي عنوان فعلي يُربط العنوان الافتراضي ${va}؟`,
    trTable: 'الـ page table (page -> frame):',
    invalid: 'invalid',
    trExplain: (va, ps, page, offset, frame, phys) =>
      `${ltr(`${va} / ${ps}`)} يعطي page ${page} مع offset ${offset}. الـ page ${page} موجود في الـ frame ${frame}، لذا العنوان الفعلي هو ${ltr(`${frame} x ${ps} + ${offset} = ${phys}`)}.`,
    faultsPrompt: (frames, algo) => `مع ${frames} frames فارغة واستبدال من نوع ${algo}، كم page fault يحدث؟`,
    refString: 'سلسلة المراجع',
    faultsUnit: 'page faults',
    totalFaults: (n) => `مجموع الـ faults: ${n}.`,
    offsetPrompt: (ps) => `حجم الـ pages هو ${ltr(ps)} بايت. كم بتًا من العنوان يشكّل الـ offset داخل الـ page؟`,
    bitsUnit: 'بت',
    offsetExplain: (ps, k) => `${ltr(`${ps} = 2^${k}`)}، لذا نحتاج إلى ${k} بت لعنونة كل بايت داخل الـ page.`,
    pageBitsPrompt: (bits, ps) => `فضاء عناوين افتراضي بطول ${bits} بت يستخدم pages بحجم ${ltr(ps)} بايت. كم بتًا يشكّل رقم الـ page؟`,
    pageBitsExplain: (k, ps, bits) => `يأخذ الـ offset ‏${k} بت (${ltr(`2^${k} = ${ps}`)})؛ والبتات المتبقية ${ltr(`${bits} - ${k} = ${bits - k}`)} تحدد الـ page.`,
    seq: ltr,
  },
  es: {
    trPrompt: (ps, va) => `El tamaño de page es de ${ps} bytes. ¿A qué dirección física corresponde la dirección virtual ${va}?`,
    trTable: 'Page table (page -> frame):',
    invalid: 'invalid',
    trExplain: (va, ps, page, offset, frame, phys) =>
      `${va} / ${ps} = page ${page}, offset ${offset}. La page ${page} está en el frame ${frame}, así que la dirección física es ${frame} x ${ps} + ${offset} = ${phys}.`,
    faultsPrompt: (frames, algo) => `Con ${frames} frames vacíos y reemplazo ${algo === 'OPT' ? 'óptimo (OPT)' : algo}, ¿cuántos page faults se producen?`,
    refString: 'Cadena de referencias',
    faultsUnit: 'page faults',
    totalFaults: (n) => `Total de faults: ${n}.`,
    offsetPrompt: (ps) => `Las pages son de ${ps} bytes. ¿Cuántos bits de la dirección forman el offset dentro de la page?`,
    bitsUnit: 'bits',
    offsetExplain: (ps, k) => `${ps} = 2^${k}, así que se necesitan ${k} bits para direccionar cada byte dentro de una page.`,
    pageBitsPrompt: (bits, ps) => `Un espacio de direcciones virtuales de ${bits} bits usa pages de ${ps} bytes. ¿Cuántos bits forman el número de page?`,
    pageBitsExplain: (k, ps, bits) => `El offset ocupa ${k} bits (2^${k} = ${ps}); los ${bits} - ${k} = ${bits - k} bits restantes seleccionan la page.`,
    seq: (s) => s,
  },
}
