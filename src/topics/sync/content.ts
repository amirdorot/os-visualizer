import { ltr, type Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

const consumerItems = ['wait(full)', 'wait(mutex)', 'item = buffer.take()', 'signal(mutex)', 'signal(empty)', 'consume(item)']

export const syncQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'sync-empty-init': {
      prompt: 'בפתרון ה-bounded buffer עם buffer של N תאים, מה הערכים ההתחלתיים של ה-semaphores ‏empty, ‏full ו-mutex?',
      explanation: 'empty סופר תאים פנויים (בהתחלה כל ה-N), full סופר תאים מלאים (עדיין אין), ו-mutex הוא binary semaphore שמתחיל פתוח עם הערך 1.',
    },
    'sync-sem-value': {
      prompt: 'Semaphore מתחיל ב-2. Threads קוראים ל-wait(), wait(), wait(), signal(). כמה threads עדיין חסומים אחרי זה?',
      unit: 'threads',
      explanation: `שתי הקריאות הראשונות ל-wait() מורידות את הערך ${ltr('2 -> 0')}. ה-wait() השלישית נחסמת. ה-signal() מעירה את ה-thread החסום במקום להגדיל את הערך, ולכן אף thread לא נשאר חסום והערך הוא 0.`,
    },
    'sync-swap-order': {
      prompt: 'Producer קורא ל-wait(mutex) לפני wait(empty). מה יכול לקרות כשה-buffer מלא?',
      options: [
        'שום דבר: הסדר של קריאות ה-wait() אף פעם לא משנה',
        'ה-buffer גולש (overflow)',
        'Deadlock: ה-producer מחזיק ב-mutex בזמן שהוא חסום על empty, ולכן אף consumer לא יכול לקבל את ה-mutex כדי לפנות תא',
        'ה-consumer קורא זבל',
      ],
      explanation: 'ה-producer נרדם על empty כשהוא מחזיק ב-mutex. כל consumer נחסם אז על wait(mutex), ולכן אף אחד לא קורא אף פעם ל-signal(empty). תמיד חכו קודם על ה-counting semaphore, ורק אז קחו את ה-lock.',
    },
    'sync-consumer-order': {
      prompt: 'סדרו את הלולאה של ה-consumer בסדר הנכון.',
      items: consumerItems,
      explanation: 'מחכים שיהיה item (full), נועלים את ה-buffer, לוקחים את ה-item, משחררים, מודיעים שהתפנה תא (empty), ורק אז עושים את העבודה האיטית של הצריכה מחוץ ל-critical section.',
    },
    'sync-busy': {
      prompt: 'למה semaphore חוסם את ה-thread שמחכה במקום להריץ לולאה עד שהערך יהיה חיובי?',
      options: [
        'אסור לכתוב לולאות ב-C',
        'חסימה משחררת את ה-CPU ל-threads אחרים, בעוד busy waiting שורף זמן CPU בלי לעשות שום דבר מועיל',
        'חסימה מהירה יותר בהמתנות קצרות מאוד',
        'לולאה הייתה גורמת ל-race condition על ה-buffer',
      ],
      explanation: 'Thread חסום מועבר לתור ההמתנה של ה-semaphore, וה-scheduler מריץ משהו אחר. Spinning ‏(busy waiting) הגיוני רק כשההמתנה קצרה יותר מ-context switch.',
    },
  },
  ar: {
    'sync-empty-init': {
      prompt: 'في حل الـ bounded buffer مع buffer من N خانات، ما القيم الابتدائية للـ semaphores ‏empty و full و mutex؟',
      explanation: 'يعدّ empty الخانات الفارغة (كل الـ N في البداية)، ويعدّ full الخانات الممتلئة (لا شيء بعد)، والـ mutex هو binary semaphore يبدأ مفتوحًا بالقيمة 1.',
    },
    'sync-sem-value': {
      prompt: 'يبدأ semaphore بالقيمة 2. تستدعي threads ‏wait()، wait()، wait()، signal(). كم thread يبقى محجوبًا بعد ذلك؟',
      unit: 'threads',
      explanation: `أول استدعاءين لـ wait() ينقلان القيمة ${ltr('2 -> 0')}. يُحجَب الاستدعاء الثالث لـ wait(). يوقظ signal() الـ thread المحجوب بدل زيادة القيمة، فلا يبقى أي thread محجوبًا وتكون القيمة 0.`,
    },
    'sync-swap-order': {
      prompt: 'يستدعي producer ‏wait(mutex) قبل wait(empty). ماذا يمكن أن يحدث عندما يكون الـ buffer ممتلئًا؟',
      options: [
        'لا شيء: ترتيب استدعاءات wait() لا يهم أبدًا',
        'يفيض الـ buffer (overflow)',
        'Deadlock: يمسك الـ producer بالـ mutex وهو محجوب على empty، فلا يستطيع أي consumer الحصول على الـ mutex لتفريغ خانة',
        'يقرأ الـ consumer بيانات عشوائية لا معنى لها',
      ],
      explanation: 'ينام الـ producer على empty وهو يمسك بالـ mutex. عندها يُحجَب كل consumer على wait(mutex)، فلا أحد يستدعي signal(empty) أبدًا. انتظر دائمًا على الـ counting semaphore أولًا، ثم خذ الـ lock.',
    },
    'sync-consumer-order': {
      prompt: 'رتّب حلقة الـ consumer بالترتيب الصحيح.',
      items: consumerItems,
      explanation: 'انتظر حتى يوجد item ‏(full)، ثم اقفل الـ buffer، وخذ الـ item، وافتح القفل، وأعلن عن خانة فارغة (empty)، ثم قم بالعمل البطيء للاستهلاك خارج الـ critical section.',
    },
    'sync-busy': {
      prompt: 'لماذا يحجب الـ semaphore الـ thread المنتظر بدل أن يدور في حلقة حتى تصبح القيمة موجبة؟',
      options: [
        'الحلقات غير مسموحة في C',
        'الحجب يحرّر الـ CPU للـ threads الأخرى، بينما يحرق الـ busy waiting وقت الـ CPU دون فائدة',
        'الحجب أسرع في حالات الانتظار القصيرة جدًا',
        'الحلقة ستسبب race condition على الـ buffer',
      ],
      explanation: 'يُنقل الـ thread المحجوب إلى طابور الانتظار الخاص بالـ semaphore ويشغّل الـ scheduler شيئًا آخر. الـ spinning ‏(busy waiting) منطقي فقط عندما يكون الانتظار أقصر من context switch.',
    },
  },
  es: {
    'sync-empty-init': {
      prompt: 'En la solución del bounded buffer con un buffer de N posiciones, ¿cuáles son los valores iniciales de los semaphores empty, full y mutex?',
      explanation: 'empty cuenta las posiciones libres (las N al principio), full cuenta las ocupadas (ninguna todavía) y mutex es un binary semaphore que empieza desbloqueado en 1.',
    },
    'sync-sem-value': {
      prompt: 'Un semaphore empieza en 2. Varios threads llaman a wait(), wait(), wait(), signal(). Después, ¿cuántos threads siguen bloqueados?',
      unit: 'threads',
      explanation: 'Las dos primeras llamadas a wait() llevan el valor de 2 a 0. El tercer wait() se bloquea. El signal() despierta a ese thread bloqueado en lugar de incrementar, así que ningún thread queda bloqueado y el valor es 0.',
    },
    'sync-swap-order': {
      prompt: 'Un producer llama a wait(mutex) ANTES de wait(empty). ¿Qué puede pasar cuando el buffer está lleno?',
      options: [
        'Nada: el orden de las llamadas a wait() nunca importa',
        'El buffer se desborda (overflow)',
        'Deadlock: el producer tiene el mutex mientras está bloqueado en empty, así que ningún consumer puede obtener el mutex para liberar una posición',
        'El consumer lee basura',
      ],
      explanation: 'El producer se duerme en empty mientras tiene el mutex. Entonces todos los consumers se bloquean en wait(mutex), así que nadie llama nunca a signal(empty). Espera siempre primero en el counting semaphore y después toma el lock.',
    },
    'sync-consumer-order': {
      prompt: 'Ordena correctamente el bucle del consumer.',
      items: consumerItems,
      explanation: 'Espera a que haya un item (full), bloquea el buffer, toma el item, desbloquea, anuncia una posición libre (empty) y después haz el trabajo lento de consumir fuera de la critical section.',
    },
    'sync-busy': {
      prompt: '¿Por qué un semaphore bloquea al thread que espera en lugar de dar vueltas en un bucle hasta que el valor sea positivo?',
      options: [
        'Los bucles no están permitidos en C',
        'Bloquear libera la CPU para otros threads, mientras que el busy waiting gasta tiempo de CPU sin hacer nada útil',
        'Bloquear es más rápido para esperas muy cortas',
        'El bucle causaría una race condition en el buffer',
      ],
      explanation: 'Un thread bloqueado pasa a la cola de espera del semaphore y el scheduler ejecuta otra cosa. El spinning (busy waiting) solo tiene sentido cuando la espera es más corta que un context switch.',
    },
  },
}

