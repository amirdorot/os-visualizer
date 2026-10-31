import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { Role, SemName } from '../../engines/sync'
import { ltr, type Localized } from '../../i18n'

export type PlayLog =
  | { k: 'hint' }
  | { k: 'waitOk'; t: number; from: number }
  | { k: 'waitSleep'; t: number }
  | { k: 'signalWake'; t: number; value: number }
  | { k: 'signalInc'; from: number }

interface SyncText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  playTitle: string
  playSubtitle: string
  startAt: string
  initialValue: string
  choose: string
  value: string
  sleeping: string
  empty: string
  log: (l: PlayLog) => string
  semInfo: Record<SemName, string>
  labTitle: string
  labSubtitle: string
  version: string
  safe: string
  unsafe: string
  slots: string
  producers: string
  consumers: string
  newSchedule: string
  progress: (produced: number, consumed: number) => string
  sharedBuffer: string
  used: (n: number, capacity: number) => string
  bufferAria: (n: number) => string
  actor: (role: Role, idx: number) => string
  sleepingOn: (sem: SemName) => string
  holding: (item: string) => string
  garbage: string
  ready: string
  runBlocked: string
  runNext: string
  lastBlocked: (name: ReactNode, op: ReactNode, sem: SemName) => ReactNode
  lastRan: (name: ReactNode, op: ReactNode) => ReactNode
  overflow: string
  underflow: string
  soFar: (overflows: number, underflows: number) => string
}

