import { ltr, type Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

export const processesQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'proc-io-state': {
      prompt: 'Process שרץ מבצע קריאה מהדיסק. לאיזה מצב הוא עובר?',
      explanation: 'הוא לא יכול להמשיך עד שהנתונים יגיעו, ולכן הוא נחסם במצב Waiting וה-CPU עובר ל-process אחר שנמצא ב-Ready. כשמגיע ה-interrupt של ה-I/O הוא חוזר ל-Ready (ולא ישר ל-Running).',
    },
    'proc-fork-return': {
      prompt: 'מה fork() מחזירה?',
      options: ['את ה-PID של ה-child בשני ה-processes', '0 ב-parent, ואת ה-PID של ה-child ב-child', 'את ה-PID של ה-child ב-parent, ו-0 ב-child', 'תמיד 0 כשהיא מצליחה'],
      explanation: 'קריאה אחת, שתי חזרות: ה-parent מקבל את ה-PID של ה-child החדש כדי שיוכל לקרוא ל-wait() עבורו, וה-child מקבל 0 וכך יודע שהוא ה-child. ערך שלילי פירושו ש-fork נכשלה.',
    },
    'proc-fork-count': {
      prompt: 'כמה processes קיימים (כולל המקורי) אחרי שהקוד הזה רץ?',
      explanation: `כל fork() מכפילה את מספר ה-processes שמריצים את הקוד שאחריה: ${ltr('1 -> 2 -> 4 -> 8')}.`,
    },
    'proc-zombie': {
      prompt: 'Child process מסיים, אבל ה-parent שלו אף פעם לא קורא ל-wait(). מה ה-child עכשיו?',
      options: ['Orphan', 'Zombie', 'Daemon', 'Ready'],
      explanation: 'ה-process מת, אבל רשומת ה-PCB שלו (עם קוד היציאה) נשארת כדי שה-parent יוכל לאסוף אותה. הרשומה שנשארה היא zombie. Orphan הוא המצב ההפוך: child חי שה-parent שלו מת.',
    },
    'proc-exec': {
      prompt: 'אחרי exec("ls") שהצליחה, מה מהבאים נשאר אותו דבר?',
      options: ['קוד התוכנית', 'תוכן ה-stack', 'ה-PID', 'ה-heap'],
      explanation: 'exec מחליפה את תמונת הזיכרון (קוד, נתונים, heap ו-stack) בתוכנית החדשה, אבל ה-process נשאר אותו process: אותו PID, אותו parent ו(כברירת מחדל) אותם file descriptors פתוחים. כך shell מריץ פקודות: fork, ואז exec ב-child.',
    },
    'proc-lifecycle': {
      prompt: 'סדרו את המצבים ש-process טיפוסי עובר כשהוא קורא קובץ פעם אחת ואז מסיים.',
      items: ['New', 'Ready', 'Running', 'Waiting', 'Ready (שוב)', 'Running (שוב)', 'Terminated'],
      explanation: 'נוצר (New), מתקבל (Ready), מקבל את ה-CPU (Running), נחסם על I/O (Waiting), ה-I/O מסתיים (שוב Ready), מקבל שוב את ה-CPU (Running) ומסיים (Terminated).',
    },
  },
  ar: {
    'proc-io-state': {
      prompt: 'Process قيد التشغيل يطلب قراءة من القرص. إلى أي حالة ينتقل؟',
      explanation: 'لا يمكنه المتابعة حتى تصل البيانات، لذا يُحجَب في حالة Waiting وتُعطى الـ CPU لـ process آخر في حالة Ready. عندما يصل الـ interrupt الخاص بالـ I/O يعود إلى Ready (وليس مباشرة إلى Running).',
    },
    'proc-fork-return': {
      prompt: 'ماذا تعيد fork()؟',
      options: ['PID الخاص بالـ child في كلا الـ processes', '0 في الـ parent، و PID الخاص بالـ child في الـ child', 'PID الخاص بالـ child في الـ parent، و 0 في الـ child', 'دائمًا 0 عند النجاح'],
      explanation: 'استدعاء واحد وعودتان: يحصل الـ parent على PID الخاص بالـ child الجديد ليتمكن من استدعاء wait() له، ويحصل الـ child على 0 فيعرف أنه الـ child. القيمة السالبة تعني أن fork فشلت.',
    },
    'proc-fork-count': {
      prompt: 'كم process يوجد (بما فيها الأصلي) بعد تشغيل هذه الشيفرة؟',
      explanation: `كل fork() تضاعف عدد الـ processes التي تنفذ الشيفرة التي تليها: ${ltr('1 -> 2 -> 4 -> 8')}.`,
    },
    'proc-zombie': {
      prompt: 'ينتهي child process لكن الـ parent لا يستدعي wait() أبدًا. ما هو الـ child الآن؟',
      options: ['Orphan', 'Zombie', 'Daemon', 'Ready'],
      explanation: 'الـ process ميت، لكن سجل الـ PCB الخاص به (مع حالة الخروج) يبقى ليتمكن الـ parent من جمعه. هذا السجل المتبقي هو zombie. الـ orphan هو العكس: child حي مات الـ parent الخاص به.',
    },
    'proc-exec': {
      prompt: 'بعد نجاح exec("ls")، أيٌّ مما يلي يبقى كما هو؟',
      options: ['شيفرة البرنامج', 'محتوى الـ stack', 'الـ PID', 'الـ heap'],
      explanation: 'تستبدل exec صورة الذاكرة (الشيفرة والبيانات والـ heap والـ stack) بالبرنامج الجديد، لكنها تُبقي الـ process نفسه: الـ PID نفسه والـ parent نفسه و(افتراضيًا) الـ file descriptors المفتوحة نفسها. هكذا يشغّل الـ shell الأوامر: fork ثم exec في الـ child.',
    },
    'proc-lifecycle': {
      prompt: 'رتّب الحالات التي يمر بها process نموذجي عندما يقرأ ملفًا مرة واحدة ثم ينتهي.',
      items: ['New', 'Ready', 'Running', 'Waiting', 'Ready (مجددًا)', 'Running (مجددًا)', 'Terminated'],
      explanation: 'يُنشأ (New)، ثم يُقبَل (Ready)، ثم يحصل على الـ CPU (Running)، ثم يُحجَب على I/O (Waiting)، ثم ينتهي الـ I/O (Ready مجددًا)، ثم يحصل على الـ CPU مجددًا (Running)، ثم ينتهي (Terminated).',
    },
  },
  es: {
    'proc-io-state': {
      prompt: 'Un process en ejecución pide una lectura de disco. ¿A qué estado pasa?',
      explanation: 'No puede seguir hasta que lleguen los datos, así que se bloquea en el estado Waiting y la CPU pasa a otro process en Ready. Cuando llega el interrupt de I/O vuelve a Ready (no directamente a Running).',
    },
    'proc-fork-return': {
      prompt: '¿Qué devuelve fork()?',
      options: ['El PID del child en ambos processes', '0 en el parent y el PID del child en el child', 'El PID del child en el parent y 0 en el child', 'Siempre 0 si tiene éxito'],
      explanation: 'Una llamada, dos retornos: el parent recibe el PID del nuevo child para poder hacer wait() por él, y el child recibe 0 y así sabe que es el child. Un valor negativo significa que fork falló.',
    },
    'proc-fork-count': {
      prompt: '¿Cuántos processes existen (incluido el original) después de ejecutar este código?',
      explanation: 'Cada fork() duplica el número de processes que ejecutan el código que sigue: 1 -> 2 -> 4 -> 8.',
    },
    'proc-zombie': {
      prompt: 'Un child process termina, pero su parent nunca llama a wait(). ¿Qué es ahora el child?',
      options: ['Un orphan', 'Un zombie', 'Un daemon', 'Ready'],
      explanation: 'El process está muerto, pero su entrada en el PCB (con el estado de salida) se mantiene para que el parent la recoja. Esa entrada que queda es un zombie. Un orphan es lo contrario: un child vivo cuyo parent murió.',
    },
    'proc-exec': {
      prompt: 'Después de un exec("ls") exitoso, ¿qué se mantiene igual?',
      options: ['El código del programa', 'El contenido del stack', 'El PID', 'El heap'],
      explanation: 'exec reemplaza la imagen de memoria (código, datos, heap y stack) por el programa nuevo, pero mantiene el mismo process: mismo PID, mismo parent y (por defecto) los mismos file descriptors abiertos. Así ejecuta comandos un shell: fork y luego exec en el child.',
    },
    'proc-lifecycle': {
      prompt: 'Ordena los estados por los que pasa un process típico cuando lee un archivo una vez y luego termina.',
      items: ['New', 'Ready', 'Running', 'Waiting', 'Ready (otra vez)', 'Running (otra vez)', 'Terminated'],
      explanation: 'Se crea (New), se admite (Ready), se despacha (Running), se bloquea en I/O (Waiting), termina el I/O (Ready otra vez), se despacha de nuevo (Running otra vez) y termina (Terminated).',
    },
  },
}

