import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { SchedAlgo } from '../../engines/scheduler'
import { ltr, type Localized } from '../../i18n'

type Field = 'arrival' | 'burst' | 'priority'

interface SchedText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  workloadTitle: string
  workloadSubtitle: string
  algoTitle: string
  algoLabel: string
  priorityAlgo: string
  algoInfo: Record<SchedAlgo, string>
  runTitle: string
  time: (t: number) => string
  emptyWorkload: string
  /** Same order as the program pool on the page. */
  programs: string[]
  poolTitle: string
  poolItem: (burst: number, priority: number) => string
  workloadCount: (n: number) => string
  dropHere: string
  cols: Record<Field | 'process' | 'completion' | 'turnaround' | 'waiting' | 'response', string>
  remove: string
  removeLabel: (id: string) => string
  left: (n: number) => string
  allDone: string
  idle: string
  isRunning: (id: string, name: string) => string
  needsMore: (n: number) => string
  everyDone: string
  noReady: string
  arrived: (ids: string[]) => string
  finished: (ids: string[]) => string
  readyQueue: string
  empty: string
  pcbOf: (id: string) => string
  stateLabel: string
  ctxTitle: string
  switchesSoFar: string
  kernelSwap: [string, string]
  ctxSteps: (from: string, to: string) => string[]
  keepsCpu: (id: string) => string
  nothingToSwitch: string
  stepHint: string
  ganttTitle: string
  ganttIdle: string
  stats: [avgWaiting: string, avgTurnaround: string, avgResponse: string, switches: string]
}

