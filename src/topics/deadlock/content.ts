import { ltr, type Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

export const deadlockQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'dl-coffman': {
      prompt: 'מה מהבאים איננו אחד מארבעת התנאים ההכרחיים ל-deadlock?',
      options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'],
      explanation: 'התנאים הם mutual exclusion, hold and wait, היעדר preemption (no preemption) ו-circular wait. אם אפשר לקחת משאבים בכוח (preemption), אפשר לשבור deadlock.',
    },
    'dl-ordering': {
      prompt: 'כל thread תופס locks בסדר עולה של מספר ה-lock. איזה תנאי של deadlock זה שובר?',
      options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
      explanation: 'כדי שייווצר מעגל, thread כלשהו היה צריך להחזיק lock עם מספר גבוה ולחכות ל-lock עם מספר נמוך יותר, וזה בדיוק מה שהסדר אוסר. סדר קבוע של locks הוא שיטת מניעת ה-deadlock הנפוצה ביותר בפועל.',
    },
    'dl-cycle-multi': {
      prompt: 'לסוג משאב מסוים יש 2 מופעים, וב-resource allocation graph יש מעגל. האם המערכת ב-deadlock?',
      options: ['כן, תמיד', 'לא בהכרח: כשיש כמה מופעים, מעגל הוא תנאי הכרחי אבל לא מספיק', 'לא, אף פעם', 'רק אם יש יותר מ-2 processes'],
      explanation: 'כשלכל משאב יש מופע יחיד, מעגל פירושו deadlock. כשיש כמה מופעים, process שמחוץ למעגל עשוי לשחרר מופע ולשבור אותו, ולכן צריך אלגוריתם זיהוי.',
    },
    'dl-need': {
      prompt: 'ב-banker\'s algorithm, ל-process יש Max = (7, 5, 3) ו-Allocation = (0, 1, 0). מהו סך ה-Need שלו בכל שלושת סוגי המשאבים?',
      unit: 'יחידות',
      explanation: `${ltr('Need = Max - Allocation = (7, 4, 3)')}, ו-${ltr('7 + 4 + 3 = 14')}.`,
    },
    'dl-unsafe': {
      prompt: 'בדיקת הבטיחות של ה-banker לא מוצאת safe sequence. מה המשמעות?',
      options: [
        'המערכת כבר נמצאת ב-deadlock',
        'המצב אינו safe: ייתכן deadlock אם ה-processes יבקשו את המקסימום שלהם, ולכן צריך לסרב לבקשה שהובילה לכאן',
        'Process קרס',
        'יש באג באלגוריתם',
      ],
      explanation: 'Unsafe זה לא אותו דבר כמו deadlock: ייתכן שה-processes ישחררו משאבים מוקדם. אבל מערכת ההפעלה כבר לא יכולה להבטיח שכולם יסיימו, ולכן ה-banker מסרב לבקשות שיובילו למצב unsafe.',
    },
  },
  ar: {
    'dl-coffman': {
      prompt: 'أيٌّ مما يلي ليس من الشروط الأربعة الضرورية لحدوث deadlock؟',
      options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'],
      explanation: 'الشروط هي mutual exclusion و hold and wait وغياب الـ preemption ‏(no preemption) و circular wait. إذا أمكن انتزاع الموارد (preemption)، أمكن كسر الـ deadlock.',
    },
    'dl-ordering': {
      prompt: 'كل thread يحجز الـ locks بترتيب تصاعدي حسب رقم الـ lock. أي شرط من شروط الـ deadlock يكسره ذلك؟',
      options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
      explanation: 'لكي تتكوّن دورة، يجب أن يمسك thread ما بـ lock ذي رقم أعلى بينما ينتظر lock ذا رقم أدنى، وهذا ما يمنعه الترتيب. ترتيب الـ locks هو أكثر تقنيات منع الـ deadlock شيوعًا في الممارسة.',
    },
    'dl-cycle-multi': {
      prompt: 'لنوع من الموارد نسختان، ويحتوي الـ resource allocation graph على دورة. هل النظام في حالة deadlock؟',
      options: ['نعم، دائمًا', 'ليس بالضرورة: مع وجود عدة نسخ تكون الدورة شرطًا ضروريًا لكنه غير كافٍ', 'لا، أبدًا', 'فقط إذا كان هناك أكثر من 2 processes'],
      explanation: 'عندما يكون لكل مورد نسخة واحدة، تعني الدورة وجود deadlock. أما مع عدة نسخ، فقد يحرّر process خارج الدورة نسخةً فيكسرها، لذا تحتاج إلى خوارزمية كشف.',
    },
    'dl-need': {
      prompt: 'في الـ banker\'s algorithm، لدى process قيمة Max = (7, 5, 3) و Allocation = (0, 1, 0). ما مجموع الـ Need لديه عبر أنواع الموارد الثلاثة؟',
      unit: 'وحدات',
      explanation: `${ltr('Need = Max - Allocation = (7, 4, 3)')}، و ${ltr('7 + 4 + 3 = 14')}.`,
    },
    'dl-unsafe': {
      prompt: 'لا يجد فحص الأمان في الـ banker أي safe sequence. ماذا يعني ذلك؟',
      options: [
        'النظام في حالة deadlock بالفعل',
        'الحالة غير آمنة (unsafe): قد يحدث deadlock إذا طلبت الـ processes الحد الأقصى، لذا يجب رفض الطلب الذي أدى إلى هنا',
        'تعطّل أحد الـ processes',
        'يوجد خطأ في الخوارزمية',
      ],
      explanation: 'الحالة unsafe ليست هي نفسها الـ deadlock: قد تحرّر الـ processes مواردها مبكرًا. لكن نظام التشغيل لم يعد قادرًا على ضمان أن ينتهي الجميع، لذا يرفض الـ banker الطلبات التي تؤدي إلى حالة unsafe.',
    },
  },
  es: {
    'dl-coffman': {
      prompt: '¿Cuál de estas NO es una de las cuatro condiciones necesarias para un deadlock?',
      options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'],
      explanation: 'Las condiciones son mutual exclusion, hold and wait, NO preemption y circular wait. Si los recursos se pueden quitar (preemption), un deadlock se puede romper.',
    },
    'dl-ordering': {
      prompt: 'Todos los threads adquieren los locks en orden creciente de número de lock. ¿Qué condición de deadlock rompe esto?',
      options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'],
      explanation: 'Para que hubiera un ciclo, algún thread tendría que tener un lock de número más alto mientras espera uno más bajo, y eso es justo lo que el orden prohíbe. Ordenar los locks es la técnica de prevención de deadlock más común en la práctica.',
    },
    'dl-cycle-multi': {
      prompt: 'Un tipo de recurso tiene 2 instancias y el resource allocation graph contiene un ciclo. ¿Está el sistema en deadlock?',
      options: ['Sí, siempre', 'No necesariamente: con varias instancias un ciclo es necesario pero no suficiente', 'No, nunca', 'Solo si hay más de 2 processes'],
      explanation: 'Con recursos de una sola instancia, un ciclo significa deadlock. Con varias instancias, un process fuera del ciclo puede liberar una instancia y romperlo, así que necesitas un algoritmo de detección.',
    },
    'dl-need': {
      prompt: "En el banker's algorithm, un process tiene Max = (7, 5, 3) y Allocation = (0, 1, 0). ¿Cuál es su Need total sumando los tres tipos de recurso?",
      unit: 'unidades',
      explanation: 'Need = Max - Allocation = (7, 4, 3), y 7 + 4 + 3 = 14.',
    },
    'dl-unsafe': {
      prompt: 'La comprobación de seguridad del banker no encuentra ninguna safe sequence. ¿Qué significa eso?',
      options: [
        'El sistema ya está en deadlock',
        'El estado es unsafe: puede haber deadlock si los processes piden su máximo, así que hay que rechazar la petición que llevó hasta aquí',
        'Un process ha fallado',
        'Hay un bug en el algoritmo',
      ],
      explanation: 'Unsafe no es lo mismo que deadlock: los processes podrían liberar recursos antes. Pero el sistema operativo ya no puede garantizar que todos terminen, así que el banker rechaza las peticiones que llevarían a un estado unsafe.',
    },
  },
}