export const processesChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-proc-zombie': ['ליצור zombie process', 'הריצו את bash על ה-CPU, קראו ל-fork(), הפקיעו את bash עם Timer interrupt, הריצו את ה-child וקראו ל-exit(). ה-parent לא קרא ל-wait().'],
    'ch-proc-reap': ['לאסוף zombie עם wait()', 'אחרי שיצרתם zombie, הריצו את ה-parent שלו וקראו ל-wait().'],
    'ch-proc-orphan': ['ליצור orphan', 'צרו child עם fork(), ואז גרמו ל-parent לקרוא ל-exit() כשה-child עדיין חי.'],
    'ch-proc-tree': ['לבנות משפחה של שלושה דורות', 'צרו child עם fork(), הריצו אותו, ותנו גם לו לקרוא ל-fork().'],
    'ch-proc-shell': ['לעשות מה ש-shell עושה: fork, ואז exec ב-child', 'קראו ל-fork() מ-bash, הריצו את ה-child ואז קראו ל-exec() כדי שיהפוך לתוכנית אחרת.'],
  },
  ar: {
    'ch-proc-zombie': ['إنشاء zombie process', 'شغّل bash على الـ CPU، واستدعِ fork()، وانتزع الـ CPU من bash بـ Timer interrupt، ثم شغّل الـ child واستدعِ exit(). لم يستدعِ الـ parent ‏wait().'],
    'ch-proc-reap': ['جمع zombie باستخدام wait()', 'بعد إنشاء zombie، شغّل الـ parent الخاص به واستدعِ wait().'],
    'ch-proc-orphan': ['إنشاء orphan', 'أنشئ child بـ fork()، ثم اجعل الـ parent يستدعي exit() بينما الـ child لا يزال حيًا.'],
    'ch-proc-tree': ['بناء عائلة من ثلاثة أجيال', 'أنشئ child بـ fork()، وشغّله، واجعله هو أيضًا يستدعي fork().'],
    'ch-proc-shell': ['افعل ما يفعله الـ shell: fork ثم exec في الـ child', 'استدعِ fork() من bash، وشغّل الـ child، ثم استدعِ exec() ليصبح برنامجًا آخر.'],
  },
  es: {
    'ch-proc-zombie': ['Crear un zombie process', 'Ejecuta bash en la CPU, llama a fork(), expulsa a bash con un Timer interrupt, ejecuta el child y llama a exit(). El parent nunca hizo wait().'],
    'ch-proc-reap': ['Recoger un zombie con wait()', 'Después de crear un zombie, ejecuta su parent y llama a wait().'],
    'ch-proc-orphan': ['Crear un orphan', 'Crea un child con fork() y haz que el parent llame a exit() mientras el child sigue vivo.'],
    'ch-proc-tree': ['Construir una familia de tres generaciones', 'Crea un child con fork(), ejecútalo y haz que el child también llame a fork().'],
    'ch-proc-shell': ['Hacer lo que hace un shell: fork y luego exec en el child', 'Haz fork() desde bash, ejecuta el child y llama a exec() para que se convierta en otro programa.'],
  },
}

