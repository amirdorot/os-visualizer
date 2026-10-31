import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import { ltr, type Localized } from '../../i18n'

type Segment = [name: string, desc: string]

interface ThreadsText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  spaceTitle: string
  spaceSubtitle: string
  removeThread: string
  addThread: string
  threadCount: (n: number) => string
  addressSpace: string
  sharedBy: string
  privateTo: string
  segments: [code: Segment, data: Segment, heap: Segment, files: Segment]
  thread: (id: number) => string
  stackRegs: string
  sameCounter: (counter: ReactNode) => ReactNode
  labTitle: string
  labSubtitle: string
  mutex: string
  off: string
  on: string
  threads: string
  incrementsEach: string
  newSeed: string
  executed: (n: number) => string
  sharedCounter: string
  completed: (n: number, total: number) => string
  mutexName: string
  unlocked: string
  heldBy: (id: number) => string
  lastBlocked: (thread: ReactNode) => ReactNode
  lastRan: (thread: ReactNode, op: ReactNode) => ReactNode
  finished: string
  blocked: string
  loop: (i: number, n: number) => string
  runNext: string
  goodMutex: (value: number, total: number) => string
  goodLucky: (value: number, total: number) => string
  bad: (value: number, total: number, lost: number) => string
  warn: (done: number, value: number, lost: number) => string
  tip: string
}

