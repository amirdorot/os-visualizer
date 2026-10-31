import type { Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

export const syscallsQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'sys-why-trap': {
      prompt: 'למה תוכנית משתמש לא יכולה פשוט לקרוא לפונקציה של ה-kernel ישירות, כמו לפונקציה רגילה?',
      options: [
        'הפונקציות של ה-kernel כתובות בשפה אחרת',
        'הזיכרון של ה-kernel מוגן, ופעולות מיוחסות דורשות שה-CPU יהיה ב-kernel mode, שרק trap יכול להיכנס אליו בבטחה',
        'זה היה איטי מדי',
        'אין ל-kernel פונקציות',
      ],
      explanation: 'ה-CPU אוכף רמות הרשאה. פקודת trap כמו syscall היא הדלת המבוקרת היחידה: היא מחליפה מצב וקופצת לנקודת כניסה קבועה ב-kernel שמערכת ההפעלה בחרה, כך שקוד משתמש לא יכול להריץ קוד kernel שרירותי.',
    },
    'sys-order': {
      prompt: 'סדרו את השלבים של system call.',
      items: [
        'התוכנית קוראת ל-wrapper של libc, למשל read()',
        'ה-wrapper שם את מספר ה-syscall ואת הארגומנטים ברגיסטרים',
        'פקודת syscall עושה trap ל-kernel mode',
        'ה-kernel מוצא את ה-handler בטבלת ה-system calls ומריץ אותו',
        'התוצאה נשמרת ברגיסטר וה-CPU חוזר ל-user mode',
      ],
      explanation: 'Wrapper, רגיסטרים, trap, dispatch, חזרה. ה-kernel אף פעם לא סומך על הארגומנטים: הוא בודק את ה-file descriptor ואת המצביעים ל-buffer לפני שהוא משתמש בהם.',
    },
    'sys-privileged': {
      prompt: 'תוכנית ב-user mode מריצה פקודה מיוחסת (למשל, כיבוי interrupts). מה קורה?',
      options: ['ה-interrupts נכבים', 'מתעלמים מהפקודה בשקט', 'ה-CPU מעלה exception, ובדרך כלל ה-kernel הורג את ה-process', 'המחשב מופעל מחדש'],
      explanation: 'החומרה מסרבת ומעלה protection fault. ה-kernel מטפל בו, בדרך כלל על ידי שליחת signal (למשל SIGSEGV או SIGILL) שמסיים את התוכנית.',
    },
    'sys-blocking': {
      prompt: 'במהלך read() מהדיסק כשהנתונים לא נמצאים ב-cache, מה עושה ה-process שקרא לה בזמן שהדיסק עובד?',
      options: ['מבצע busy-wait ב-user mode', 'ישן במצב Waiting בזמן ש-processes אחרים רצים', 'מחזיק את ה-CPU ב-kernel mode ומסתובב בלולאה', 'מסתיים ומתחיל מחדש'],
      explanation: 'דיסקים איטיים פי מיליונים מה-CPU. ה-kernel חוסם את ה-process ומתזמן processes אחרים, ומאוחר יותר ה-interrupt של הדיסק מעיר אותו.',
    },
    'sys-mode-switches': {
      prompt: 'כמה מעברים בין user mode ל-kernel mode יש ב-system call פשוט אחד של getpid()?',
      unit: 'מעברים',
      explanation: 'מעבר אחד אל ה-kernel (ה-trap) ומעבר אחד החוצה (החזרה ל-user mode). הסיבוב הזה הוא הסיבה ש-system calls יקרים יותר מקריאות רגילות לפונקציות.',
    },
  },
  ar: {
    'sys-why-trap': {
      prompt: 'لماذا لا يستطيع برنامج المستخدم ببساطة استدعاء دالة في الـ kernel مباشرةً كما يستدعي دالة عادية؟',
      options: [
        'دوال الـ kernel مكتوبة بلغة مختلفة',
        'ذاكرة الـ kernel محمية، والعمليات المميَّزة تتطلب أن تكون الـ CPU في kernel mode، ولا يمكن الدخول إليه بأمان إلا عبر trap',
        'سيكون ذلك بطيئًا جدًا',
        'لا يحتوي الـ kernel على دوال',
      ],
      explanation: 'تفرض الـ CPU مستويات الصلاحيات. تعليمة trap مثل syscall هي الباب المضبوط الوحيد: تبدّل النمط وتقفز إلى نقطة دخول ثابتة في الـ kernel يحددها نظام التشغيل، فلا تستطيع شيفرة المستخدم تشغيل شيفرة kernel عشوائية.',
    },
    'sys-order': {
      prompt: 'رتّب خطوات الـ system call.',
      items: [
        'يستدعي البرنامج الـ wrapper في libc، مثل read()',
        'يضع الـ wrapper رقم الـ syscall والوسائط في السجلات',
        'تنتقل تعليمة syscall عبر trap إلى kernel mode',
        'يبحث الـ kernel عن الـ handler في جدول الـ system calls ويشغّله',
        'توضع النتيجة في سجل وتعود الـ CPU إلى user mode',
      ],
      explanation: 'الـ wrapper، ثم السجلات، ثم الـ trap، ثم الـ dispatch، ثم العودة. لا يثق الـ kernel أبدًا بالوسائط: يتحقق من الـ file descriptor ومن مؤشرات الـ buffer قبل استخدامها.',
    },
    'sys-privileged': {
      prompt: 'ينفّذ برنامج في user mode تعليمة مميَّزة (مثل تعطيل الـ interrupts). ماذا يحدث؟',
      options: ['تُعطَّل الـ interrupts', 'تُتجاهَل التعليمة بصمت', 'ترفع الـ CPU استثناءً (exception)، وعادةً ما ينهي الـ kernel الـ process', 'يُعاد تشغيل الحاسوب'],
      explanation: 'يرفض العتاد التنفيذ ويرفع protection fault. يعالجه الـ kernel، عادةً بإرسال signal (مثل SIGSEGV أو SIGILL) ينهي البرنامج.',
    },
    'sys-blocking': {
      prompt: 'أثناء read() من القرص عندما لا تكون البيانات في الـ cache، ماذا يفعل الـ process المستدعي بينما يعمل القرص؟',
      options: ['ينتظر انتظارًا نشطًا (busy-wait) في user mode', 'ينام في حالة Waiting بينما تعمل processes أخرى', 'يُبقي الـ CPU تدور في kernel mode', 'ينتهي ثم يبدأ من جديد'],
      explanation: 'الأقراص أبطأ من الـ CPU بملايين المرات. يحجب الـ kernel الـ process ويجدول غيره، ثم يوقظه interrupt القرص لاحقًا.',
    },
    'sys-mode-switches': {
      prompt: 'كم انتقالًا بين user mode و kernel mode يتضمنه system call بسيط واحد مثل getpid()؟',
      unit: 'انتقالات',
      explanation: 'انتقال إلى الـ kernel (الـ trap) وآخر للخروج منه (العودة إلى user mode). هذه الرحلة ذهابًا وإيابًا هي سبب كون الـ system calls أغلى من استدعاءات الدوال العادية.',
    },
  },
  es: {
    'sys-why-trap': {
      prompt: '¿Por qué un programa de usuario no puede simplemente llamar a una función del kernel directamente, como a una función normal?',
      options: [
        'Las funciones del kernel están escritas en otro lenguaje',
        'La memoria del kernel está protegida y las operaciones privilegiadas requieren que la CPU esté en kernel mode, al que solo se puede entrar de forma segura con un trap',
        'Sería demasiado lento',
        'El kernel no tiene funciones',
      ],
      explanation: 'La CPU impone niveles de privilegio. Una instrucción trap como syscall es la única puerta controlada: cambia de modo y salta a un punto de entrada fijo del kernel elegido por el sistema operativo, así que el código de usuario no puede ejecutar código arbitrario del kernel.',
    },
    'sys-order': {
      prompt: 'Ordena los pasos de una system call.',
      items: [
        'El programa llama al wrapper de libc, p. ej. read()',
        'El wrapper pone el número de syscall y los argumentos en registros',
        'La instrucción syscall hace un trap a kernel mode',
        'El kernel busca el handler en la tabla de system calls y lo ejecuta',
        'El resultado se coloca en un registro y la CPU vuelve a user mode',
      ],
      explanation: 'Wrapper, registros, trap, dispatch, retorno. El kernel nunca confía en los argumentos: valida el file descriptor y los punteros al buffer antes de usarlos.',
    },
    'sys-privileged': {
      prompt: 'Un programa en user mode ejecuta una instrucción privilegiada (por ejemplo, desactivar los interrupts). ¿Qué pasa?',
      options: ['Se desactivan los interrupts', 'La instrucción se ignora en silencio', 'La CPU lanza una exception; normalmente el kernel mata el process', 'El ordenador se reinicia'],
      explanation: 'El hardware se niega y lanza un protection fault. El kernel lo maneja, normalmente enviando una signal (p. ej. SIGSEGV o SIGILL) que termina el programa.',
    },
    'sys-blocking': {
      prompt: 'Durante un read() de disco cuyos datos no están en la caché, ¿qué hace el process que llamó mientras el disco trabaja?',
      options: ['Hace busy-wait en user mode', 'Duerme en el estado Waiting mientras se ejecutan otros processes', 'Mantiene la CPU dando vueltas en kernel mode', 'Termina y vuelve a empezar'],
      explanation: 'Los discos son millones de veces más lentos que la CPU. El kernel bloquea el process y planifica otros; más tarde, el interrupt del disco lo despierta.',
    },
    'sys-mode-switches': {
      prompt: '¿Cuántos cambios entre user mode y kernel mode implica una simple system call getpid()?',
      unit: 'cambios',
      explanation: 'Uno para entrar al kernel (el trap) y otro para salir (el regreso a user mode). Este viaje de ida y vuelta es la razón por la que las system calls cuestan más que las llamadas a funciones normales.',
    },
  },
}

