import type { Job, SchedAlgo } from '../../engines/scheduler'
import { ltr, type Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

export const schedulingQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'sched-fcfs-wait': {
      prompt: 'לפי FCFS, מהו ה-waiting time הממוצע?',
      scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nכולם מגיעים בזמן 0 בסדר P1, P2, P3.',
      unit: 'יחידות זמן',
      explanation: `P1 מחכה 0, P2 מחכה 24 ו-P3 מחכה 27. ${ltr('(0 + 24 + 27) / 3 = 17')}. משימה ארוכה בראש התור גורמת לכולם לחכות: אפקט השיירה (convoy effect).`,
    },
    'sched-sjf-wait': {
      prompt: 'אותן משימות, אבל הפעם עם SJF. מהו ה-waiting time הממוצע?',
      scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nכולם מגיעים בזמן 0.',
      unit: 'יחידות זמן',
      explanation: 'הסדר הוא P2, P3, P1. זמני ההמתנה הם 0, 3 ו-6, ולכן הממוצע הוא 3. SJF ממזער את ה-waiting time הממוצע, אבל צריך לדעת מראש את אורכי ה-bursts.',
    },
    'sched-rr-quantum': {
      prompt: 'מה קורה ב-Round Robin כשה-quantum גדול מאוד?',
      options: ['הוא מתנהג כמו FCFS', 'הוא מתנהג כמו SJF', 'כל ה-processes סובלים מ-starvation', 'ה-context switches נעשים תכופים יותר'],
      explanation: 'אם אף process לא מנצל את כל ה-quantum שלו, אף אחד לא מופקע והמשימות רצות לפי סדר ההגעה, בדיוק כמו FCFS. ל-quantum זעיר יש את הבעיה ההפוכה: יותר מדי זמן הולך על context switches.',
    },
    'sched-ctx-order': {
      prompt: 'סדרו את השלבים של context switch מ-process A ל-process B.',
      items: [
        'מגיע timer interrupt בזמן ש-A רץ',
        'ה-CPU עובר ל-kernel mode ושומר את הרגיסטרים של A ב-PCB של A',
        'ה-scheduler בוחר את B מתור ה-ready',
        'ה-kernel טוען את הרגיסטרים של B מה-PCB של B',
        'חזרה ל-user mode; B ממשיך מהמקום שבו עצר',
      ],
      explanation: 'ה-interrupt מעביר את השליטה ל-kernel, שומר את המצב של ה-process היוצא, מקבל החלטת תזמון, משחזר את המצב של ה-process הנכנס וחוזר ל-user mode.',
    },
    'sched-starvation': {
      prompt: 'איזה אלגוריתם עלול לגרום ל-starvation של משימות ארוכות או בעדיפות נמוכה אם כל הזמן מגיעה עבודה חדשה?',
      options: ['Round Robin', 'FCFS', 'Priority / SJF', 'אף אחד מהם'],
      explanation: 'תזמון לפי עדיפות ותזמון לפי המשימה הקצרה ביותר תמיד מעדיפים משימות חדשות שחשובות יותר או קצרות יותר, ולכן משימה ארוכה או בעדיפות נמוכה עלולה לא לרוץ אף פעם. Aging (העלאה הדרגתית של העדיפות בזמן ההמתנה) פותר את זה.',
    },
    'sched-ctx-cost': {
      prompt: 'למה context switch נחשב תקורה (overhead) טהורה?',
      options: [
        'הוא מוחק את הזיכרון של ה-process',
        'שום עבודה של המשתמש לא מתבצעת בזמן ששומרים ומשחזרים את המצב, וה-caches וה-TLB נעשים "קרים"',
        'הוא מחייב לכתוב את ה-process לדיסק',
        'הוא תמיד גורם ל-page fault',
      ],
      explanation: 'בזמן ההחלפה ה-CPU עסוק בניהול ולא מריץ תוכניות. אחר כך ה-process החדש גם סובל מ-cache misses ומ-TLB misses עד שהם "מתחממים" שוב.',
    },
  },
  ar: {
    'sched-fcfs-wait': {
      prompt: 'باستخدام FCFS، ما متوسط الـ waiting time؟',
      scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nتصل جميعها في الزمن 0 بالترتيب P1, P2, P3.',
      unit: 'وحدات زمنية',
      explanation: `ينتظر P1 مدة 0، وP2 مدة 24، وP3 مدة 27. ${ltr('(0 + 24 + 27) / 3 = 17')}. مهمة طويلة في المقدمة تجعل الجميع ينتظرون: إنه تأثير القافلة (convoy effect).`,
    },
    'sched-sjf-wait': {
      prompt: 'المهام نفسها، لكن الآن باستخدام SJF. ما متوسط الـ waiting time؟',
      scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nتصل جميعها في الزمن 0.',
      unit: 'وحدات زمنية',
      explanation: 'الترتيب هو P2 ثم P3 ثم P1. أزمنة الانتظار 0 و3 و6، فالمتوسط 3. يقلّل SJF متوسط الـ waiting time إلى أدنى حد، لكنه يحتاج إلى معرفة أطوال الـ bursts مسبقًا.',
    },
    'sched-rr-quantum': {
      prompt: 'ماذا يحدث في Round Robin عندما يكون الـ quantum كبيرًا جدًا؟',
      options: ['يتصرف مثل FCFS', 'يتصرف مثل SJF', 'تعاني كل الـ processes من starvation', 'تصبح الـ context switches أكثر تكرارًا'],
      explanation: 'إذا لم يستنفد أي process الـ quantum الخاص به، فلن تُنتزَع الـ CPU من أحد وستعمل المهام بترتيب وصولها، تمامًا مثل FCFS. أما الـ quantum الصغير جدًا فمشكلته معاكسة: يضيع وقت كبير في الـ context switches.',
    },
    'sched-ctx-order': {
      prompt: 'رتّب خطوات الـ context switch من process A إلى process B.',
      items: [
        'يصل timer interrupt بينما A قيد التشغيل',
        'تدخل الـ CPU في kernel mode وتحفظ سجلات A في الـ PCB الخاص بـ A',
        'يختار الـ scheduler ‏B من طابور الـ ready',
        'يحمّل الـ kernel سجلات B من الـ PCB الخاص بـ B',
        'العودة إلى user mode، ويستأنف B من حيث توقف',
      ],
      explanation: 'يسلّم الـ interrupt التحكم إلى الـ kernel، الذي يحفظ حالة الـ process المغادر، ويتخذ قرار الجدولة، ويستعيد حالة الـ process القادم، ثم يعود إلى user mode.',
    },
    'sched-starvation': {
      prompt: 'أي خوارزمية قد تسبب starvation للمهام الطويلة أو منخفضة الأولوية إذا استمر وصول عمل جديد؟',
      options: ['Round Robin', 'FCFS', 'Priority / SJF', 'لا شيء منها'],
      explanation: 'الجدولة حسب الأولوية وحسب أقصر مهمة تفضّل دائمًا المهام الجديدة الأهم أو الأقصر، لذا قد لا تعمل أبدًا مهمة طويلة أو منخفضة الأولوية. الـ aging (رفع الأولوية تدريجيًا أثناء الانتظار) يحل هذه المشكلة.',
    },
    'sched-ctx-cost': {
      prompt: 'لماذا يُعدّ الـ context switch عبئًا إضافيًا (overhead) خالصًا؟',
      options: [
        'يمسح ذاكرة الـ process',
        'لا يُنجَز أي عمل للمستخدم أثناء حفظ الحالة واستعادتها، وتصبح الـ caches والـ TLB "باردة"',
        'يتطلب كتابة الـ process إلى القرص',
        'يسبب دائمًا page fault',
      ],
      explanation: 'أثناء التبديل تنشغل الـ CPU بأعمال إدارية ولا تشغّل البرامج. وبعده يعاني الـ process الجديد أيضًا من cache misses و TLB misses حتى "تسخن" من جديد.',
    },
  },
  es: {
    'sched-fcfs-wait': {
      prompt: 'Con FCFS, ¿cuál es el waiting time promedio?',
      scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nTodos llegan en el tiempo 0 en el orden P1, P2, P3.',
      unit: 'unidades de tiempo',
      explanation: 'P1 espera 0, P2 espera 24 y P3 espera 27. (0 + 24 + 27) / 3 = 17. Un trabajo largo al principio hace esperar a todos: el efecto convoy.',
    },
    'sched-sjf-wait': {
      prompt: 'Los mismos trabajos, pero ahora con SJF. ¿Cuál es el waiting time promedio?',
      scenario: 'P1 burst 24, P2 burst 3, P3 burst 3\nTodos llegan en el tiempo 0.',
      unit: 'unidades de tiempo',
      explanation: 'El orden es P2, P3, P1. Las esperas son 0, 3 y 6, así que el promedio es 3. SJF minimiza el waiting time promedio, pero necesita conocer de antemano la duración de los bursts.',
    },
    'sched-rr-quantum': {
      prompt: '¿Qué pasa en Round Robin si el quantum se hace extremadamente grande?',
      options: ['Se comporta como FCFS', 'Se comporta como SJF', 'Todos los processes sufren starvation', 'Los context switches se vuelven más frecuentes'],
      explanation: 'Si ningún process agota su quantum, nadie es expulsado y los trabajos se ejecutan en orden de llegada, exactamente como en FCFS. Un quantum diminuto tiene el problema contrario: se pierde demasiado tiempo en context switches.',
    },
    'sched-ctx-order': {
      prompt: 'Ordena los pasos de un context switch del process A al process B.',
      items: [
        'Llega un timer interrupt mientras A se ejecuta',
        'La CPU entra en kernel mode y guarda los registros de A en el PCB de A',
        'El scheduler elige a B de la cola ready',
        'El kernel carga los registros de B desde el PCB de B',
        'Vuelta a user mode; B continúa donde se quedó',
      ],
      explanation: 'El interrupt cede el control al kernel, que guarda el estado del process saliente, toma una decisión de planificación, restaura el estado del entrante y vuelve a user mode.',
    },
    'sched-starvation': {
      prompt: '¿Qué algoritmo puede causar starvation de los trabajos largos o de baja prioridad si no deja de llegar trabajo nuevo?',
      options: ['Round Robin', 'FCFS', 'Priority / SJF', 'Ninguno'],
      explanation: 'La planificación por prioridad y la del trabajo más corto siempre prefieren a los recién llegados más importantes o más cortos, así que un trabajo largo o de baja prioridad puede no ejecutarse nunca. El aging (subir poco a poco la prioridad mientras espera) lo soluciona.',
    },
    'sched-ctx-cost': {
      prompt: '¿Por qué se considera que un context switch es puro overhead?',
      options: [
        'Borra la memoria del process',
        'No se hace trabajo del usuario mientras se guarda y restaura el estado, y las cachés y la TLB quedan "frías"',
        'Requiere escribir el process en disco',
        'Siempre provoca un page fault',
      ],
      explanation: 'Durante el cambio la CPU hace tareas administrativas, no ejecuta programas. Después, el process nuevo además sufre cache misses y TLB misses hasta que vuelven a "calentarse".',
    },
  },
}