export const schedulingText: Localized<SchedText> = {
  en: {
    intro: (
      <>
        A CPU core can run only one thread at a time. The scheduler decides which ready process runs next and for how
        long. Switching between processes requires a <Term k="context">context switch</Term>: the kernel saves the
        running process's registers into its PCB and restores another's.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Ready queue:</strong> processes that could run right now, waiting for the CPU.
      </>,
      <>
        <strong>Metrics:</strong> <Term k="turnaround">turnaround</Term> = completion - arrival;{' '}
        <Term k="waiting">waiting</Term> = turnaround - burst.
      </>,
      <>
        <strong><Term k="preemption">Preemptive</Term></strong> schedulers can take the CPU away mid-burst; non-preemptive
        ones wait for the job to finish.
      </>,
    ],
    workloadTitle: '1. Build a workload',
    workloadSubtitle: 'Drag programs from the pool into the workload (or click them), then tune arrival, burst and priority.',
    algoTitle: '2. Choose a scheduling algorithm',
    algoLabel: 'Scheduling algorithm',
    priorityAlgo: 'Priority',
    algoInfo: {
      FCFS: 'First-Come, First-Served: run jobs in arrival order until each finishes. Simple, but short jobs get stuck behind long ones (the convoy effect).',
      SJF: 'Shortest Job First (non-preemptive): when the CPU frees up, pick the job with the smallest burst. Optimal average waiting time, but long jobs can starve.',
      SRTF: 'Shortest Remaining Time First: preemptive SJF. A newly arrived job with less remaining work kicks the current job off the CPU.',
      RR: 'Round Robin: every job gets a fixed time quantum, then goes to the back of the queue. Great response time for interactive systems.',
      PRIORITY: 'Priority (non-preemptive): the job with the lowest priority number runs next. Low-priority jobs may starve without aging.',
    },
    runTitle: '3. Run it',
    time: (t) => `t = ${t}`,
    emptyWorkload: 'Add at least one job to the workload to start the simulation.',
    programs: ['Shell', 'Music player', 'Browser', 'Game', 'Compiler', 'Backup'],
    poolTitle: 'Program pool',
    poolItem: (b, p) => `burst ${b} - prio ${p}`,
    workloadCount: (n) => `Workload (${n}/8)`,
    dropHere: 'Drop programs here',
    cols: { process: 'Process', arrival: 'Arrival', burst: 'Burst', priority: 'Priority', completion: 'Completion', turnaround: 'Turnaround', waiting: 'Waiting', response: 'Response' },
    remove: 'Remove',
    removeLabel: (id) => `Remove ${id}`,
    left: (n) => `${n} left`,
    allDone: 'All done',
    idle: 'Idle',
    isRunning: (id, name) => `${id} (${name}) is running`,
    needsMore: (n) => `It needs ${n} more time unit(s).`,
    everyDone: 'Every job has completed.',
    noReady: 'No process is ready, so the CPU idles.',
    arrived: (ids) => `Arrived: ${ids.join(', ')}`,
    finished: (ids) => `Finished: ${ids.join(', ')}`,
    readyQueue: 'Ready queue (front to back)',
    empty: 'empty',
    pcbOf: (id) => `PCB of ${id}`,
    stateLabel: 'state',
    ctxTitle: 'Context switch',
    switchesSoFar: 'switches so far:',
    kernelSwap: ['kernel', 'swap'],
    ctxSteps: (from, to) => [
      'Interrupt: CPU traps into the kernel.',
      `Save ${from}'s PC, SP and registers into PCB(${from}).`,
      `Scheduler selects ${to}.`,
      `Restore PCB(${to}) into the CPU and return to user mode.`,
    ],
    keepsCpu: (id) => `${id} keeps the CPU this tick, so no state needs to be saved or restored.`,
    nothingToSwitch: 'Nothing to switch right now.',
    stepHint: 'Step through the simulation and watch for switches: each one costs time in a real system.',
    ganttTitle: 'Gantt chart',
    ganttIdle: 'idle',
    stats: ['Avg waiting', 'Avg turnaround', 'Avg response', 'Switches'],
  },
  he: {
    intro: (
      <>
        ליבת CPU יכולה להריץ רק thread אחד בכל רגע. ה-scheduler מחליט איזה process מוכן ירוץ הבא ולכמה זמן. מעבר בין processes דורש{' '}
        <Term k="context">context switch</Term>: ה-kernel שומר את הרגיסטרים של ה-process שרץ ב-PCB שלו ומשחזר את הרגיסטרים של process אחר.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Ready queue:</strong> processes שיכולים לרוץ ברגע זה ומחכים ל-CPU.
      </>,
      <>
        <strong>מדדים:</strong>{' '}
        <span dir="ltr">
          <Term k="turnaround">turnaround</Term> = completion - arrival
        </span>
        ;{' '}
        <span dir="ltr">
          <Term k="waiting">waiting</Term> = turnaround - burst
        </span>
        .
      </>,
      <>
        <strong>Scheduler עם <Term k="preemption">הפקעה</Term> (preemptive)</strong> יכול לקחת את ה-CPU באמצע burst; scheduler ללא הפקעה מחכה שהמשימה
        תסתיים.
      </>,
    ],
    workloadTitle: '1. בניית עומס עבודה',
    workloadSubtitle: 'גררו תוכניות מהמאגר אל עומס העבודה (או לחצו עליהן), ואז כווננו את זמן ההגעה, ה-burst והעדיפות.',
    algoTitle: '2. בחירת אלגוריתם תזמון',
    algoLabel: 'אלגוריתם תזמון',
    priorityAlgo: 'Priority',
    algoInfo: {
      FCFS: 'First-Come, First-Served: מריצים את המשימות לפי סדר ההגעה, כל אחת עד שהיא מסתיימת. פשוט, אבל משימות קצרות נתקעות מאחורי ארוכות (אפקט השיירה, convoy effect).',
      SJF: 'Shortest Job First (ללא הפקעה): כשה-CPU מתפנה, בוחרים את המשימה עם ה-burst הקצר ביותר. ה-waiting time הממוצע אופטימלי, אבל משימות ארוכות עלולות לסבול מ-starvation.',
      SRTF: 'Shortest Remaining Time First: גרסת SJF עם הפקעה. משימה שהגיעה עכשיו ונשארה לה פחות עבודה מוציאה את המשימה הנוכחית מה-CPU.',
      RR: 'Round Robin: כל משימה מקבלת quantum קבוע של זמן, ואז חוזרת לסוף התור. זמן תגובה מצוין למערכות אינטראקטיביות.',
      PRIORITY: 'Priority (ללא הפקעה): המשימה עם מספר העדיפות הנמוך ביותר רצה הבאה. בלי aging, משימות בעדיפות נמוכה עלולות לסבול מ-starvation.',
    },
    runTitle: '3. הרצה',
    time: (t) => ltr(`t = ${t}`),
    emptyWorkload: 'הוסיפו לפחות משימה אחת לעומס העבודה כדי להתחיל את הסימולציה.',
    programs: ['Shell', 'נגן מוזיקה', 'דפדפן', 'משחק', 'קומפיילר', 'גיבוי'],
    poolTitle: 'מאגר התוכניות',
    poolItem: (b, p) => `burst ${b} - עדיפות ${p}`,
    workloadCount: (n) => `עומס עבודה (${n}/8)`,
    dropHere: 'שחררו כאן תוכניות',
    cols: { process: 'Process', arrival: 'הגעה', burst: 'Burst', priority: 'עדיפות', completion: 'סיום', turnaround: 'Turnaround', waiting: 'Waiting', response: 'תגובה' },
    remove: 'הסרה',
    removeLabel: (id) => `הסרת ${id}`,
    left: (n) => `נותרו ${n}`,
    allDone: 'הכול הסתיים',
    idle: 'פנוי',
    isRunning: (id, name) => `${id} (${name}) רץ`,
    needsMore: (n) => (n === 1 ? 'הוא צריך עוד יחידת זמן אחת.' : `הוא צריך עוד ${n} יחידות זמן.`),
    everyDone: 'כל המשימות הסתיימו.',
    noReady: 'אין process מוכן, ולכן ה-CPU במצב סרק.',
    arrived: (ids) => `הגיעו: ${ids.join(', ')}`,
    finished: (ids) => `הסתיימו: ${ids.join(', ')}`,
    readyQueue: 'תור ה-ready (מהראש לסוף)',
    empty: 'ריק',
    pcbOf: (id) => `ה-PCB של ${id}`,
    stateLabel: 'מצב',
    ctxTitle: 'Context switch',
    switchesSoFar: 'החלפות עד כה:',
    kernelSwap: ['ה-kernel', 'מחליף'],
    ctxSteps: (from, to) => [
      'Interrupt: ה-CPU עובר ל-kernel באמצעות trap.',
      `שמירת ה-PC, ה-SP והרגיסטרים של ${from} ב-PCB(${from}).`,
      `ה-scheduler בוחר את ${to}.`,
      `שחזור PCB(${to}) אל ה-CPU וחזרה ל-user mode.`,
    ],
    keepsCpu: (id) => `${id} ממשיך להחזיק ב-CPU ביחידת הזמן הזו, ולכן אין צורך לשמור או לשחזר מצב.`,
    nothingToSwitch: 'אין מה להחליף כרגע.',
    stepHint: 'התקדמו בסימולציה צעד אחר צעד וחפשו החלפות: כל אחת עולה זמן במערכת אמיתית.',
    ganttTitle: 'Gantt chart',
    ganttIdle: 'סרק',
    stats: ['Waiting ממוצע', 'Turnaround ממוצע', 'תגובה ממוצעת', 'Context switches'],
  },
  ar: {
    intro: (
      <>
        لا تستطيع نواة الـ CPU تشغيل إلا thread واحد في كل لحظة. يقرر الـ scheduler أي process جاهز يعمل تاليًا ولأي مدة. يتطلب التبديل بين الـ processes{' '}
        <Term k="context">context switch</Term>: يحفظ الـ kernel سجلات الـ process الجاري في الـ PCB الخاص به ويستعيد سجلات process آخر.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Ready queue:</strong> الـ processes التي يمكنها العمل الآن وتنتظر الـ CPU.
      </>,
      <>
        <strong>المقاييس:</strong>{' '}
        <span dir="ltr">
          <Term k="turnaround">turnaround</Term> = completion - arrival
        </span>
        ؛{' '}
        <span dir="ltr">
          <Term k="waiting">waiting</Term> = turnaround - burst
        </span>
        .
      </>,
      <>
        <strong>الـ schedulers <Term k="preemption">الانتزاعية</Term> (preemptive)</strong> يمكنها أخذ الـ CPU في منتصف الـ burst، أما غير الانتزاعية فتنتظر
        انتهاء المهمة.
      </>,
    ],
    workloadTitle: '1. ابنِ حمل العمل',
    workloadSubtitle: 'اسحب البرامج من المجموعة إلى حمل العمل (أو انقر عليها)، ثم اضبط زمن الوصول والـ burst والأولوية.',
    algoTitle: '2. اختر خوارزمية الجدولة',
    algoLabel: 'خوارزمية الجدولة',
    priorityAlgo: 'Priority',
    algoInfo: {
      FCFS: 'First-Come, First-Served: تُشغَّل المهام بترتيب وصولها حتى تنتهي كل منها. بسيطة، لكن المهام القصيرة تعلق خلف الطويلة (تأثير القافلة، convoy effect).',
      SJF: 'Shortest Job First (دون انتزاع): عندما تتحرر الـ CPU تُختار المهمة ذات الـ burst الأقصر. تعطي أفضل متوسط waiting time، لكن المهام الطويلة قد تعاني من starvation.',
      SRTF: 'Shortest Remaining Time First: نسخة SJF مع الانتزاع. المهمة الواصلة حديثًا التي تبقّى لها عمل أقل تُخرج المهمة الحالية من الـ CPU.',
      RR: 'Round Robin: تحصل كل مهمة على quantum زمني ثابت، ثم تعود إلى آخر الطابور. زمن استجابة ممتاز للأنظمة التفاعلية.',
      PRIORITY: 'Priority (دون انتزاع): تعمل تاليًا المهمة ذات رقم الأولوية الأصغر. قد تعاني المهام منخفضة الأولوية من starvation دون aging.',
    },
    runTitle: '3. شغّلها',
    time: (t) => ltr(`t = ${t}`),
    emptyWorkload: 'أضف مهمة واحدة على الأقل إلى حمل العمل لبدء المحاكاة.',
    programs: ['Shell', 'مشغّل الموسيقى', 'المتصفح', 'لعبة', 'المترجم', 'النسخ الاحتياطي'],
    poolTitle: 'مجموعة البرامج',
    poolItem: (b, p) => `burst ${b} - الأولوية ${p}`,
    workloadCount: (n) => `حمل العمل (${n}/8)`,
    dropHere: 'أفلت البرامج هنا',
    cols: { process: 'Process', arrival: 'الوصول', burst: 'Burst', priority: 'الأولوية', completion: 'الانتهاء', turnaround: 'Turnaround', waiting: 'Waiting', response: 'الاستجابة' },
    remove: 'إزالة',
    removeLabel: (id) => `إزالة ${id}`,
    left: (n) => `متبقٍّ ${n}`,
    allDone: 'انتهى الكل',
    idle: 'خاملة',
    isRunning: (id, name) => `${id} (${name}) قيد التشغيل`,
    needsMore: (n) => (n === 1 ? 'يحتاج إلى وحدة زمنية واحدة إضافية.' : `يحتاج إلى ${n} وحدات زمنية إضافية.`),
    everyDone: 'اكتملت جميع المهام.',
    noReady: 'لا يوجد process جاهز، لذا تبقى الـ CPU خاملة.',
    arrived: (ids) => `وصل: ${ids.join(', ')}`,
    finished: (ids) => `انتهى: ${ids.join(', ')}`,
    readyQueue: 'طابور الـ ready (من المقدمة إلى المؤخرة)',
    empty: 'فارغ',
    pcbOf: (id) => `الـ PCB الخاص بـ ${id}`,
    stateLabel: 'الحالة',
    ctxTitle: 'Context switch',
    switchesSoFar: 'التبديلات حتى الآن:',
    kernelSwap: ['الـ kernel', 'يبدّل'],
    ctxSteps: (from, to) => [
      'Interrupt: تنتقل الـ CPU إلى الـ kernel عبر trap.',
      `حفظ الـ PC والـ SP وسجلات ${from} في PCB(${from}).`,
      `يختار الـ scheduler ‏${to}.`,
      `استعادة PCB(${to}) إلى الـ CPU والعودة إلى user mode.`,
    ],
    keepsCpu: (id) => `يحتفظ ${id} بالـ CPU في هذه الوحدة الزمنية، لذا لا حاجة إلى حفظ أي حالة أو استعادتها.`,
    nothingToSwitch: 'لا يوجد ما يُبدَّل الآن.',
    stepHint: 'تقدّم في المحاكاة خطوة بخطوة وراقب التبديلات: كل تبديل يكلّف وقتًا في نظام حقيقي.',
    ganttTitle: 'Gantt chart',
    ganttIdle: 'خمول',
    stats: ['متوسط الـ waiting', 'متوسط الـ turnaround', 'متوسط الاستجابة', 'Context switches'],
  },
  es: {
    intro: (
      <>
        Un núcleo de CPU solo puede ejecutar un thread a la vez. El scheduler decide qué process listo se ejecuta a continuación y durante cuánto tiempo. Cambiar
        de un process a otro requiere un <Term k="context">context switch</Term>: el kernel guarda los registros del process en ejecución en su PCB y restaura
        los de otro.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Ready queue:</strong> los processes que podrían ejecutarse ahora mismo y esperan la CPU.
      </>,
      <>
        <strong>Métricas:</strong> <Term k="turnaround">turnaround</Term> = finalización - llegada; <Term k="waiting">waiting</Term> = turnaround - burst.
      </>,
      <>
        <strong>Los schedulers <Term k="preemption">expropiativos</Term> (preemptive)</strong> pueden quitar la CPU a mitad de un burst; los no expropiativos
        esperan a que el trabajo termine.
      </>,
    ],
    workloadTitle: '1. Construye una carga de trabajo',
    workloadSubtitle: 'Arrastra programas del catálogo a la carga de trabajo (o haz clic en ellos) y ajusta la llegada, el burst y la prioridad.',
    algoTitle: '2. Elige un algoritmo de planificación',
    algoLabel: 'Algoritmo de planificación',
    priorityAlgo: 'Priority',
    algoInfo: {
      FCFS: 'First-Come, First-Served: ejecuta los trabajos en orden de llegada hasta que cada uno termina. Sencillo, pero los trabajos cortos se quedan atascados detrás de los largos (el efecto convoy).',
      SJF: 'Shortest Job First (no expropiativo): cuando la CPU queda libre, elige el trabajo con el burst más corto. Da el waiting time promedio óptimo, pero los trabajos largos pueden sufrir starvation.',
      SRTF: 'Shortest Remaining Time First: SJF expropiativo. Un trabajo recién llegado al que le queda menos por hacer saca de la CPU al trabajo actual.',
      RR: 'Round Robin: cada trabajo recibe un quantum de tiempo fijo y luego vuelve al final de la cola. Excelente tiempo de respuesta para sistemas interactivos.',
      PRIORITY: 'Priority (no expropiativo): se ejecuta el trabajo con el número de prioridad más bajo. Sin aging, los trabajos de baja prioridad pueden sufrir starvation.',
    },
    runTitle: '3. Ejecútalo',
    time: (t) => `t = ${t}`,
    emptyWorkload: 'Añade al menos un trabajo a la carga de trabajo para empezar la simulación.',
    programs: ['Shell', 'Reproductor de música', 'Navegador', 'Juego', 'Compilador', 'Copia de seguridad'],
    poolTitle: 'Catálogo de programas',
    poolItem: (b, p) => `burst ${b} - prio ${p}`,
    workloadCount: (n) => `Carga de trabajo (${n}/8)`,
    dropHere: 'Suelta programas aquí',
    cols: { process: 'Process', arrival: 'Llegada', burst: 'Burst', priority: 'Prioridad', completion: 'Finalización', turnaround: 'Turnaround', waiting: 'Waiting', response: 'Respuesta' },
    remove: 'Quitar',
    removeLabel: (id) => `Quitar ${id}`,
    left: (n) => `quedan ${n}`,
    allDone: 'Todo listo',
    idle: 'Inactiva',
    isRunning: (id, name) => `${id} (${name}) se está ejecutando`,
    needsMore: (n) => (n === 1 ? 'Necesita 1 unidad de tiempo más.' : `Necesita ${n} unidades de tiempo más.`),
    everyDone: 'Todos los trabajos han terminado.',
    noReady: 'No hay ningún process listo, así que la CPU está inactiva.',
    arrived: (ids) => `Llegaron: ${ids.join(', ')}`,
    finished: (ids) => `Terminaron: ${ids.join(', ')}`,
    readyQueue: 'Cola ready (del primero al último)',
    empty: 'vacía',
    pcbOf: (id) => `PCB de ${id}`,
    stateLabel: 'estado',
    ctxTitle: 'Context switch',
    switchesSoFar: 'cambios hasta ahora:',
    kernelSwap: ['el kernel', 'intercambia'],
    ctxSteps: (from, to) => [
      'Interrupt: la CPU hace un trap al kernel.',
      `Guardar el PC, el SP y los registros de ${from} en PCB(${from}).`,
      `El scheduler elige a ${to}.`,
      `Restaurar PCB(${to}) en la CPU y volver a user mode.`,
    ],
    keepsCpu: (id) => `${id} conserva la CPU en este tick, así que no hay que guardar ni restaurar ningún estado.`,
    nothingToSwitch: 'No hay nada que cambiar ahora mismo.',
    stepHint: 'Avanza paso a paso por la simulación y fíjate en los cambios: cada uno cuesta tiempo en un sistema real.',
    ganttTitle: 'Gantt chart',
    ganttIdle: 'libre',
    stats: ['Waiting promedio', 'Turnaround promedio', 'Respuesta promedio', 'Context switches'],
  },
}