export const syscallsChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-sys-read': ['לעקוב אחרי read() עד החזרה ל-user mode', 'בחרו read() והתקדמו עד השלב האחרון.'],
    'ch-sys-block': ['לתפוס את ה-process כשהוא חסום ב-kernel', 'התקדמו ב-read() עד שמצב ה-process מראה WAITING.'],
    'ch-sys-break': ['לנסות לשבור את החוקים עם פקודה מיוחסת', 'השתמשו בכפתורים שב-"נסו לשבור את החוקים".'],
  },
  ar: {
    'ch-sys-read': ['تتبّع read() حتى العودة إلى user mode', 'اختر read() وتقدّم حتى الخطوة الأخيرة.'],
    'ch-sys-block': ['التقط الـ process وهو محجوب في الـ kernel', 'تقدّم في read() حتى تُظهر حالة الـ process القيمة WAITING.'],
    'ch-sys-break': ['حاول كسر القواعد بتعليمة مميَّزة', 'استخدم الأزرار في "حاول كسر القواعد".'],
  },
  es: {
    'ch-sys-read': ['Seguir read() hasta volver a user mode', 'Selecciona read() y avanza hasta el último paso.'],
    'ch-sys-block': ['Atrapar al process mientras está bloqueado en el kernel', 'Avanza por read() hasta que el estado del process muestre WAITING.'],
    'ch-sys-break': ['Intentar romper las reglas con una instrucción privilegiada', 'Usa los botones de "Intenta romper las reglas".'],
  },
}