export const schedulingChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-sched-rr-beats': ['לגרום ל-Round Robin לנצח את FCFS ב-waiting time הממוצע', 'שימו משימה ארוכה אחת ראשונה וכמה משימות קצרות מיד אחריה, ואז בחרו Round Robin.'],
    'ch-sched-convoy': ['ליצור שיירה (convoy): ה-waiting time הממוצע של FCFS גדול לפחות פי 3 מזה של SJF', 'משימה ארוכה מאוד שמגיעה ראשונה, ואחריה הרבה משימות קצרות, גורמת ל-FCFS להיראות נורא.'],
    'ch-sched-switches': ['לגרום לפחות ל-8 context switches', 'השתמשו ב-Round Robin עם quantum 1 ובכמה משימות באורך בינוני.'],
    'ch-sched-srtf': ['למצוא עומס עבודה שבו SRTF מפקיע משימה שרצה', 'התחילו משימה ארוכה בזמן 0 ותנו למשימה קצרה להגיע בזמן 1, ואז בחרו SRTF.'],
  },
  ar: {
    'ch-sched-rr-beats': ['اجعل Round Robin يتفوق على FCFS في متوسط الـ waiting time', 'ضع مهمة طويلة واحدة أولًا وعدة مهام قصيرة خلفها مباشرة، ثم اختر Round Robin.'],
    'ch-sched-convoy': ['أنشئ قافلة (convoy): متوسط الـ waiting time في FCFS لا يقل عن 3 أضعاف SJF', 'مهمة طويلة جدًا تصل أولًا وتليها مهام قصيرة كثيرة تجعل FCFS يبدو سيئًا للغاية.'],
    'ch-sched-switches': ['تسبّب في 8 context switches على الأقل', 'استخدم Round Robin مع quantum 1 وبضع مهام متوسطة الطول.'],
    'ch-sched-srtf': ['جد حمل عمل ينتزع فيه SRTF الـ CPU من مهمة قيد التشغيل', 'ابدأ مهمة طويلة في الزمن 0 ودع مهمة قصيرة تصل في الزمن 1، ثم اختر SRTF.'],
  },
  es: {
    'ch-sched-rr-beats': ['Haz que Round Robin supere a FCFS en waiting time promedio', 'Pon primero un trabajo largo y varios cortos justo detrás, y luego selecciona Round Robin.'],
    'ch-sched-convoy': ['Crea un convoy: el waiting time promedio de FCFS debe ser al menos 3 veces el de SJF', 'Un trabajo muy largo que llega primero, seguido de muchos cortos, hace que FCFS quede fatal.'],
    'ch-sched-switches': ['Provoca al menos 8 context switches', 'Usa Round Robin con quantum 1 y unos cuantos trabajos de duración media.'],
    'ch-sched-srtf': ['Encuentra una carga de trabajo en la que SRTF expulse a un trabajo en ejecución', 'Empieza un trabajo largo en el tiempo 0 y deja que uno corto llegue en el tiempo 1; luego elige SRTF.'],
  },
}