export const syncChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-sync-full': ['למלא את ה-buffer כך שה-producer ייחסם', 'הריצו רק את ה-producer עד ש-wait(empty) לא יכולה להמשיך.'],
    'ch-sync-empty': ['לגרום ל-consumer להיחסם על buffer ריק', 'אפסו, ואז הריצו קודם את ה-consumer.'],
    'ch-sync-bug': ['לשבור את הגרסה הלא בטוחה: overflow או underflow של ה-buffer', 'עברו ל"בלי semaphores" והמשיכו להריץ צד אחד.'],
    'ch-sync-ten': ['להעביר 10 items דרך ה-buffer הבטוח', 'השתמשו בגרסה הבטוחה ולחצו על Play.'],
  },
  ar: {
    'ch-sync-full': ['املأ الـ buffer حتى يُحجَب الـ producer', 'شغّل الـ producer وحده حتى لا يستطيع wait(empty) المتابعة.'],
    'ch-sync-empty': ['اجعل الـ consumer يُحجَب على buffer فارغ', 'أعد الضبط، ثم شغّل الـ consumer أولًا.'],
    'ch-sync-bug': ['اكسر النسخة غير الآمنة: overflow أو underflow في الـ buffer', 'انتقل إلى "بدون semaphores" واستمر في تشغيل جانب واحد.'],
    'ch-sync-ten': ['مرّر 10 items عبر الـ buffer الآمن', 'استخدم النسخة الآمنة واضغط Play.'],
  },
  es: {
    'ch-sync-full': ['Llenar el buffer para que un producer se bloquee', 'Ejecuta solo el producer hasta que wait(empty) no pueda continuar.'],
    'ch-sync-empty': ['Hacer que un consumer se bloquee con el buffer vacío', 'Reinicia y ejecuta primero el consumer.'],
    'ch-sync-bug': ['Romper la versión insegura: overflow o underflow del buffer', 'Cambia a "Sin semaphores" y sigue ejecutando un solo lado.'],
    'ch-sync-ten': ['Pasar 10 items por el buffer seguro', 'Usa la versión segura y pulsa Play.'],
  },
}