export const deadlockChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-dl-deadlock': ['ליצור deadlock', 'P1 לוקח את R1, ‏P2 לוקח את R2, ואז P1 מבקש את R2 ו-P2 מבקש את R1.'],
    'ch-dl-three': ['ליצור מעגל deadlock שכולל את כל 3 ה-processes', 'תנו לכל process משאב אחד, ואז שכל אחד יבקש את המשאב הבא במעגל.'],
    'ch-dl-safe': ['למצוא safe sequence עם ה-banker\'s algorithm', 'טענו את הדוגמה מספר הלימוד והריצו את בדיקת הבטיחות.'],
    'ch-dl-unsafe': ['להביא את המערכת למצב unsafe', 'הקטינו את Available או הגדילו ערך של Max עד שלא קיים safe sequence.'],
  },
  ar: {
    'ch-dl-deadlock': ['إنشاء deadlock', 'يأخذ P1 المورد R1، ويأخذ P2 المورد R2، ثم يطلب P1 المورد R2 ويطلب P2 المورد R1.'],
    'ch-dl-three': ['إنشاء دورة deadlock تشمل الـ processes الثلاثة', 'أعطِ كل process موردًا واحدًا، ثم اجعل كلًّا منها يطلب المورد التالي في الدائرة.'],
    'ch-dl-safe': ['إيجاد safe sequence باستخدام الـ banker\'s algorithm', 'حمّل مثال الكتاب وشغّل فحص الأمان.'],
    'ch-dl-unsafe': ['جعل النظام في حالة unsafe', 'قلّل Available أو ارفع إحدى قيم Max حتى لا يبقى أي safe sequence.'],
  },
  es: {
    'ch-dl-deadlock': ['Crear un deadlock', 'P1 toma R1, P2 toma R2, luego P1 pide R2 y P2 pide R1.'],
    'ch-dl-three': ['Crear un ciclo de deadlock con los 3 processes', 'Dale un recurso a cada process y luego haz que cada uno pida el siguiente del círculo.'],
    'ch-dl-safe': ["Encontrar una safe sequence con el banker's algorithm", 'Carga el ejemplo del libro y ejecuta la comprobación de seguridad.'],
    'ch-dl-unsafe': ['Llevar el sistema a un estado unsafe', 'Reduce Available o sube algún valor de Max hasta que no exista ninguna safe sequence.'],
  },
}

