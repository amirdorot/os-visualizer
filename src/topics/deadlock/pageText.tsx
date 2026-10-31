import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { BankerError, SafetyStep } from '../../engines/deadlock'
import { ltr, type Localized } from '../../i18n'

export interface WaitLink {
  p: string
  r: string
  holder: string
}

interface DeadlockText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  ragTitle: string
  ragSubtitle: string
  undo: string
  graphCycle: (cycle: string[]) => string
  graphNoCycle: string
  process: string
  waiting: string
  preemptTitle: string
  preempt: string
  release: string
  requested: string
  request: string
  legendHolds: string
  legendWaits: string
  deadlock: string
  cycleText: (links: WaitLink[]) => string
  waitingNoCycle: string
  nobodyWaiting: string
  bankerTitle: string
  bankerSubtitle: string
  loadExample: string
  status: string
  finished: (n: number) => string
  mustWait: string
  allocationLabel: (p: string, r: string) => string
  maxLabel: (p: string, r: string) => string
  availableLabel: (r: string) => string
  start: string
  next: string
  runToEnd: string
  error: (e: BankerError) => string
  step: (s: SafetyStep, released: number[]) => string
  safe: (sequence: string) => ReactNode
  unsafe: (finished: string | null) => ReactNode
  pressStart: string
}

const vec = (v: number[]) => `(${v.join(', ')})`
const compare = (s: SafetyStep, op: string) => `Need ${vec(s.need)} ${op} Work ${vec(s.work)}`