interface GenText {
  prompt: (initial: number, askBlocked: boolean) => string
  unit: string
  waitDec: (from: number, to: number) => string
  waitBlocks: (blocked: number) => string
  signalWakes: (blocked: number) => string
  signalInc: (from: number, to: number) => string
  summary: (value: number, blocked: number) => string
}

export const syncGenText: Localized<GenText> = {
  en: {
    prompt: (initial, askBlocked) =>
      `A semaphore starts at ${initial}. Different threads perform these operations in order. ${askBlocked ? 'How many threads are blocked at the end?' : 'What is the semaphore value at the end?'}`,
    unit: 'threads',
    waitDec: (from, to) => `wait: ${from} -> ${to}`,
    waitBlocks: (b) => `wait: value is 0, the thread blocks (${b} blocked)`,
    signalWakes: (b) => `signal: wakes a blocked thread (${b} blocked)`,
    signalInc: (from, to) => `signal: ${from} -> ${to}`,
    summary: (v, b) => `Final value ${v}, ${b} thread(s) blocked. Note that signal() wakes a waiting thread instead of incrementing when someone is blocked.`,
  },
  he: {
    prompt: (initial, askBlocked) =>
      `Semaphore מתחיל ב-${initial}. Threads שונים מבצעים את הפעולות האלה לפי הסדר. ${askBlocked ? 'כמה threads חסומים בסוף?' : 'מה הערך של ה-semaphore בסוף?'}`,
    unit: 'threads',
    waitDec: (from, to) => `wait: ${ltr(`${from} -> ${to}`)}`,
    waitBlocks: (b) => `wait: הערך הוא 0, ה-thread נחסם (${b} חסומים)`,
    signalWakes: (b) => `signal: מעירה thread חסום (${b} חסומים)`,
    signalInc: (from, to) => `signal: ${ltr(`${from} -> ${to}`)}`,
    summary: (v, b) => `הערך הסופי ${v}, ו-${b} threads חסומים. שימו לב ש-signal() מעירה thread שמחכה במקום להגדיל את הערך כשמישהו חסום.`,
  },
  ar: {
    prompt: (initial, askBlocked) =>
      `يبدأ semaphore بالقيمة ${initial}. تنفّذ threads مختلفة هذه العمليات بالترتيب. ${askBlocked ? 'كم thread يكون محجوبًا في النهاية؟' : 'ما قيمة الـ semaphore في النهاية؟'}`,
    unit: 'threads',
    waitDec: (from, to) => `wait: ${ltr(`${from} -> ${to}`)}`,
    waitBlocks: (b) => `wait: القيمة 0، فيُحجَب الـ thread (${b} محجوب)`,
    signalWakes: (b) => `signal: يوقظ thread محجوبًا (${b} محجوب)`,
    signalInc: (from, to) => `signal: ${ltr(`${from} -> ${to}`)}`,
    summary: (v, b) => `القيمة النهائية ${v}، وعدد الـ threads المحجوبة ${b}. لاحظ أن signal() يوقظ thread منتظرًا بدل زيادة القيمة عندما يكون هناك من هو محجوب.`,
  },
  es: {
    prompt: (initial, askBlocked) =>
      `Un semaphore empieza en ${initial}. Distintos threads realizan estas operaciones en orden. ${askBlocked ? '¿Cuántos threads quedan bloqueados al final?' : '¿Cuál es el valor del semaphore al final?'}`,
    unit: 'threads',
    waitDec: (from, to) => `wait: ${from} -> ${to}`,
    waitBlocks: (b) => `wait: el valor es 0, el thread se bloquea (${b} bloqueados)`,
    signalWakes: (b) => `signal: despierta a un thread bloqueado (${b} bloqueados)`,
    signalInc: (from, to) => `signal: ${from} -> ${to}`,
    summary: (v, b) => `Valor final ${v}, ${b} thread(s) bloqueados. Fíjate en que signal() despierta a un thread en espera en lugar de incrementar cuando hay alguno bloqueado.`,
  },
}