export const syncText: Localized<SyncText> = {
  en: {
    intro: (
      <>
        A mutex lets one thread in at a time. Many problems need more: a producer must <em>wait</em> until there is room,
        and a consumer must wait until there is something to take. A <Term k="semaphore">semaphore</Term> is a counter
        that threads can sleep on, and it solves both. The classic exercise is the{' '}
        <Term k="boundedbuffer">bounded buffer</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>wait(s)</strong>: if s &gt; 0, decrement and continue; otherwise sleep until someone signals.{' '}
        <strong>signal(s)</strong>: increment, or wake one sleeping thread.
      </>,
      <>
        <strong>empty</strong> counts free slots and <strong>full</strong> counts filled ones. They make threads wait for
        a condition, instead of <Term k="busywait">busy waiting</Term>.
      </>,
      <>
        <strong>mutex</strong> (a semaphore starting at 1) keeps two threads from editing the buffer's head and tail at the
        same moment.
      </>,
    ],
    playTitle: 'Semaphore playground',
    playSubtitle: 'A semaphore is a counter plus a queue of sleeping threads. Each wait() comes from a new thread.',
    startAt: 'Start at',
    initialValue: 'Initial value',
    choose: 'choose',
    value: 'value',
    sleeping: 'Sleeping threads (wait queue)',
    empty: 'empty',
    log: (l) => {
      switch (l.k) {
        case 'hint': return 'Click wait() or signal() to see what happens to the counter and the queue.'
        case 'waitOk': return `T${l.t} called wait(): value was ${l.from}, now ${l.from - 1}. T${l.t} continues.`
        case 'waitSleep': return `T${l.t} called wait(): value is 0, so T${l.t} goes to sleep in the queue.`
        case 'signalWake': return `signal(): T${l.t} was waiting, so it wakes up and continues. The value stays ${l.value}.`
        case 'signalInc': return `signal(): nobody is waiting, so the value goes from ${l.from} to ${l.from + 1}.`
      }
    },
    semInfo: { empty: 'free slots', full: 'filled slots', mutex: '1 = buffer unlocked' },
    labTitle: 'Bounded buffer lab',
    labSubtitle: 'Producers put items into a shared buffer and consumers take them out. Press Play for a random schedule, or run each thread yourself.',
    version: 'Version',
    safe: 'With semaphores',
    unsafe: 'No semaphores',
    slots: 'Slots',
    producers: 'Producers',
    consumers: 'Consumers',
    newSchedule: 'New random schedule',
    progress: (p, c) => `produced ${p}, consumed ${c}`,
    sharedBuffer: 'Shared buffer',
    used: (n, cap) => `${n} / ${cap} used`,
    bufferAria: (n) => `Buffer contains ${n} items`,
    actor: (role, i) => `${role === 'producer' ? 'Producer' : 'Consumer'} ${i}`,
    sleepingOn: (sem) => `sleeping on ${sem}`,
    holding: (item) => `holding ${item}`,
    garbage: 'garbage',
    ready: 'ready',
    runBlocked: 'Try to run (will block)',
    runNext: 'Run next instruction',
    lastBlocked: (name, op, sem) => (
      <>
        <strong>{name}</strong> tried {op} but {sem} is 0, so it sleeps.{' '}
        {sem === 'empty' ? 'The buffer is full; it must wait for a consumer.' : sem === 'full' ? 'The buffer is empty; it must wait for a producer.' : 'Another thread is inside the buffer.'}
      </>
    ),
    lastRan: (name, op) => (
      <>
        <strong>{name}</strong> ran {op}.
      </>
    ),
    overflow: 'Overflow! The producer wrote into a full buffer and overwrote an item nobody had consumed yet. With semaphores, wait(empty) would have put it to sleep instead.',
    underflow: 'Underflow! The consumer took from an empty buffer and got garbage. With semaphores, wait(full) would have put it to sleep instead.',
    soFar: (o, u) => `So far: ${o} overflow(s) and ${u} underflow(s). Nothing stops a thread from running at the wrong moment.`,
  },
  he: {
    intro: (
      <>
        Mutex מכניס thread אחד בכל פעם. בהרבה בעיות צריך יותר: producer חייב <em>לחכות</em> עד שיש מקום, ו-consumer חייב לחכות עד
        שיש משהו לקחת. <Term k="semaphore">Semaphore</Term> הוא מונה ש-threads יכולים לישון עליו, והוא פותר את שתי הבעיות. התרגיל
        הקלאסי הוא ה-<Term k="boundedbuffer">bounded buffer</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>wait(s)</strong>: אם {ltr('s > 0')}, מקטינים וממשיכים; אחרת ישנים עד שמישהו קורא ל-signal.{' '}
        <strong>signal(s)</strong>: מגדילים, או מעירים thread אחד שישן.
      </>,
      <>
        <strong>empty</strong> סופר תאים פנויים ו-<strong>full</strong> סופר תאים מלאים. הם גורמים ל-threads לחכות לתנאי, במקום{' '}
        <Term k="busywait">busy waiting</Term>.
      </>,
      <>
        <strong>mutex</strong> (semaphore שמתחיל ב-1) מונע משני threads לשנות את הראש והזנב של ה-buffer באותו רגע.
      </>,
    ],
    playTitle: 'מגרש המשחקים של ה-semaphore',
    playSubtitle: 'Semaphore הוא מונה ועוד תור של threads ישנים. כל wait() מגיעה מ-thread חדש.',
    startAt: 'ערך התחלתי',
    initialValue: 'ערך התחלתי',
    choose: 'בחרו',
    value: 'ערך',
    sleeping: 'Threads ישנים (תור ההמתנה)',
    empty: 'ריק',
    log: (l) => {
      switch (l.k) {
        case 'hint': return 'לחצו על wait() או signal() כדי לראות מה קורה למונה ולתור.'
        case 'waitOk': return `T${l.t} קרא ל-wait(): הערך היה ${l.from}, ועכשיו ${l.from - 1}. T${l.t} ממשיך.`
        case 'waitSleep': return `T${l.t} קרא ל-wait(): הערך הוא 0, ולכן T${l.t} הולך לישון בתור.`
        case 'signalWake': return `signal(): ‏T${l.t} חיכה, ולכן הוא מתעורר וממשיך. הערך נשאר ${l.value}.`
        case 'signalInc': return `signal(): אף אחד לא מחכה, ולכן הערך עולה מ-${l.from} ל-${l.from + 1}.`
      }
    },
    semInfo: { empty: 'תאים פנויים', full: 'תאים מלאים', mutex: `${ltr('1')} = ה-buffer פתוח` },
    labTitle: 'מעבדת ה-bounded buffer',
    labSubtitle: 'Producers מכניסים items ל-buffer משותף ו-consumers מוציאים אותם. לחצו על Play לתזמון אקראי, או הריצו כל thread בעצמכם.',
    version: 'גרסה',
    safe: 'עם semaphores',
    unsafe: 'בלי semaphores',
    slots: 'תאים',
    producers: 'Producers',
    consumers: 'Consumers',
    newSchedule: 'תזמון אקראי חדש',
    progress: (p, c) => `יוצרו ${p}, נצרכו ${c}`,
    sharedBuffer: 'Buffer משותף',
    used: (n, cap) => `${ltr(`${n} / ${cap}`)} בשימוש`,
    bufferAria: (n) => `ה-buffer מכיל ${n} items`,
    actor: (role, i) => `${role === 'producer' ? 'Producer' : 'Consumer'} ${i}`,
    sleepingOn: (sem) => `ישן על ${sem}`,
    holding: (item) => `מחזיק ${item}`,
    garbage: 'זבל',
    ready: 'מוכן',
    runBlocked: 'לנסות להריץ (ייחסם)',
    runNext: 'הרצת הפקודה הבאה',
    lastBlocked: (name, op, sem) => (
      <>
        <strong>{name}</strong> ניסה {op} אבל {sem} הוא 0, ולכן הוא נרדם.{' '}
        {sem === 'empty' ? 'ה-buffer מלא; הוא חייב לחכות ל-consumer.' : sem === 'full' ? 'ה-buffer ריק; הוא חייב לחכות ל-producer.' : 'Thread אחר נמצא בתוך ה-buffer.'}
      </>
    ),
    lastRan: (name, op) => (
      <>
        <strong>{name}</strong> הריץ {op}.
      </>
    ),
    overflow: 'Overflow! ה-producer כתב ל-buffer מלא ודרס item שאף אחד עוד לא צרך. עם semaphores, wait(empty) הייתה מרדימה אותו במקום זה.',
    underflow: 'Underflow! ה-consumer לקח מ-buffer ריק וקיבל זבל. עם semaphores, wait(full) הייתה מרדימה אותו במקום זה.',
    soFar: (o, u) => `עד עכשיו: ${o} מקרי overflow ו-${u} מקרי underflow. שום דבר לא מונע מ-thread לרוץ ברגע הלא נכון.`,
  },
  ar: {
    intro: (
      <>
        يسمح الـ mutex بدخول thread واحد في كل مرة. كثير من المسائل تحتاج أكثر من ذلك: على الـ producer أن <em>ينتظر</em> حتى يتوفر مكان،
        وعلى الـ consumer أن ينتظر حتى يوجد شيء ليأخذه. الـ <Term k="semaphore">semaphore</Term> عدّاد يمكن للـ threads أن تنام عليه، وهو يحل
        المشكلتين معًا. التمرين الكلاسيكي هو الـ <Term k="boundedbuffer">bounded buffer</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>wait(s)</strong>: إذا كان {ltr('s > 0')}، أنقص القيمة وتابع؛ وإلا نم حتى يستدعي أحدهم signal.{' '}
        <strong>signal(s)</strong>: زِد القيمة، أو أيقظ thread نائمًا واحدًا.
      </>,
      <>
        يعدّ <strong>empty</strong> الخانات الفارغة ويعدّ <strong>full</strong> الخانات الممتلئة. يجعلان الـ threads تنتظر شرطًا بدل الـ{' '}
        <Term k="busywait">busy waiting</Term>.
      </>,
      <>
        يمنع <strong>mutex</strong> (وهو semaphore يبدأ بالقيمة 1) اثنين من الـ threads من تعديل رأس الـ buffer وذيله في اللحظة نفسها.
      </>,
    ],
    playTitle: 'ساحة تجربة الـ semaphore',
    playSubtitle: 'الـ semaphore عدّاد مع طابور من الـ threads النائمة. كل wait() تأتي من thread جديد.',
    startAt: 'البداية عند',
    initialValue: 'القيمة الابتدائية',
    choose: 'اختر',
    value: 'القيمة',
    sleeping: 'الـ threads النائمة (طابور الانتظار)',
    empty: 'فارغ',
    log: (l) => {
      switch (l.k) {
        case 'hint': return 'انقر على wait() أو signal() لترى ما يحدث للعدّاد وللطابور.'
        case 'waitOk': return `استدعى T${l.t} ‏wait(): كانت القيمة ${l.from}، وأصبحت ${l.from - 1}. يتابع T${l.t}.`
        case 'waitSleep': return `استدعى T${l.t} ‏wait(): القيمة 0، لذا ينام T${l.t} في الطابور.`
        case 'signalWake': return `signal(): كان T${l.t} ينتظر، فيستيقظ ويتابع. تبقى القيمة ${l.value}.`
        case 'signalInc': return `signal(): لا أحد ينتظر، لذا ترتفع القيمة من ${l.from} إلى ${l.from + 1}.`
      }
    },
    semInfo: { empty: 'خانات فارغة', full: 'خانات ممتلئة', mutex: `${ltr('1')} = الـ buffer مفتوح` },
    labTitle: 'مختبر الـ bounded buffer',
    labSubtitle: 'تضع الـ producers عناصر (items) في buffer مشترك وتأخذها الـ consumers منه. اضغط Play لجدولة عشوائية، أو شغّل كل thread بنفسك.',
    version: 'النسخة',
    safe: 'مع semaphores',
    unsafe: 'بدون semaphores',
    slots: 'الخانات',
    producers: 'Producers',
    consumers: 'Consumers',
    newSchedule: 'جدولة عشوائية جديدة',
    progress: (p, c) => `أُنتج ${p}، واستُهلك ${c}`,
    sharedBuffer: 'الـ buffer المشترك',
    used: (n, cap) => `${ltr(`${n} / ${cap}`)} مستخدمة`,
    bufferAria: (n) => `يحتوي الـ buffer على ${n} items`,
    actor: (role, i) => `${role === 'producer' ? 'Producer' : 'Consumer'} ${i}`,
    sleepingOn: (sem) => `نائم على ${sem}`,
    holding: (item) => `يحمل ${item}`,
    garbage: 'بيانات عشوائية',
    ready: 'جاهز',
    runBlocked: 'محاولة التشغيل (سيُحجَب)',
    runNext: 'تنفيذ التعليمة التالية',
    lastBlocked: (name, op, sem) => (
      <>
        حاول <strong>{name}</strong> تنفيذ {op} لكن {sem} يساوي 0، لذا ينام.{' '}
        {sem === 'empty' ? 'الـ buffer ممتلئ؛ عليه أن ينتظر consumer.' : sem === 'full' ? 'الـ buffer فارغ؛ عليه أن ينتظر producer.' : 'يوجد thread آخر داخل الـ buffer.'}
      </>
    ),
    lastRan: (name, op) => (
      <>
        نفّذ <strong>{name}</strong> {op}.
      </>
    ),
    overflow: 'Overflow! كتب الـ producer في buffer ممتلئ وكتب فوق item لم يستهلكه أحد بعد. مع الـ semaphores، كان wait(empty) سينيّمه بدلًا من ذلك.',
    underflow: 'Underflow! أخذ الـ consumer من buffer فارغ فحصل على بيانات عشوائية. مع الـ semaphores، كان wait(full) سينيّمه بدلًا من ذلك.',
    soFar: (o, u) => `حتى الآن: ${o} حالة overflow و${u} حالة underflow. لا شيء يمنع thread من العمل في اللحظة الخاطئة.`,
  },
  es: {
    intro: (
      <>
        Un mutex deja entrar a un solo thread a la vez. Muchos problemas necesitan más: un producer debe <em>esperar</em> hasta que haya
        sitio, y un consumer debe esperar hasta que haya algo que tomar. Un <Term k="semaphore">semaphore</Term> es un contador sobre el
        que los threads pueden dormir, y resuelve ambas cosas. El ejercicio clásico es el <Term k="boundedbuffer">bounded buffer</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>wait(s)</strong>: si s &gt; 0, decrementa y continúa; si no, duerme hasta que alguien haga signal.{' '}
        <strong>signal(s)</strong>: incrementa, o despierta a un thread dormido.
      </>,
      <>
        <strong>empty</strong> cuenta las posiciones libres y <strong>full</strong> las ocupadas. Hacen que los threads esperen una
        condición, en lugar de hacer <Term k="busywait">busy waiting</Term>.
      </>,
      <>
        <strong>mutex</strong> (un semaphore que empieza en 1) impide que dos threads modifiquen la cabeza y la cola del buffer en el
        mismo momento.
      </>,
    ],
    playTitle: 'Zona de pruebas del semaphore',
    playSubtitle: 'Un semaphore es un contador más una cola de threads dormidos. Cada wait() viene de un thread nuevo.',
    startAt: 'Empezar en',
    initialValue: 'Valor inicial',
    choose: 'elige',
    value: 'valor',
    sleeping: 'Threads dormidos (cola de espera)',
    empty: 'vacía',
    log: (l) => {
      switch (l.k) {
        case 'hint': return 'Haz clic en wait() o signal() para ver qué pasa con el contador y la cola.'
        case 'waitOk': return `T${l.t} llamó a wait(): el valor era ${l.from}, ahora es ${l.from - 1}. T${l.t} continúa.`
        case 'waitSleep': return `T${l.t} llamó a wait(): el valor es 0, así que T${l.t} se duerme en la cola.`
        case 'signalWake': return `signal(): T${l.t} estaba esperando, así que se despierta y continúa. El valor sigue en ${l.value}.`
        case 'signalInc': return `signal(): nadie está esperando, así que el valor pasa de ${l.from} a ${l.from + 1}.`
      }
    },
    semInfo: { empty: 'posiciones libres', full: 'posiciones ocupadas', mutex: '1 = buffer desbloqueado' },
    labTitle: 'Laboratorio del bounded buffer',
    labSubtitle: 'Los producers meten items en un buffer compartido y los consumers los sacan. Pulsa Play para una planificación aleatoria o ejecuta cada thread tú mismo.',
    version: 'Versión',
    safe: 'Con semaphores',
    unsafe: 'Sin semaphores',
    slots: 'Posiciones',
    producers: 'Producers',
    consumers: 'Consumers',
    newSchedule: 'Nueva planificación aleatoria',
    progress: (p, c) => `producidos ${p}, consumidos ${c}`,
    sharedBuffer: 'Buffer compartido',
    used: (n, cap) => `${n} / ${cap} en uso`,
    bufferAria: (n) => `El buffer contiene ${n} items`,
    actor: (role, i) => `${role === 'producer' ? 'Producer' : 'Consumer'} ${i}`,
    sleepingOn: (sem) => `durmiendo en ${sem}`,
    holding: (item) => `tiene ${item}`,
    garbage: 'basura',
    ready: 'listo',
    runBlocked: 'Intentar ejecutar (se bloqueará)',
    runNext: 'Ejecutar la siguiente instrucción',
    lastBlocked: (name, op, sem) => (
      <>
        <strong>{name}</strong> intentó {op} pero {sem} vale 0, así que se duerme.{' '}
        {sem === 'empty' ? 'El buffer está lleno; debe esperar a un consumer.' : sem === 'full' ? 'El buffer está vacío; debe esperar a un producer.' : 'Otro thread está dentro del buffer.'}
      </>
    ),
    lastRan: (name, op) => (
      <>
        <strong>{name}</strong> ejecutó {op}.
      </>
    ),
    overflow: '¡Overflow! El producer escribió en un buffer lleno y sobrescribió un item que nadie había consumido todavía. Con semaphores, wait(empty) lo habría dormido.',
    underflow: '¡Underflow! El consumer tomó de un buffer vacío y obtuvo basura. Con semaphores, wait(full) lo habría dormido.',
    soFar: (o, u) => `Hasta ahora: ${o} overflow(s) y ${u} underflow(s). Nada impide que un thread se ejecute en el momento equivocado.`,
  },
}