interface GenText {
  /** Same order in every language. */
  needsSyscall: string[]
  /** Same order in every language. */
  noSyscall: string[]
  needsPrompt: string
  needsExplain: (yes: string) => string
  notPrompt: string
  notExplain: (no: string) => string
}

export const syscallsGenText: Localized<GenText> = {
  en: {
    needsSyscall: ['Opening a file', 'Creating a new process', 'Writing text to the terminal', 'Asking the OS for more heap memory', 'Sending a network packet', 'Sleeping for one second', 'Getting the current process ID'],
    noSyscall: ['Adding two integers', 'Calling a function in your own program', 'Reading a local variable', 'Sorting an array in memory', 'Computing a square root', 'Comparing two strings'],
    needsPrompt: 'Which of these requires a system call?',
    needsExplain: (yes) => `"${yes}" touches something only the kernel controls (files, devices, processes or memory mappings). The others are plain computation in user mode.`,
    notPrompt: 'Which of these does NOT need a system call?',
    notExplain: (no) => `"${no}" is ordinary computation on the program's own memory, so it runs entirely in user mode.`,
  },
  he: {
    needsSyscall: ['פתיחת קובץ', 'יצירת process חדש', 'כתיבת טקסט למסוף', 'בקשה ממערכת ההפעלה לעוד זיכרון heap', 'שליחת חבילת רשת', 'שינה למשך שנייה אחת', 'קבלת ה-ID של ה-process הנוכחי'],
    noSyscall: ['חיבור שני מספרים שלמים', 'קריאה לפונקציה בתוך התוכנית שלכם', 'קריאת משתנה מקומי', 'מיון מערך בזיכרון', 'חישוב שורש ריבועי', 'השוואה בין שתי מחרוזות'],
    needsPrompt: 'איזו מהפעולות הבאות דורשת system call?',
    needsExplain: (yes) => `"${yes}" נוגעת במשהו שרק ה-kernel שולט בו (קבצים, התקנים, processes או מיפויי זיכרון). השאר הן חישוב רגיל ב-user mode.`,
    notPrompt: 'איזו מהפעולות הבאות לא צריכה system call?',
    notExplain: (no) => `"${no}" היא חישוב רגיל על הזיכרון של התוכנית עצמה, ולכן היא רצה כולה ב-user mode.`,
  },
  ar: {
    needsSyscall: ['فتح ملف', 'إنشاء process جديد', 'كتابة نص إلى الطرفية', 'طلب المزيد من ذاكرة الـ heap من نظام التشغيل', 'إرسال حزمة عبر الشبكة', 'النوم لمدة ثانية واحدة', 'الحصول على مُعرّف الـ process الحالي'],
    noSyscall: ['جمع عددين صحيحين', 'استدعاء دالة داخل برنامجك', 'قراءة متغير محلي', 'ترتيب مصفوفة في الذاكرة', 'حساب جذر تربيعي', 'مقارنة سلسلتين نصيتين'],
    needsPrompt: 'أيٌّ مما يلي يتطلب system call؟',
    needsExplain: (yes) => `"${yes}" تمسّ شيئًا لا يتحكم فيه إلا الـ kernel (الملفات أو الأجهزة أو الـ processes أو تعيينات الذاكرة). أما البقية فحسابات عادية في user mode.`,
    notPrompt: 'أيٌّ مما يلي لا يحتاج إلى system call؟',
    notExplain: (no) => `"${no}" حساب عادي على ذاكرة البرنامج نفسه، لذا يعمل بالكامل في user mode.`,
  },
  es: {
    needsSyscall: ['Abrir un archivo', 'Crear un process nuevo', 'Escribir texto en la terminal', 'Pedir al sistema operativo más memoria de heap', 'Enviar un paquete de red', 'Dormir durante un segundo', 'Obtener el ID del process actual'],
    noSyscall: ['Sumar dos enteros', 'Llamar a una función de tu propio programa', 'Leer una variable local', 'Ordenar un array en memoria', 'Calcular una raíz cuadrada', 'Comparar dos strings'],
    needsPrompt: '¿Cuál de estas requiere una system call?',
    needsExplain: (yes) => `"${yes}" toca algo que solo controla el kernel (archivos, dispositivos, processes o mapeos de memoria). Las demás son cálculo puro en user mode.`,
    notPrompt: '¿Cuál de estas NO necesita una system call?',
    notExplain: (no) => `"${no}" es cálculo ordinario sobre la memoria del propio programa, así que se ejecuta por completo en user mode.`,
  },
}