export const deadlockText: Localized<DeadlockText> = {
  en: {
    intro: (
      <>
        A <Term k="deadlock">deadlock</Term> happens when a group of processes each hold something another one needs, and all of them wait forever. The OS can detect
        deadlocks by looking for cycles in a <Term k="rag">resource allocation graph</Term>, or avoid them entirely by only granting requests that keep the system in a{' '}
        <Term k="safestate">safe state</Term>.
      </>
    ),
    keyIdeas: [
      <>
        All four <Term k="coffman">Coffman conditions</Term> are needed: mutual exclusion, hold and wait, no preemption, circular wait. Break one and deadlock is
        impossible.
      </>,
      <>
        With one instance of each resource, <strong>a cycle in the graph means deadlock</strong>. With several instances it only means deadlock is possible.
      </>,
      <>
        The <Term k="banker">banker's algorithm</Term> checks whether every process could still finish in some order before it grants a request.
      </>,
    ],
    ragTitle: 'Resource allocation graph',
    ragSubtitle: 'Each resource (square) has one instance. Use the table to make processes (circles) request and release resources, and watch for a cycle.',
    undo: 'Undo',
    graphCycle: (c) => `Graph with a deadlock cycle through ${c.join(', ')}`,
    graphNoCycle: 'Resource allocation graph with no cycle',
    process: 'Process',
    waiting: 'waiting',
    preemptTitle: 'The OS preempts the resource from this process',
    preempt: 'Preempt',
    release: 'Release',
    requested: 'requested',
    request: 'Request',
    legendHolds: 'Solid arrow R to P: P holds R',
    legendWaits: 'Dashed arrow P to R: P is waiting for R',
    deadlock: 'Deadlock!',
    cycleText: (links) =>
      `${links.map((l) => `${l.p} waits for ${l.r}, held by ${l.holder}`).join('; ')}. None of them can ever continue. To recover, the OS must preempt a resource or kill a process in the cycle.`,
    waitingNoCycle: 'Some processes are waiting, but there is no cycle: once the holder releases, they will get the resource.',
    nobodyWaiting: 'No one is waiting. Try: P1 requests R1, P2 requests R2, then P1 requests R2 and P2 requests R1.',
    bankerTitle: "Banker's algorithm: is this state safe?",
    bankerSubtitle:
      'Edit Allocation, Max and Available, then step through the safety check. A process can finish if its Need fits in Work; when it finishes, it gives back everything it holds.',
    loadExample: 'Load textbook example',
    status: 'Status',
    finished: (n) => `finished #${n}`,
    mustWait: 'must wait',
    allocationLabel: (p, r) => `${p} allocation ${r}`,
    maxLabel: (p, r) => `${p} max ${r}`,
    availableLabel: (r) => `Available ${r}`,
    start: 'Start safety check',
    next: 'Next step',
    runToEnd: 'Run to the end',
    error: (e) => `P${e.process} holds more ${e.resource} than its Max. Allocation can never exceed Max.`,
    step: (s, released) =>
      `P${s.process}: ${compare(s, s.ok ? '<=' : 'is not <=')}. ` +
      (s.ok
        ? `P${s.process} can get everything it needs, run to completion, and release its Allocation ${vec(released)}.`
        : `P${s.process} might have to wait, so skip it for now and try the next process.`),
    safe: (seq) => (
      <>
        <strong>Safe.</strong> Safe sequence: {seq}. Even if every process asks for its maximum, they can all finish in this order.
      </>
    ),
    unsafe: (finished) => (
      <>
        <strong>Unsafe.</strong> {finished ? `Only ${finished} can finish. ` : ''}No remaining process's Need fits in Work. The banker would refuse any request leading
        here.
      </>
    ),
    pressStart: 'Press "Start safety check" to walk through the algorithm one comparison at a time.',
  },
  he: {
    intro: (
      <>
        <Term k="deadlock">Deadlock</Term> קורה כשכל אחד מקבוצה של processes מחזיק משהו שאחר צריך, וכולם מחכים לנצח. מערכת ההפעלה יכולה לזהות deadlocks על ידי חיפוש
        מעגלים ב-<Term k="rag">resource allocation graph</Term>, או להימנע מהם לגמרי בכך שתאשר רק בקשות שמשאירות את המערכת ב-<Term k="safestate">safe state</Term>.
      </>
    ),
    keyIdeas: [
      <>
        צריך את כל ארבעת <Term k="coffman">תנאי Coffman</Term>: mutual exclusion, ‏hold and wait, ‏no preemption ו-circular wait. שוברים אחד מהם, ו-deadlock הופך
        לבלתי אפשרי.
      </>,
      <>
        כשיש מופע אחד מכל משאב, <strong>מעגל בגרף פירושו deadlock</strong>. כשיש כמה מופעים, הוא אומר רק ש-deadlock אפשרי.
      </>,
      <>
        ה-<Term k="banker">banker's algorithm</Term> בודק, לפני שהוא מאשר בקשה, אם כל ה-processes עדיין יכולים לסיים בסדר כלשהו.
      </>,
    ],
    ragTitle: 'Resource allocation graph',
    ragSubtitle: 'לכל משאב (ריבוע) יש מופע אחד. השתמשו בטבלה כדי לגרום ל-processes (עיגולים) לבקש ולשחרר משאבים, ושימו לב מתי נוצר מעגל.',
    undo: 'ביטול',
    graphCycle: (c) => `גרף עם מעגל deadlock שעובר דרך ${c.join(', ')}`,
    graphNoCycle: 'Resource allocation graph ללא מעגל',
    process: 'Process',
    waiting: 'מחכה',
    preemptTitle: 'מערכת ההפעלה מפקיעה את המשאב מה-process הזה (preemption)',
    preempt: 'הפקעה',
    release: 'שחרור',
    requested: 'התבקש',
    request: 'בקשה',
    legendHolds: 'חץ רציף מ-R ל-P: ‏P מחזיק את R',
    legendWaits: 'חץ מקווקו מ-P ל-R: ‏P מחכה ל-R',
    deadlock: 'Deadlock!',
    cycleText: (links) =>
      `${links.map((l) => `${l.p} מחכה ל-${l.r}, שמוחזק על ידי ${l.holder}`).join('; ')}. אף אחד מהם לא יוכל להמשיך לעולם. כדי להתאושש, מערכת ההפעלה חייבת להפקיע משאב (preempt) או להרוג process שנמצא במעגל.`,
    waitingNoCycle: 'חלק מה-processes מחכים, אבל אין מעגל: ברגע שהמחזיק ישחרר, הם יקבלו את המשאב.',
    nobodyWaiting: 'אף אחד לא מחכה. נסו: P1 מבקש את R1, ‏P2 מבקש את R2, ואז P1 מבקש את R2 ו-P2 מבקש את R1.',
    bankerTitle: "Banker's algorithm: האם המצב הזה safe?",
    bankerSubtitle: 'ערכו את Allocation, ‏Max ו-Available, ואז עברו צעד אחר צעד על בדיקת הבטיחות. Process יכול לסיים אם ה-Need שלו נכנס ב-Work; כשהוא מסיים, הוא מחזיר את כל מה שהוא מחזיק.',
    loadExample: 'טעינת הדוגמה מספר הלימוד',
    status: 'מצב',
    finished: (n) => `סיים ${ltr(`#${n}`)}`,
    mustWait: 'חייב לחכות',
    allocationLabel: (p, r) => `Allocation של ${p} עבור ${r}`,
    maxLabel: (p, r) => `Max של ${p} עבור ${r}`,
    availableLabel: (r) => `Available עבור ${r}`,
    start: 'התחלת בדיקת הבטיחות',
    next: 'הצעד הבא',
    runToEnd: 'הרצה עד הסוף',
    error: (e) => `P${e.process} מחזיק יותר ${e.resource} מה-Max שלו. Allocation לעולם לא יכול לעבור את Max.`,
    step: (s, released) =>
      `P${s.process}: ${ltr(compare(s, s.ok ? '<=' : '>'))}. ` +
      (s.ok
        ? `P${s.process} יכול לקבל את כל מה שהוא צריך, לרוץ עד הסוף ולשחרר את ה-Allocation שלו ${ltr(vec(released))}.`
        : `ייתכן ש-P${s.process} יצטרך לחכות, אז מדלגים עליו בינתיים ומנסים את ה-process הבא.`),
    safe: (seq) => (
      <>
        <strong>Safe.</strong> Safe sequence: {seq}. גם אם כל process יבקש את המקסימום שלו, כולם יוכלו לסיים בסדר הזה.
      </>
    ),
    unsafe: (finished) => (
      <>
        <strong>Unsafe.</strong> {finished ? `רק ${finished} יכולים לסיים. ` : ''}ה-Need של אף process שנשאר לא נכנס ב-Work. ה-banker יסרב לכל בקשה שמובילה לכאן.
      </>
    ),
    pressStart: 'לחצו על "התחלת בדיקת הבטיחות" כדי לעבור על האלגוריתם השוואה אחת בכל פעם.',
  },
  ar: {
    intro: (
      <>
        يحدث الـ <Term k="deadlock">deadlock</Term> عندما تمسك كل واحدة من مجموعة processes شيئًا تحتاجه أخرى، فتنتظر جميعها إلى الأبد. يستطيع نظام التشغيل كشف
        الـ deadlocks بالبحث عن دورات في الـ <Term k="rag">resource allocation graph</Term>، أو تجنّبها كليًا بألّا يوافق إلا على الطلبات التي تُبقي النظام في{' '}
        <Term k="safestate">safe state</Term>.
      </>
    ),
    keyIdeas: [
      <>
        يجب أن تتحقق <Term k="coffman">شروط Coffman</Term> الأربعة كلها: mutual exclusion و hold and wait و no preemption و circular wait. اكسر واحدًا منها ويصبح
        الـ deadlock مستحيلًا.
      </>,
      <>
        عندما يكون لكل مورد نسخة واحدة، <strong>فإن وجود دورة في الرسم يعني deadlock</strong>. أما مع عدة نسخ فهو يعني فقط أن الـ deadlock ممكن.
      </>,
      <>
        يتحقق الـ <Term k="banker">banker's algorithm</Term>، قبل أن يوافق على أي طلب، من أن كل الـ processes لا تزال قادرة على الانتهاء بترتيب ما.
      </>,
    ],
    ragTitle: 'Resource allocation graph',
    ragSubtitle: 'لكل مورد (مربع) نسخة واحدة. استخدم الجدول لتجعل الـ processes (الدوائر) تطلب الموارد وتحرّرها، وراقب ظهور دورة.',
    undo: 'تراجع',
    graphCycle: (c) => `رسم فيه دورة deadlock تمر عبر ${c.join('، ')}`,
    graphNoCycle: 'Resource allocation graph بلا دورة',
    process: 'Process',
    waiting: 'ينتظر',
    preemptTitle: 'ينتزع نظام التشغيل المورد من هذا الـ process ‏(preemption)',
    preempt: 'انتزاع',
    release: 'تحرير',
    requested: 'مطلوب',
    request: 'طلب',
    legendHolds: 'سهم متصل من R إلى P: ‏P يمسك R',
    legendWaits: 'سهم متقطع من P إلى R: ‏P ينتظر R',
    deadlock: 'Deadlock!',
    cycleText: (links) =>
      `${links.map((l) => `${l.p} ينتظر ${l.r} الذي يمسكه ${l.holder}`).join('؛ ')}. لا يمكن لأيٍّ منها أن يستمر أبدًا. للتعافي، يجب على نظام التشغيل أن ينتزع موردًا (preempt) أو أن يقتل process في الدورة.`,
    waitingNoCycle: 'بعض الـ processes تنتظر، لكن لا توجد دورة: بمجرد أن يحرّر الماسك المورد ستحصل عليه.',
    nobodyWaiting: 'لا أحد ينتظر. جرّب: P1 يطلب R1، و P2 يطلب R2، ثم P1 يطلب R2 و P2 يطلب R1.',
    bankerTitle: "Banker's algorithm: هل هذه الحالة safe؟",
    bankerSubtitle: 'عدّل Allocation و Max و Available، ثم تقدّم خطوة بخطوة في فحص الأمان. يمكن للـ process أن ينتهي إذا كان الـ Need الخاص به يتسع في Work؛ وعندما ينتهي يعيد كل ما يمسكه.',
    loadExample: 'تحميل مثال الكتاب',
    status: 'الحالة',
    finished: (n) => `انتهى ${ltr(`#${n}`)}`,
    mustWait: 'يجب أن ينتظر',
    allocationLabel: (p, r) => `Allocation لـ ${p} من ${r}`,
    maxLabel: (p, r) => `Max لـ ${p} من ${r}`,
    availableLabel: (r) => `Available من ${r}`,
    start: 'بدء فحص الأمان',
    next: 'الخطوة التالية',
    runToEnd: 'التشغيل حتى النهاية',
    error: (e) => `يمسك P${e.process} من ${e.resource} أكثر من الـ Max الخاص به. لا يمكن أن يتجاوز Allocation قيمة Max أبدًا.`,
    step: (s, released) =>
      `P${s.process}: ${ltr(compare(s, s.ok ? '<=' : '>'))}. ` +
      (s.ok
        ? `يستطيع P${s.process} الحصول على كل ما يحتاجه، والعمل حتى النهاية، وتحرير الـ Allocation الخاص به ${ltr(vec(released))}.`
        : `قد يضطر P${s.process} إلى الانتظار، لذا نتخطاه الآن ونجرّب الـ process التالي.`),
    safe: (seq) => (
      <>
        <strong>Safe.</strong> Safe sequence: {seq}. حتى لو طلب كل process الحد الأقصى، يمكنها جميعًا أن تنتهي بهذا الترتيب.
      </>
    ),
    unsafe: (finished) => (
      <>
        <strong>Unsafe.</strong> {finished ? `يمكن أن ينتهي ${finished} فقط. ` : ''}لا يتسع الـ Need لأي process متبقٍّ في Work. سيرفض الـ banker أي طلب يؤدي إلى هنا.
      </>
    ),
    pressStart: 'اضغط "بدء فحص الأمان" لتمرّ على الخوارزمية مقارنةً واحدة في كل مرة.',
  },
  es: {
    intro: (
      <>
        Un <Term k="deadlock">deadlock</Term> ocurre cuando cada process de un grupo tiene algo que otro necesita, y todos esperan para siempre. El sistema operativo
        puede detectar deadlocks buscando ciclos en un <Term k="rag">resource allocation graph</Term>, o evitarlos por completo concediendo solo las peticiones que
        mantienen el sistema en un <Term k="safestate">safe state</Term>.
      </>
    ),
    keyIdeas: [
      <>
        Hacen falta las cuatro <Term k="coffman">condiciones de Coffman</Term>: mutual exclusion, hold and wait, no preemption y circular wait. Rompe una y el deadlock
        se vuelve imposible.
      </>,
      <>
        Con una instancia de cada recurso, <strong>un ciclo en el grafo significa deadlock</strong>. Con varias instancias solo significa que el deadlock es posible.
      </>,
      <>
        El <Term k="banker">banker's algorithm</Term> comprueba, antes de conceder una petición, si todos los processes aún podrían terminar en algún orden.
      </>,
    ],
    ragTitle: 'Resource allocation graph',
    ragSubtitle: 'Cada recurso (cuadrado) tiene una instancia. Usa la tabla para que los processes (círculos) pidan y liberen recursos, y observa si aparece un ciclo.',
    undo: 'Deshacer',
    graphCycle: (c) => `Grafo con un ciclo de deadlock que pasa por ${c.join(', ')}`,
    graphNoCycle: 'Resource allocation graph sin ciclos',
    process: 'Process',
    waiting: 'esperando',
    preemptTitle: 'El sistema operativo le quita el recurso a este process (preemption)',
    preempt: 'Quitar',
    release: 'Liberar',
    requested: 'pedido',
    request: 'Pedir',
    legendHolds: 'Flecha continua de R a P: P tiene R',
    legendWaits: 'Flecha discontinua de P a R: P espera R',
    deadlock: 'Deadlock!',
    cycleText: (links) =>
      `${links.map((l) => `${l.p} espera ${l.r}, que tiene ${l.holder}`).join('; ')}. Ninguno podrá continuar jamás. Para recuperarse, el sistema operativo debe quitar un recurso (preempt) o matar un process del ciclo.`,
    waitingNoCycle: 'Algunos processes están esperando, pero no hay ciclo: en cuanto quien tiene el recurso lo libere, lo recibirán.',
    nobodyWaiting: 'Nadie está esperando. Prueba: P1 pide R1, P2 pide R2, luego P1 pide R2 y P2 pide R1.',
    bankerTitle: "Banker's algorithm: ¿es safe este estado?",
    bankerSubtitle:
      'Edita Allocation, Max y Available, y luego avanza paso a paso por la comprobación de seguridad. Un process puede terminar si su Need cabe en Work; al terminar, devuelve todo lo que tiene.',
    loadExample: 'Cargar el ejemplo del libro',
    status: 'Estado',
    finished: (n) => `terminó #${n}`,
    mustWait: 'debe esperar',
    allocationLabel: (p, r) => `Allocation de ${p} para ${r}`,
    maxLabel: (p, r) => `Max de ${p} para ${r}`,
    availableLabel: (r) => `Available de ${r}`,
    start: 'Iniciar la comprobación de seguridad',
    next: 'Siguiente paso',
    runToEnd: 'Ejecutar hasta el final',
    error: (e) => `P${e.process} tiene más ${e.resource} que su Max. Allocation nunca puede superar a Max.`,
    step: (s, released) =>
      `P${s.process}: ${compare(s, s.ok ? '<=' : 'no es <=')}. ` +
      (s.ok
        ? `P${s.process} puede obtener todo lo que necesita, ejecutarse hasta el final y liberar su Allocation ${vec(released)}.`
        : `Puede que P${s.process} tenga que esperar, así que lo saltamos por ahora y probamos con el siguiente process.`),
    safe: (seq) => (
      <>
        <strong>Safe.</strong> Safe sequence: {seq}. Aunque cada process pida su máximo, todos pueden terminar en este orden.
      </>
    ),
    unsafe: (finished) => (
      <>
        <strong>Unsafe.</strong> {finished ? `Solo ${finished} pueden terminar. ` : ''}El Need de ningún process restante cabe en Work. El banker rechazaría cualquier
        petición que lleve hasta aquí.
      </>
    ),
    pressStart: 'Pulsa "Iniciar la comprobación de seguridad" para recorrer el algoritmo comparación a comparación.',
  },
}