interface GenText {
  algoNames: Record<SchedAlgo, string>
  avgPrompt: (algo: string) => string
  unit: string
  avgExplain: (gantt: string, waits: string, sum: number, n: number, avg: number) => string
  donePrompt: (algo: string, id: string) => string
  doneExplain: (gantt: string, id: string, time: number) => string
  job: (j: Job, withPriority: boolean) => string
  idle: string
}

export const schedulingGenText: Localized<GenText> = {
  en: {
    algoNames: {
      FCFS: 'FCFS',
      SJF: 'SJF (non-preemptive)',
      SRTF: 'SRTF (preemptive SJF)',
      RR: 'Round Robin with quantum 2',
      PRIORITY: 'Priority (non-preemptive, lower number = higher priority)',
    },
    avgPrompt: (algo) => `Using ${algo}, what is the average waiting time? (Round to 2 decimals.)`,
    unit: 'time units',
    avgExplain: (g, w, sum, n, avg) => `Schedule: ${g}.\nWaiting times: ${w}.\nAverage = ${sum} / ${n} = ${avg}.`,
    donePrompt: (algo, id) => `Using ${algo}, at what time does ${id} finish?`,
    doneExplain: (g, id, time) => `Schedule: ${g}. ${id} completes at time ${time}.`,
    job: (j, p) => `${j.id}: arrival ${j.arrival}, burst ${j.burst}${p ? `, priority ${j.priority}` : ''}`,
    idle: 'idle',
  },
  he: {
    algoNames: {
      FCFS: 'FCFS',
      SJF: 'SJF (ללא הפקעה)',
      SRTF: 'SRTF (SJF עם הפקעה)',
      RR: 'Round Robin עם quantum 2',
      PRIORITY: 'Priority (ללא הפקעה, מספר נמוך יותר פירושו עדיפות גבוהה יותר)',
    },
    avgPrompt: (algo) => `לפי ${algo}, מהו ה-waiting time הממוצע? (עגלו ל-2 ספרות אחרי הנקודה.)`,
    unit: 'יחידות זמן',
    avgExplain: (g, w, sum, n, avg) => `התזמון: ${ltr(g)}.\nזמני ההמתנה: ${ltr(w)}.\nהממוצע: ${ltr(`${sum} / ${n} = ${avg}`)}.`,
    donePrompt: (algo, id) => `לפי ${algo}, באיזה זמן ${id} מסתיים?`,
    doneExplain: (g, id, time) => `התזמון: ${ltr(g)}. ${id} מסתיים בזמן ${time}.`,
    job: (j, p) => `${j.id}: הגעה ${j.arrival}, burst ${j.burst}${p ? `, עדיפות ${j.priority}` : ''}`,
    idle: 'סרק',
  },
  ar: {
    algoNames: {
      FCFS: 'FCFS',
      SJF: 'SJF (دون انتزاع)',
      SRTF: 'SRTF (SJF مع الانتزاع)',
      RR: 'Round Robin مع quantum 2',
      PRIORITY: 'Priority (دون انتزاع، الرقم الأصغر يعني أولوية أعلى)',
    },
    avgPrompt: (algo) => `باستخدام ${algo}، ما متوسط الـ waiting time؟ (قرّب إلى منزلتين عشريتين.)`,
    unit: 'وحدات زمنية',
    avgExplain: (g, w, sum, n, avg) => `الجدول الزمني: ${ltr(g)}.\nأزمنة الانتظار: ${ltr(w)}.\nالمتوسط: ${ltr(`${sum} / ${n} = ${avg}`)}.`,
    donePrompt: (algo, id) => `باستخدام ${algo}، في أي زمن ينتهي ${id}؟`,
    doneExplain: (g, id, time) => `الجدول الزمني: ${ltr(g)}. ينتهي ${id} في الزمن ${time}.`,
    job: (j, p) => `${j.id}: الوصول ${j.arrival}، burst ${j.burst}${p ? `، الأولوية ${j.priority}` : ''}`,
    idle: 'خمول',
  },
  es: {
    algoNames: {
      FCFS: 'FCFS',
      SJF: 'SJF (no expropiativo)',
      SRTF: 'SRTF (SJF expropiativo)',
      RR: 'Round Robin con quantum 2',
      PRIORITY: 'Priority (no expropiativo, número menor = mayor prioridad)',
    },
    avgPrompt: (algo) => `Con ${algo}, ¿cuál es el waiting time promedio? (Redondea a 2 decimales.)`,
    unit: 'unidades de tiempo',
    avgExplain: (g, w, sum, n, avg) => `Planificación: ${g}.\nWaiting times: ${w}.\nPromedio = ${sum} / ${n} = ${avg}.`,
    donePrompt: (algo, id) => `Con ${algo}, ¿en qué instante termina ${id}?`,
    doneExplain: (g, id, time) => `Planificación: ${g}. ${id} termina en el instante ${time}.`,
    job: (j, p) => `${j.id}: llegada ${j.arrival}, burst ${j.burst}${p ? `, prioridad ${j.priority}` : ''}`,
    idle: 'libre',
  },
}