interface GenText {
  forkPrompt: string
  forkUnit: string
  forkExplain: (counts: number[]) => string
  printPrompt: string
  printUnit: string
  printExplain: (counts: number[], total: number) => string
  statePrompt: (from: string, event: string) => string
  /** Same order as the transitions in the generator: [event, why]. */
  transitions: [string, string][]
}

const chain = (counts: number[]) => [1, ...counts].join(' -> ')

export const processesGenText: Localized<GenText> = {
  en: {
    forkPrompt: 'How many processes exist in total (including the original) when this finishes?',
    forkUnit: 'processes',
    forkExplain: (c) => `Every fork() doubles the number of processes running the rest of the loop: ${chain(c)}.`,
    printPrompt: 'How many times is "hi" printed?',
    printUnit: 'times',
    printExplain: (c, total) => `After the 1st fork 2 processes print, after the 2nd 4 print, and so on: ${c.join(' + ')} = ${total}.`,
    statePrompt: (from, event) => `A process is ${from} and ${event}. Which state does it move to?`,
    transitions: [
      ['a timer interrupt fires', 'It is preempted but still able to run, so it goes back to the ready queue.'],
      ['it calls read() on a file that is not cached', 'It must wait for the disk, so it blocks.'],
      ['the disk interrupt says its data has arrived', 'It can run again, but must wait for the scheduler. It never jumps straight to Running.'],
      ['the scheduler picks it', 'Dispatching loads its registers onto the CPU.'],
      ['it calls exit()', 'It is finished; its PCB stays until the parent calls wait().'],
      ['the OS admits it', 'Its PCB and memory are set up and it joins the ready queue.'],
      ['it calls wait() and its child is still running', 'It blocks until a child exits.'],
    ],
  },
  he: {
    forkPrompt: 'כמה processes קיימים בסך הכול (כולל המקורי) כשזה מסתיים?',
    forkUnit: 'processes',
    forkExplain: (c) => `כל fork() מכפילה את מספר ה-processes שמריצים את המשך הלולאה: ${ltr(chain(c))}.`,
    printPrompt: 'כמה פעמים מודפס "hi"?',
    printUnit: 'פעמים',
    printExplain: (c, total) => `אחרי ה-fork הראשון מדפיסים 2 processes, אחרי השני 4, וכן הלאה: ${ltr(`${c.join(' + ')} = ${total}`)}.`,
    statePrompt: (from, event) => `Process נמצא במצב ${from} ו${event}. לאיזה מצב הוא עובר?`,
    transitions: [
      ['מגיע timer interrupt', 'מפקיעים ממנו את ה-CPU אבל הוא עדיין יכול לרוץ, ולכן הוא חוזר לתור ה-ready.'],
      ['הוא קורא ל-read() על קובץ שלא נמצא ב-cache', 'הוא חייב לחכות לדיסק, ולכן הוא נחסם.'],
      ['ה-interrupt של הדיסק מודיע שהנתונים שלו הגיעו', 'הוא יכול לרוץ שוב, אבל חייב לחכות ל-scheduler. הוא אף פעם לא קופץ ישר ל-Running.'],
      ['ה-scheduler בוחר בו', 'ה-dispatch טוען את הרגיסטרים שלו ל-CPU.'],
      ['הוא קורא ל-exit()', 'הוא סיים; ה-PCB שלו נשאר עד שה-parent קורא ל-wait().'],
      ['מערכת ההפעלה מקבלת אותו (admit)', 'ה-PCB והזיכרון שלו מוכנים והוא מצטרף לתור ה-ready.'],
      ['הוא קורא ל-wait() וה-child שלו עדיין רץ', 'הוא נחסם עד שאחד ה-children מסיים.'],
    ],
  },
  ar: {
    forkPrompt: 'كم process يوجد إجمالًا (بما فيها الأصلي) عند الانتهاء؟',
    forkUnit: 'processes',
    forkExplain: (c) => `كل fork() تضاعف عدد الـ processes التي تنفذ بقية الحلقة: ${ltr(chain(c))}.`,
    printPrompt: 'كم مرة تُطبع "hi"؟',
    printUnit: 'مرات',
    printExplain: (c, total) => `بعد أول fork تطبع 2 processes، وبعد الثاني 4، وهكذا: ${ltr(`${c.join(' + ')} = ${total}`)}.`,
    statePrompt: (from, event) => `Process في حالة ${from} و${event}. إلى أي حالة ينتقل؟`,
    transitions: [
      ['يصل timer interrupt', 'تُنتزَع منه الـ CPU لكنه لا يزال قادرًا على العمل، فيعود إلى طابور الـ ready.'],
      ['يستدعي read() على ملف غير موجود في الـ cache', 'عليه أن ينتظر القرص، لذا يُحجَب.'],
      ['يُعلن interrupt القرص أن بياناته وصلت', 'يمكنه العمل مجددًا، لكن عليه انتظار الـ scheduler. لا يقفز أبدًا مباشرة إلى Running.'],
      ['يختاره الـ scheduler', 'يحمّل الـ dispatch سجلاته إلى الـ CPU.'],
      ['يستدعي exit()', 'انتهى، ويبقى الـ PCB الخاص به حتى يستدعي الـ parent الدالة wait().'],
      ['يقبله نظام التشغيل (admit)', 'أصبح الـ PCB والذاكرة الخاصة به جاهزين وانضم إلى طابور الـ ready.'],
      ['يستدعي wait() والـ child الخاص به لا يزال يعمل', 'يُحجَب حتى ينتهي أحد الـ children.'],
    ],
  },
  es: {
    forkPrompt: '¿Cuántos processes existen en total (incluido el original) al terminar?',
    forkUnit: 'processes',
    forkExplain: (c) => `Cada fork() duplica el número de processes que ejecutan el resto del bucle: ${chain(c)}.`,
    printPrompt: '¿Cuántas veces se imprime "hi"?',
    printUnit: 'veces',
    printExplain: (c, total) => `Tras el primer fork imprimen 2 processes, tras el segundo imprimen 4, y así sucesivamente: ${c.join(' + ')} = ${total}.`,
    statePrompt: (from, event) => `Un process está en ${from} y ${event}. ¿A qué estado pasa?`,
    transitions: [
      ['llega un timer interrupt', 'Se le quita la CPU pero aún puede ejecutarse, así que vuelve a la cola ready.'],
      ['llama a read() sobre un archivo que no está en caché', 'Debe esperar al disco, así que se bloquea.'],
      ['el interrupt del disco indica que sus datos llegaron', 'Puede ejecutarse de nuevo, pero debe esperar al scheduler. Nunca salta directamente a Running.'],
      ['el scheduler lo elige', 'El dispatch carga sus registros en la CPU.'],
      ['llama a exit()', 'Ha terminado; su PCB se mantiene hasta que el parent llame a wait().'],
      ['el sistema operativo lo admite', 'Su PCB y su memoria están listos y entra en la cola ready.'],
      ['llama a wait() y su child sigue ejecutándose', 'Se bloquea hasta que termine un child.'],
    ],
  },
}