export const threadsText: Localized<ThreadsText> = {
  en: {
    intro: (
      <>
        A <Term k="thread">thread</Term> is a separate flow of execution inside a process. Threads share almost everything, which makes communication fast and cheap, but it
        also means two threads can modify the same data at the same time. Without synchronization this causes a <Term k="race">race condition</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Shared:</strong> code, global data, heap, open files. <strong>Private:</strong> stack, registers, program counter.
      </>,
      <>
        <strong>counter++ is not atomic.</strong> It is three machine instructions, and the scheduler can switch threads between any two of them.
      </>,
      <>
        A <Term k="mutex">mutex</Term> turns the read-modify-write into a <Term k="critical">critical section</Term> that only one thread can be inside at a time.
      </>,
    ],
    spaceTitle: 'One process, many threads',
    spaceSubtitle: 'Add threads and see what they share and what each one owns.',
    removeThread: 'Remove thread',
    addThread: 'Add thread',
    threadCount: (n) => `${n} threads`,
    addressSpace: 'Process address space',
    sharedBy: 'Shared by all threads',
    privateTo: 'Private to each thread',
    segments: [
      ['Code (text)', 'The program instructions'],
      ['Data (globals)', 'int counter; static variables'],
      ['Heap', 'malloc() / new: grows upward'],
      ['Open files', 'fd 0, 1, 2, sockets'],
    ],
    thread: (id) => `Thread ${id}`,
    stackRegs: 'stack + registers',
    sameCounter: (counter) => (
      <>
        Every thread sees the same {counter} in the data segment. That is convenient, and it is exactly what makes the experiment below go wrong.
      </>
    ),
    labTitle: 'Race condition lab',
    labSubtitle: "Each thread runs counter++ several times. Let the scheduler interleave randomly, or play scheduler yourself by clicking a thread's Run button.",
    mutex: 'Mutex',
    off: 'Off',
    on: 'On',
    threads: 'Threads',
    incrementsEach: 'Increments each',
    newSeed: 'New random interleaving',
    executed: (n) => `instructions executed: ${n}`,
    sharedCounter: 'shared counter',
    completed: (n, total) => `increments completed: ${n} / ${total}`,
    mutexName: 'mutex m',
    unlocked: 'unlocked',
    heldBy: (id) => `held by Thread ${id}`,
    lastBlocked: (thread) => <>{thread} tried to lock the mutex and blocked.</>,
    lastRan: (thread, op) => (
      <>
        {thread} ran {op}
      </>
    ),
    finished: 'finished',
    blocked: 'blocked on mutex',
    loop: (i, n) => `loop ${i} of ${n}`,
    runNext: 'Run next instruction',
    goodMutex: (v, total) => `Final value ${v} = ${total}. The mutex guaranteed no update was lost.`,
    goodLucky: (v, total) => `Final value ${v} = ${total}. Lucky interleaving! Try another one: without a lock the result is not guaranteed.`,
    bad: (v, total, lost) =>
      `Final value ${v}, but ${total} increments were executed: ${lost} update(s) were lost because two threads read the same old value before either wrote it back. Turn the mutex on and run again.`,
    warn: (done, v, lost) => `${done} increments have finished, but the counter only says ${v}. ${lost} update(s) have already been lost: a thread overwrote the counter with a stale value.`,
    tip: 'Tip: with the mutex off, click "Run next instruction" once on Thread 0 (LOAD), then once on Thread 1 (LOAD). Both now hold the same value in reg, and one increment is doomed.',
  },
  he: {
    intro: (
      <>
        <Term k="thread">Thread</Term> הוא רצף ביצוע נפרד בתוך process. Threads חולקים כמעט הכול, וזה הופך את התקשורת ביניהם למהירה וזולה, אבל זה גם אומר ששני threads
        יכולים לשנות את אותם נתונים באותו זמן. בלי סנכרון זה גורם ל-<Term k="race">race condition</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>משותף:</strong> קוד, נתונים גלובליים, heap, קבצים פתוחים. <strong>פרטי:</strong> stack, רגיסטרים, program counter.
      </>,
      <>
        <strong>counter++ אינה פעולה אטומית.</strong> אלה שלוש פקודות מכונה, וה-scheduler יכול להחליף thread בין כל שתיים מהן.
      </>,
      <>
        <Term k="mutex">Mutex</Term> הופך את רצף הקריאה-שינוי-כתיבה ל-<Term k="critical">critical section</Term> שרק thread אחד יכול להיות בתוכו בכל רגע.
      </>,
    ],
    spaceTitle: 'Process אחד, הרבה threads',
    spaceSubtitle: 'הוסיפו threads וראו מה הם חולקים ומה שייך לכל אחד מהם.',
    removeThread: 'הסרת thread',
    addThread: 'הוספת thread',
    threadCount: (n) => `${n} threads`,
    addressSpace: 'מרחב הכתובות של ה-process',
    sharedBy: 'משותף לכל ה-threads',
    privateTo: 'פרטי לכל thread',
    segments: [
      ['קוד (text)', 'הפקודות של התוכנית'],
      ['נתונים (globals)', 'int counter; משתנים סטטיים'],
      ['Heap', 'malloc() / new: גדל כלפי מעלה'],
      ['קבצים פתוחים', 'fd 0, 1, 2, sockets'],
    ],
    thread: (id) => `Thread ${id}`,
    stackRegs: 'stack + רגיסטרים',
    sameCounter: (counter) => (
      <>
        כל ה-threads רואים את אותו {counter} ב-data segment. זה נוח, וזה בדיוק מה שגורם לניסוי שלמטה להשתבש.
      </>
    ),
    labTitle: 'מעבדת race condition',
    labSubtitle: 'כל thread מריץ counter++ כמה פעמים. תנו ל-scheduler לשזור את הפקודות באקראי, או שחקו בעצמכם בתפקיד ה-scheduler בלחיצה על כפתור ההרצה של thread.',
    mutex: 'Mutex',
    off: 'כבוי',
    on: 'דלוק',
    threads: 'Threads',
    incrementsEach: 'הגדלות לכל thread',
    newSeed: 'שזירה אקראית חדשה',
    executed: (n) => `פקודות שבוצעו: ${n}`,
    sharedCounter: 'counter משותף',
    completed: (n, total) => `הגדלות שהושלמו: ${ltr(`${n} / ${total}`)}`,
    mutexName: 'mutex m',
    unlocked: 'פתוח',
    heldBy: (id) => `מוחזק על ידי Thread ${id}`,
    lastBlocked: (thread) => <>{thread} ניסה לנעול את ה-mutex ונחסם.</>,
    lastRan: (thread, op) => (
      <>
        {thread} הריץ {op}
      </>
    ),
    finished: 'סיים',
    blocked: 'חסום על ה-mutex',
    loop: (i, n) => `איטרציה ${i} מתוך ${n}`,
    runNext: 'הרצת הפקודה הבאה',
    goodMutex: (v, total) => `הערך הסופי ${ltr(`${v} = ${total}`)}. ה-mutex הבטיח שאף עדכון לא יאבד.`,
    goodLucky: (v, total) => `הערך הסופי ${ltr(`${v} = ${total}`)}. שזירה עם מזל! נסו שזירה אחרת: בלי lock התוצאה לא מובטחת.`,
    bad: (v, total, lost) =>
      `הערך הסופי ${v}, אבל בוצעו ${total} הגדלות: ${lost} עדכונים אבדו, כי שני threads קראו את אותו ערך ישן לפני שאחד מהם כתב אותו בחזרה. הדליקו את ה-mutex והריצו שוב.`,
    warn: (done, v, lost) => `${done} הגדלות כבר הסתיימו, אבל ה-counter מראה רק ${v}. ${lost} עדכונים כבר אבדו: thread דרס את ה-counter עם ערך ישן.`,
    tip: 'טיפ: כשה-mutex כבוי, לחצו פעם אחת על "הרצת הפקודה הבאה" ב-Thread 0 (LOAD), ואז פעם אחת ב-Thread 1 (LOAD). עכשיו לשניהם יש אותו ערך ב-reg, והגדלה אחת כבר נידונה ללכת לאיבוד.',
  },
  ar: {
    intro: (
      <>
        الـ <Term k="thread">thread</Term> هو مسار تنفيذ مستقل داخل process. تتشارك الـ threads كل شيء تقريبًا، مما يجعل التواصل بينها سريعًا ورخيصًا، لكنه يعني أيضًا أن
        thread اثنين قد يعدّلان البيانات نفسها في الوقت نفسه. ودون تزامن يسبب ذلك <Term k="race">race condition</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>مشترك:</strong> الشيفرة والبيانات العامة والـ heap والملفات المفتوحة. <strong>خاص:</strong> الـ stack والسجلات والـ program counter.
      </>,
      <>
        <strong>counter++ ليست عملية ذرّية.</strong> إنها ثلاث تعليمات آلة، ويمكن للـ scheduler أن يبدّل الـ thread بين أي اثنتين منها.
      </>,
      <>
        يحوّل الـ <Term k="mutex">mutex</Term> سلسلة القراءة-التعديل-الكتابة إلى <Term k="critical">critical section</Term> لا يمكن أن يكون داخلها إلا thread واحد في كل
        لحظة.
      </>,
    ],
    spaceTitle: 'Process واحد وعدة threads',
    spaceSubtitle: 'أضف threads وشاهد ما تتشاركه وما يملكه كل منها.',
    removeThread: 'إزالة thread',
    addThread: 'إضافة thread',
    threadCount: (n) => `${n} threads`,
    addressSpace: 'فضاء عناوين الـ process',
    sharedBy: 'مشترك بين جميع الـ threads',
    privateTo: 'خاص بكل thread',
    segments: [
      ['الشيفرة (text)', 'تعليمات البرنامج'],
      ['البيانات (globals)', 'int counter; المتغيرات الساكنة'],
      ['Heap', 'malloc() / new: ينمو إلى الأعلى'],
      ['الملفات المفتوحة', 'fd 0, 1, 2, sockets'],
    ],
    thread: (id) => `Thread ${id}`,
    stackRegs: 'stack + سجلات',
    sameCounter: (counter) => (
      <>
        كل الـ threads ترى {counter} نفسه في الـ data segment. هذا مريح، وهو بالضبط ما يجعل التجربة أدناه تفشل.
      </>
    ),
    labTitle: 'مختبر الـ race condition',
    labSubtitle: 'كل thread يشغّل counter++ عدة مرات. دع الـ scheduler يداخل التعليمات عشوائيًا، أو العب دور الـ scheduler بنفسك بالنقر على زر التشغيل الخاص بأي thread.',
    mutex: 'Mutex',
    off: 'مطفأ',
    on: 'مفعّل',
    threads: 'Threads',
    incrementsEach: 'الزيادات لكل thread',
    newSeed: 'تداخل عشوائي جديد',
    executed: (n) => `التعليمات المنفّذة: ${n}`,
    sharedCounter: 'الـ counter المشترك',
    completed: (n, total) => `الزيادات المكتملة: ${ltr(`${n} / ${total}`)}`,
    mutexName: 'mutex m',
    unlocked: 'غير مقفل',
    heldBy: (id) => `يمسكه Thread ${id}`,
    lastBlocked: (thread) => <>حاول {thread} قفل الـ mutex فحُجب.</>,
    lastRan: (thread, op) => (
      <>
        نفّذ {thread} {op}
      </>
    ),
    finished: 'انتهى',
    blocked: 'محجوب على الـ mutex',
    loop: (i, n) => `الدورة ${i} من ${n}`,
    runNext: 'تنفيذ التعليمة التالية',
    goodMutex: (v, total) => `القيمة النهائية ${ltr(`${v} = ${total}`)}. ضمن الـ mutex عدم ضياع أي تحديث.`,
    goodLucky: (v, total) => `القيمة النهائية ${ltr(`${v} = ${total}`)}. تداخل محظوظ! جرّب تداخلًا آخر: دون lock النتيجة غير مضمونة.`,
    bad: (v, total, lost) =>
      `القيمة النهائية ${v}، لكن نُفّذت ${total} زيادات: ضاع ${lost} من التحديثات لأن thread اثنين قرآ القيمة القديمة نفسها قبل أن يكتبها أيٌّ منهما. فعّل الـ mutex وشغّل مجددًا.`,
    warn: (done, v, lost) => `اكتملت ${done} زيادات، لكن الـ counter يُظهر ${v} فقط. ضاع بالفعل ${lost} من التحديثات: كتب thread فوق الـ counter قيمة قديمة.`,
    tip: 'نصيحة: والـ mutex مطفأ، انقر مرة واحدة على "تنفيذ التعليمة التالية" في Thread 0 ‏(LOAD)، ثم مرة واحدة في Thread 1 ‏(LOAD). أصبح لدى كليهما القيمة نفسها في reg، وزيادة واحدة محكوم عليها بالضياع.',
  },
  es: {
    intro: (
      <>
        Un <Term k="thread">thread</Term> es un flujo de ejecución independiente dentro de un process. Los threads lo comparten casi todo, lo que hace que la comunicación sea
        rápida y barata, pero también significa que dos threads pueden modificar los mismos datos al mismo tiempo. Sin sincronización, esto provoca una{' '}
        <Term k="race">race condition</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Compartido:</strong> código, datos globales, heap, archivos abiertos. <strong>Privado:</strong> stack, registros, program counter.
      </>,
      <>
        <strong>counter++ no es atómico.</strong> Son tres instrucciones de máquina, y el scheduler puede cambiar de thread entre dos cualesquiera de ellas.
      </>,
      <>
        Un <Term k="mutex">mutex</Term> convierte la lectura-modificación-escritura en una <Term k="critical">critical section</Term> en la que solo puede estar un thread a la
        vez.
      </>,
    ],
    spaceTitle: 'Un process, muchos threads',
    spaceSubtitle: 'Añade threads y mira qué comparten y qué tiene cada uno.',
    removeThread: 'Quitar thread',
    addThread: 'Añadir thread',
    threadCount: (n) => `${n} threads`,
    addressSpace: 'Espacio de direcciones del process',
    sharedBy: 'Compartido por todos los threads',
    privateTo: 'Privado de cada thread',
    segments: [
      ['Código (text)', 'Las instrucciones del programa'],
      ['Datos (globals)', 'int counter; variables static'],
      ['Heap', 'malloc() / new: crece hacia arriba'],
      ['Archivos abiertos', 'fd 0, 1, 2, sockets'],
    ],
    thread: (id) => `Thread ${id}`,
    stackRegs: 'stack + registros',
    sameCounter: (counter) => (
      <>
        Todos los threads ven el mismo {counter} en el data segment. Es cómodo, y es justo lo que hace que el experimento de abajo salga mal.
      </>
    ),
    labTitle: 'Laboratorio de race conditions',
    labSubtitle: 'Cada thread ejecuta counter++ varias veces. Deja que el scheduler intercale al azar, o haz tú de scheduler pulsando el botón de ejecutar de un thread.',
    mutex: 'Mutex',
    off: 'Desactivado',
    on: 'Activado',
    threads: 'Threads',
    incrementsEach: 'Incrementos por thread',
    newSeed: 'Nuevo intercalado aleatorio',
    executed: (n) => `instrucciones ejecutadas: ${n}`,
    sharedCounter: 'counter compartido',
    completed: (n, total) => `incrementos completados: ${n} / ${total}`,
    mutexName: 'mutex m',
    unlocked: 'libre',
    heldBy: (id) => `en manos del Thread ${id}`,
    lastBlocked: (thread) => <>{thread} intentó bloquear el mutex y quedó bloqueado.</>,
    lastRan: (thread, op) => (
      <>
        {thread} ejecutó {op}
      </>
    ),
    finished: 'terminado',
    blocked: 'bloqueado en el mutex',
    loop: (i, n) => `vuelta ${i} de ${n}`,
    runNext: 'Ejecutar siguiente instrucción',
    goodMutex: (v, total) => `Valor final ${v} = ${total}. El mutex garantizó que no se perdiera ninguna actualización.`,
    goodLucky: (v, total) => `Valor final ${v} = ${total}. ¡Intercalado con suerte! Prueba otro: sin lock el resultado no está garantizado.`,
    bad: (v, total, lost) =>
      `Valor final ${v}, pero se ejecutaron ${total} incrementos: se perdieron ${lost} actualizaciones porque dos threads leyeron el mismo valor antiguo antes de que cualquiera lo escribiera de vuelta. Activa el mutex y vuelve a ejecutar.`,
    warn: (done, v, lost) => `Han terminado ${done} incrementos, pero el counter solo marca ${v}. Ya se han perdido ${lost} actualizaciones: un thread sobrescribió el counter con un valor obsoleto.`,
    tip: 'Consejo: con el mutex desactivado, pulsa una vez "Ejecutar siguiente instrucción" en el Thread 0 (LOAD) y luego una vez en el Thread 1 (LOAD). Ahora los dos tienen el mismo valor en reg, y un incremento está condenado.',
  },
}