interface GenText {
  ragPrompt: string
  yes: string
  no: string
  heldBy: (r: string, p: string | null) => string
  waitsFor: (p: string, r: string) => string
  noneWaiting: string
  cycle: (chain: string) => string
  noCycle: string
  bankerPrompt: string
  safe: string
  unsafe: string
  needs: (list: string) => string
  safeSeq: (seq: string) => string
  unsafeSeq: (work: string, finished: string | null) => string
}

export const deadlockGenText: Localized<GenText> = {
  en: {
    ragPrompt: 'Each resource has a single instance. Is the system deadlocked?',
    yes: 'Yes',
    no: 'No',
    heldBy: (r, p) => `${r} held by ${p ?? 'nobody'}`,
    waitsFor: (p, r) => `${p} waits for ${r}`,
    noneWaiting: 'No process is waiting',
    cycle: (chain) => `There is a cycle: ${chain}, where each process waits for a resource held by the next one. With single-instance resources a cycle means deadlock.`,
    noCycle: 'Follow each "waits for" edge to the holder: no chain loops back to where it started, so there is no circular wait and no deadlock.',
    bankerPrompt: "Two resource types A and B. Is this state safe according to the banker's algorithm?",
    safe: 'Safe',
    unsafe: 'Unsafe',
    needs: (list) => `Need = Max - Allocation: ${list}.\n`,
    safeSeq: (seq) => `Safe sequence: ${seq}. Each one's Need fits in Work, and when it finishes its Allocation is added back to Work.`,
    unsafeSeq: (work, finished) => `Starting from Work = ${work}${finished ? `, ${finished} can finish, but then` : ''} no remaining process's Need fits in Work, so no safe sequence exists.`,
  },
  he: {
    ragPrompt: 'לכל משאב יש מופע יחיד. האם המערכת ב-deadlock?',
    yes: 'כן',
    no: 'לא',
    heldBy: (r, p) => (p ? `${r} מוחזק על ידי ${p}` : `${r} פנוי`),
    waitsFor: (p, r) => `${p} מחכה ל-${r}`,
    noneWaiting: 'אף process לא מחכה',
    cycle: (chain) => `יש מעגל: ${ltr(chain)}, שבו כל process מחכה למשאב שמחזיק ה-process הבא. כשלכל משאב יש מופע יחיד, מעגל פירושו deadlock.`,
    noCycle: 'עקבו אחרי כל קשת "מחכה ל-" עד למחזיק: אף שרשרת לא חוזרת לנקודת ההתחלה שלה, ולכן אין circular wait ואין deadlock.',
    bankerPrompt: 'שני סוגי משאבים, A ו-B. האם המצב הזה safe לפי ה-banker\'s algorithm?',
    safe: 'Safe',
    unsafe: 'Unsafe',
    needs: (list) => `${ltr('Need = Max - Allocation')}: ${list}.\n`,
    safeSeq: (seq) => `Safe sequence: ${seq}. ה-Need של כל אחד נכנס ב-Work, וכשהוא מסיים, ה-Allocation שלו מתווסף בחזרה ל-Work.`,
    unsafeSeq: (work, finished) =>
      `מתחילים מ-${ltr(`Work = ${work}`)}${finished ? `. ${finished} יכולים לסיים, אבל אחר כך` : ','} ה-Need של אף process שנשאר לא נכנס ב-Work, ולכן לא קיים safe sequence.`,
  },
  ar: {
    ragPrompt: 'لكل مورد نسخة واحدة. هل النظام في حالة deadlock؟',
    yes: 'نعم',
    no: 'لا',
    heldBy: (r, p) => (p ? `${r} يمسكه ${p}` : `${r} غير محجوز`),
    waitsFor: (p, r) => `${p} ينتظر ${r}`,
    noneWaiting: 'لا يوجد process ينتظر',
    cycle: (chain) => `توجد دورة: ${ltr(chain)}، حيث ينتظر كل process موردًا يمسكه الـ process التالي. عندما يكون لكل مورد نسخة واحدة، تعني الدورة وجود deadlock.`,
    noCycle: 'تتبّع كل حافة "ينتظر" حتى الماسك: لا تعود أي سلسلة إلى نقطة بدايتها، لذا لا يوجد circular wait ولا deadlock.',
    bankerPrompt: 'نوعان من الموارد A و B. هل هذه الحالة safe وفق الـ banker\'s algorithm؟',
    safe: 'Safe',
    unsafe: 'Unsafe',
    needs: (list) => `${ltr('Need = Max - Allocation')}: ${list}.\n`,
    safeSeq: (seq) => `Safe sequence: ${seq}. الـ Need لكل منها يتسع في Work، وعندما ينتهي يُضاف الـ Allocation الخاص به إلى Work من جديد.`,
    unsafeSeq: (work, finished) =>
      `بدءًا من ${ltr(`Work = ${work}`)}${finished ? `، يمكن أن ينتهي ${finished}، لكن بعد ذلك` : '،'} لا يتسع الـ Need لأي process متبقٍّ في Work، لذا لا يوجد safe sequence.`,
  },
  es: {
    ragPrompt: 'Cada recurso tiene una sola instancia. ¿Está el sistema en deadlock?',
    yes: 'Sí',
    no: 'No',
    heldBy: (r, p) => (p ? `${r} lo tiene ${p}` : `${r} no lo tiene nadie`),
    waitsFor: (p, r) => `${p} espera ${r}`,
    noneWaiting: 'Ningún process está esperando',
    cycle: (chain) => `Hay un ciclo: ${chain}, en el que cada process espera un recurso que tiene el siguiente. Con recursos de una sola instancia, un ciclo significa deadlock.`,
    noCycle: 'Sigue cada arista "espera" hasta quien tiene el recurso: ninguna cadena vuelve a su punto de partida, así que no hay circular wait ni deadlock.',
    bankerPrompt: "Dos tipos de recurso, A y B. ¿Es este estado safe según el banker's algorithm?",
    safe: 'Safe',
    unsafe: 'Unsafe',
    needs: (list) => `Need = Max - Allocation: ${list}.\n`,
    safeSeq: (seq) => `Safe sequence: ${seq}. El Need de cada uno cabe en Work, y cuando termina su Allocation se suma de nuevo a Work.`,
    unsafeSeq: (work, finished) =>
      `Partiendo de Work = ${work}${finished ? `, ${finished} pueden terminar, pero después` : ','} el Need de ningún process restante cabe en Work, así que no existe ninguna safe sequence.`,
  },
}
