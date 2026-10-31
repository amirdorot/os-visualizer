import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { Layer, RetValue, SyscallMsg } from '../../engines/syscalls'
import { ltr, type Localized } from '../../i18n'

type Outcome = [heading: string, body: string]

interface SysText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  walkTitle: string
  walkSubtitle: string
  callLabel: string
  stepCounter: (i: number, n: number) => string
  spaces: Record<'user' | 'kernel' | 'hardware', string>
  layers: Record<Layer, string>
  boundary: string
  cpuMode: string
  procState: string
  othersRun: string
  onCpu: string
  stepN: (n: number) => string
  registers: string
  retNote: Record<RetValue['note'], string>
  step: (m: SyscallMsg) => [title: string, detail: string]
  breakTitle: string
  breakSubtitle: string
  tryCli: string
  tryKernel: string
  trySyscall: string
  pickAction: string
  cli: Outcome
  kernel: Outcome
  syscall: Outcome
}

export const syscallsText: Localized<SysText> = {
  en: {
    intro: (
      <>
        User programs run in a restricted CPU mode. To do anything involving hardware or other processes, like reading a file, they must ask the kernel through
        a <Term k="syscall">system call</Term>. A <Term k="trap">trap</Term> instruction switches the CPU into <Term k="kernelmode">kernel mode</Term>, runs the
        kernel's handler, then returns.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Mode bit:</strong> the CPU knows whether it is running user or kernel code and refuses privileged instructions in user mode.
      </>,
      <>
        <strong>One controlled door:</strong> the trap always enters at the same kernel entry point, which dispatches by system call number.
      </>,
      <>
        <strong>Not free:</strong> each call costs two mode switches, and slow devices make the process block.
      </>,
    ],
    walkTitle: 'Follow a system call',
    walkSubtitle: 'Step through and watch the call travel down through the layers, across the user/kernel boundary, and back.',
    callLabel: 'System call',
    stepCounter: (i, n) => `step ${i}/${n}`,
    spaces: { user: 'User space (ring 3)', kernel: 'Kernel space (ring 0)', hardware: 'Hardware' },
    layers: {
      app: 'Application code',
      libc: 'C library (libc)',
      entry: 'System call entry / dispatch table',
      kernel: 'Kernel service (VFS, process mgmt)',
      fs: 'File system / page cache',
      driver: 'Device driver',
      hardware: 'Disk / terminal hardware',
    },
    boundary: 'privilege boundary',
    cpuMode: 'CPU mode',
    procState: 'Process state',
    othersRun: 'other processes run',
    onCpu: 'on the CPU',
    stepN: (n) => `Step ${n}`,
    registers: 'Registers',
    retNote: { bytesRead: 'bytes read', bytesWritten: 'bytes written', pid: 'pid' },
    step: (m) => {
      const r = (ret: RetValue) => `${ret.value} (${syscallsText.en.retNote[ret.note]})`
      switch (m.k) {
        case 'call': return ['The program makes a call', `The application executes ${m.code} It looks like an ordinary function call.`]
        case 'wrapper': return ['libc wrapper prepares the trap', `The libc wrapper puts the system call number ${m.nr} in rax and the arguments in rdi, rsi, rdx, following the system call ABI.`]
        case 'trap': return ['syscall instruction: trap into the kernel', 'The CPU switches to kernel mode, saves the user instruction pointer and stack, and jumps to the kernel entry point configured at boot. User code cannot jump here any other way.']
        case 'dispatch': return [
          `Dispatch: sys_call_table[${m.nr}]`,
          `The kernel validates the number and calls the handler sys_${m.name}(). ${m.name === 'getpid' ? 'It reads the PID from the current process control block.' : 'It looks up the file descriptor in the process file table and checks permissions and that the buffer is a valid user address.'}`,
        ]
        case 'readFs': return ['File system and page cache', 'The VFS asks the file system which disk blocks hold the requested range. The data is not in the page cache, so a disk read is needed.']
        case 'readDriver': return ['Driver issues the I/O', 'The block driver queues a request to the disk controller. The process is put to sleep (Waiting) and the scheduler runs another process meanwhile.']
        case 'readDisk': return ['Disk transfers the data (DMA)', 'The disk reads the blocks and copies them into memory via DMA, then raises an interrupt. The interrupt handler wakes our process (Ready).']
        case 'readCopy': return ['copy_to_user()', 'The data now sits in the page cache. The kernel copies the bytes into the user buffer at 0x7ffd10, carefully, because it is user memory.']
        case 'writeCopy': return ['copy_from_user()', 'fd 1 is a terminal, so the VFS routes the call to the tty layer. The kernel copies the 13 bytes from user memory into a kernel buffer.']
        case 'writeDriver': return ['TTY / console driver', 'The terminal driver queues the characters for output. This is fast, so the process does not need to block.']
        case 'writeScreen': return ['Characters reach the screen', 'The display or pseudo-terminal receives "Hello, world".']
        case 'retval': return ['Return value placed in rax', `The handler returns ${r(m.ret)}. The kernel stores it in rax, restores the saved user registers and executes sysret.`]
        case 'backUser': return ['Back in user mode', 'The CPU drops back to user mode. The libc wrapper checks for a negative error code (and would set errno) and returns.']
        case 'continue': return ['The program continues', `The call returned ${r(m.ret)}. The program carries on with the next line as if it had called a normal function.`]
      }
    },
    breakTitle: 'Try to break the rules',
    breakSubtitle: 'What happens when user-mode code tries to do privileged things directly?',
    tryCli: 'Execute "cli" (disable interrupts)',
    tryKernel: 'Read kernel memory directly',
    trySyscall: 'Ask politely with a system call',
    pickAction: 'Pick an action above.',
    cli: [
      'General protection fault.',
      'cli is privileged. The CPU refuses in user mode and traps to the kernel, which kills the process with SIGSEGV. If user code could disable interrupts, it could freeze the whole machine.',
    ],
    kernel: [
      'Page fault: protection violation.',
      "Kernel pages are marked supervisor-only in the page table. The MMU blocks the access and the process receives SIGSEGV. This keeps programs from reading other processes' data or passwords.",
    ],
    syscall: [
      'Allowed.',
      'The syscall instruction enters the kernel at its official entry point. The kernel checks your permissions and arguments and performs the operation on your behalf. Safe, controlled and auditable.',
    ],
  },
  he: {
    intro: (
      <>
        תוכניות משתמש רצות במצב CPU מוגבל. כדי לעשות כל דבר שמערב חומרה או processes אחרים, כמו לקרוא קובץ, הן חייבות לבקש מה-kernel דרך{' '}
        <Term k="syscall">system call</Term>. פקודת <Term k="trap">trap</Term> מעבירה את ה-CPU ל-<Term k="kernelmode">kernel mode</Term>, מריצה את ה-handler של
        ה-kernel, ואז חוזרת.
      </>
    ),
    keyIdeas: [
      <>
        <strong>ה-mode bit:</strong> ה-CPU יודע אם הוא מריץ קוד משתמש או קוד kernel, ומסרב לבצע פקודות מיוחסות (privileged) ב-user mode.
      </>,
      <>
        <strong>דלת אחת מבוקרת:</strong> ה-trap תמיד נכנס לאותה נקודת כניסה ב-kernel, שמנתבת את הבקשה לפי מספר ה-system call.
      </>,
      <>
        <strong>זה לא בחינם:</strong> כל קריאה עולה שני מעברי מצב, והתקנים איטיים גורמים ל-process להיחסם.
      </>,
    ],
    walkTitle: 'מעקב אחרי system call',
    walkSubtitle: 'התקדמו צעד אחר צעד וצפו בקריאה שיורדת דרך השכבות, חוצה את הגבול בין user ל-kernel, וחוזרת.',
    callLabel: 'System call',
    stepCounter: (i, n) => `שלב ${i}/${n}`,
    spaces: { user: 'מרחב המשתמש (ring 3)', kernel: 'מרחב ה-kernel (ring 0)', hardware: 'חומרה' },
    layers: {
      app: 'קוד האפליקציה',
      libc: 'ספריית C (libc)',
      entry: 'נקודת הכניסה ל-system calls / טבלת ה-dispatch',
      kernel: 'שירות של ה-kernel (VFS, ניהול processes)',
      fs: 'מערכת הקבצים / page cache',
      driver: 'מנהל התקן (device driver)',
      hardware: 'חומרת הדיסק / המסוף',
    },
    boundary: 'גבול ההרשאות',
    cpuMode: 'מצב ה-CPU',
    procState: 'מצב ה-process',
    othersRun: 'processes אחרים רצים',
    onCpu: 'על ה-CPU',
    stepN: (n) => `שלב ${n}`,
    registers: 'רגיסטרים',
    retNote: { bytesRead: 'בתים שנקראו', bytesWritten: 'בתים שנכתבו', pid: 'PID' },
    step: (m) => {
      const r = (ret: RetValue) => `${ret.value} (${syscallsText.he!.retNote[ret.note]})`
      switch (m.k) {
        case 'call': return ['התוכנית מבצעת קריאה', `האפליקציה מריצה את ${ltr(m.code)} זה נראה כמו קריאה רגילה לפונקציה.`]
        case 'wrapper': return ['ה-wrapper של libc מכין את ה-trap', `ה-wrapper של libc שם את מספר ה-system call ‏${m.nr} ב-rax ואת הארגומנטים ב-rdi, rsi, rdx, לפי ה-ABI של system calls.`]
        case 'trap': return ['פקודת syscall: מעבר ב-trap אל ה-kernel', 'ה-CPU עובר ל-kernel mode, שומר את ה-instruction pointer ואת ה-stack של המשתמש, וקופץ לנקודת הכניסה של ה-kernel שהוגדרה בזמן האתחול. קוד משתמש לא יכול להגיע לכאן בשום דרך אחרת.']
        case 'dispatch': return [
          `Dispatch: ${ltr(`sys_call_table[${m.nr}]`)}`,
          `ה-kernel מוודא שהמספר תקין וקורא ל-handler ‏${ltr(`sys_${m.name}()`)}. ${m.name === 'getpid' ? 'הוא קורא את ה-PID מה-process control block של ה-process הנוכחי.' : 'הוא מחפש את ה-file descriptor בטבלת הקבצים של ה-process, ובודק את ההרשאות ושה-buffer הוא כתובת משתמש תקינה.'}`,
        ]
        case 'readFs': return ['מערכת הקבצים וה-page cache', 'ה-VFS שואל את מערכת הקבצים אילו blocks בדיסק מכילים את הטווח המבוקש. הנתונים לא נמצאים ב-page cache, ולכן צריך לקרוא מהדיסק.']
        case 'readDriver': return ['ה-driver שולח את בקשת ה-I/O', 'ה-block driver מכניס בקשה לתור של בקר הדיסק. ה-process מורדם (Waiting), ובינתיים ה-scheduler מריץ process אחר.']
        case 'readDisk': return ['הדיסק מעביר את הנתונים (DMA)', 'הדיסק קורא את ה-blocks ומעתיק אותם לזיכרון בעזרת DMA, ואז מעלה interrupt. ה-interrupt handler מעיר את ה-process שלנו (Ready).']
        case 'readCopy': return ['copy_to_user()', 'הנתונים נמצאים עכשיו ב-page cache. ה-kernel מעתיק את הבתים ל-buffer של המשתמש בכתובת 0x7ffd10, בזהירות, כי זה זיכרון של המשתמש.']
        case 'writeCopy': return ['copy_from_user()', 'fd 1 הוא מסוף, ולכן ה-VFS מנתב את הקריאה לשכבת ה-tty. ה-kernel מעתיק את 13 הבתים מזיכרון המשתמש ל-buffer של ה-kernel.']
        case 'writeDriver': return ['ה-driver של ה-TTY / הקונסולה', 'ה-driver של המסוף מכניס את התווים לתור הפלט. זה מהיר, ולכן ה-process לא צריך להיחסם.']
        case 'writeScreen': return ['התווים מגיעים למסך', 'המסך או ה-pseudo-terminal מקבלים את "Hello, world".']
        case 'retval': return ['ערך ההחזרה נשמר ב-rax', `ה-handler מחזיר ${r(m.ret)}. ה-kernel שומר אותו ב-rax, משחזר את רגיסטרי המשתמש השמורים ומריץ sysret.`]
        case 'backUser': return ['חזרה ל-user mode', 'ה-CPU חוזר ל-user mode. ה-wrapper של libc בודק אם הוחזר קוד שגיאה שלילי (ואם כן, מעדכן את errno) וחוזר.']
        case 'continue': return ['התוכנית ממשיכה', `הקריאה החזירה ${r(m.ret)}. התוכנית ממשיכה לשורה הבאה כאילו קראה לפונקציה רגילה.`]
      }
    },
    breakTitle: 'נסו לשבור את החוקים',
    breakSubtitle: 'מה קורה כשקוד שרץ ב-user mode מנסה לבצע פעולות מיוחסות ישירות?',
    tryCli: 'הרצת "cli" (כיבוי interrupts)',
    tryKernel: 'קריאה ישירה מהזיכרון של ה-kernel',
    trySyscall: 'לבקש יפה עם system call',
    pickAction: 'בחרו פעולה למעלה.',
    cli: [
      'General protection fault.',
      'cli היא פקודה מיוחסת. ה-CPU מסרב לבצע אותה ב-user mode ועושה trap ל-kernel, שהורג את ה-process עם SIGSEGV. אם קוד משתמש היה יכול לכבות interrupts, הוא היה יכול להקפיא את כל המחשב.',
    ],
    kernel: [
      'Page fault: הפרת הגנה.',
      'הדפים של ה-kernel מסומנים ב-page table כ-supervisor-only. ה-MMU חוסם את הגישה וה-process מקבל SIGSEGV. כך תוכניות לא יכולות לקרוא נתונים או סיסמאות של processes אחרים.',
    ],
    syscall: [
      'מותר.',
      'פקודת syscall נכנסת ל-kernel דרך נקודת הכניסה הרשמית שלו. ה-kernel בודק את ההרשאות ואת הארגומנטים שלכם ומבצע את הפעולה בשמכם. בטוח, מבוקר וניתן למעקב.',
    ],
  },
  ar: {
    intro: (
      <>
        تعمل برامج المستخدم في نمط CPU مقيَّد. لفعل أي شيء يتعلق بالعتاد أو بـ processes أخرى، مثل قراءة ملف، عليها أن تطلب ذلك من الـ kernel عبر{' '}
        <Term k="syscall">system call</Term>. تنقل تعليمة <Term k="trap">trap</Term> الـ CPU إلى <Term k="kernelmode">kernel mode</Term>، وتشغّل الـ handler الخاص
        بالـ kernel، ثم تعود.
      </>
    ),
    keyIdeas: [
      <>
        <strong>الـ mode bit:</strong> تعرف الـ CPU إن كانت تنفّذ شيفرة مستخدم أم شيفرة kernel، وترفض التعليمات المميَّزة (privileged) في user mode.
      </>,
      <>
        <strong>باب واحد مضبوط:</strong> يدخل الـ trap دائمًا من نقطة الدخول نفسها في الـ kernel، والتي توجّه الطلب حسب رقم الـ system call.
      </>,
      <>
        <strong>ليس مجانيًا:</strong> كل استدعاء يكلّف انتقالين بين النمطين، والأجهزة البطيئة تجعل الـ process يُحجَب.
      </>,
    ],
    walkTitle: 'تتبّع system call',
    walkSubtitle: 'تقدّم خطوة بخطوة وشاهد الاستدعاء وهو ينزل عبر الطبقات، ويعبر الحد بين user والـ kernel، ثم يعود.',
    callLabel: 'System call',
    stepCounter: (i, n) => `الخطوة ${i}/${n}`,
    spaces: { user: 'فضاء المستخدم (ring 3)', kernel: 'فضاء الـ kernel (ring 0)', hardware: 'العتاد' },
    layers: {
      app: 'شيفرة التطبيق',
      libc: 'مكتبة C (libc)',
      entry: 'نقطة دخول الـ system calls / جدول الـ dispatch',
      kernel: 'خدمة الـ kernel (VFS، إدارة الـ processes)',
      fs: 'نظام الملفات / الـ page cache',
      driver: 'مشغّل الجهاز (device driver)',
      hardware: 'عتاد القرص / الطرفية',
    },
    boundary: 'حدّ الصلاحيات',
    cpuMode: 'نمط الـ CPU',
    procState: 'حالة الـ process',
    othersRun: 'تعمل processes أخرى',
    onCpu: 'على الـ CPU',
    stepN: (n) => `الخطوة ${n}`,
    registers: 'السجلات',
    retNote: { bytesRead: 'بايت مقروءة', bytesWritten: 'بايت مكتوبة', pid: 'PID' },
    step: (m) => {
      const r = (ret: RetValue) => `${ret.value} (${syscallsText.ar!.retNote[ret.note]})`
      switch (m.k) {
        case 'call': return ['البرنامج يجري استدعاءً', `ينفّذ التطبيق ${ltr(m.code)} ويبدو ذلك كاستدعاء دالة عادي.`]
        case 'wrapper': return ['الـ wrapper في libc يجهّز الـ trap', `يضع الـ wrapper في libc رقم الـ system call ‏${m.nr} في rax والوسائط في rdi و rsi و rdx، وفق الـ ABI الخاص بالـ system calls.`]
        case 'trap': return ['تعليمة syscall: الدخول إلى الـ kernel عبر trap', 'تنتقل الـ CPU إلى kernel mode، وتحفظ الـ instruction pointer والـ stack الخاصين بالمستخدم، وتقفز إلى نقطة دخول الـ kernel التي ضُبطت عند الإقلاع. لا تستطيع شيفرة المستخدم الوصول إلى هنا بأي طريقة أخرى.']
        case 'dispatch': return [
          `Dispatch: ${ltr(`sys_call_table[${m.nr}]`)}`,
          `يتحقق الـ kernel من صحة الرقم ويستدعي الـ handler ‏${ltr(`sys_${m.name}()`)}. ${m.name === 'getpid' ? 'يقرأ الـ PID من الـ process control block الخاص بالـ process الحالي.' : 'يبحث عن الـ file descriptor في جدول ملفات الـ process، ويتحقق من الصلاحيات ومن أن الـ buffer عنوان مستخدم صالح.'}`,
        ]
        case 'readFs': return ['نظام الملفات والـ page cache', 'يسأل الـ VFS نظام الملفات عن الـ blocks في القرص التي تحتوي النطاق المطلوب. البيانات غير موجودة في الـ page cache، لذا تلزم قراءة من القرص.']
        case 'readDriver': return ['الـ driver يرسل طلب الـ I/O', 'يضع الـ block driver طلبًا في طابور متحكم القرص. يُنوَّم الـ process (Waiting)، ويشغّل الـ scheduler خلال ذلك process آخر.']
        case 'readDisk': return ['القرص ينقل البيانات (DMA)', 'يقرأ القرص الـ blocks وينسخها إلى الذاكرة عبر DMA، ثم يرفع interrupt. يوقظ الـ interrupt handler الـ process الخاص بنا (Ready).']
        case 'readCopy': return ['copy_to_user()', 'أصبحت البيانات الآن في الـ page cache. ينسخ الـ kernel البايتات إلى الـ buffer الخاص بالمستخدم عند العنوان 0x7ffd10، بحذر، لأنها ذاكرة مستخدم.']
        case 'writeCopy': return ['copy_from_user()', 'الـ fd 1 طرفية، لذا يوجّه الـ VFS الاستدعاء إلى طبقة الـ tty. ينسخ الـ kernel الـ 13 بايت من ذاكرة المستخدم إلى buffer داخل الـ kernel.']
        case 'writeDriver': return ['الـ driver الخاص بالـ TTY / وحدة التحكم', 'يضع الـ driver الخاص بالطرفية الأحرف في طابور الإخراج. هذا سريع، لذا لا يحتاج الـ process إلى أن يُحجَب.']
        case 'writeScreen': return ['الأحرف تصل إلى الشاشة', 'تستقبل الشاشة أو الـ pseudo-terminal النص "Hello, world".']
        case 'retval': return ['قيمة الإرجاع توضع في rax', `يعيد الـ handler القيمة ${r(m.ret)}. يخزّنها الـ kernel في rax، ويستعيد سجلات المستخدم المحفوظة، وينفّذ sysret.`]
        case 'backUser': return ['العودة إلى user mode', 'تعود الـ CPU إلى user mode. يتحقق الـ wrapper في libc من وجود رمز خطأ سالب (وعندها يضبط errno) ثم يعود.']
        case 'continue': return ['البرنامج يتابع', `أعاد الاستدعاء ${r(m.ret)}. يتابع البرنامج إلى السطر التالي كأنه استدعى دالة عادية.`]
      }
    },
    breakTitle: 'حاول كسر القواعد',
    breakSubtitle: 'ماذا يحدث عندما تحاول شيفرة في user mode تنفيذ عمليات مميَّزة مباشرةً؟',
    tryCli: 'تنفيذ "cli" (تعطيل الـ interrupts)',
    tryKernel: 'قراءة ذاكرة الـ kernel مباشرةً',
    trySyscall: 'اطلب بأدب عبر system call',
    pickAction: 'اختر إجراءً من الأعلى.',
    cli: [
      'General protection fault.',
      'التعليمة cli مميَّزة (privileged). ترفض الـ CPU تنفيذها في user mode وتنفّذ trap إلى الـ kernel، الذي ينهي الـ process بالإشارة SIGSEGV. لو استطاعت شيفرة المستخدم تعطيل الـ interrupts لأمكنها تجميد الجهاز بأكمله.',
    ],
    kernel: [
      'Page fault: انتهاك للحماية.',
      'صفحات الـ kernel معلَّمة في الـ page table على أنها supervisor-only. يمنع الـ MMU الوصول ويتلقى الـ process الإشارة SIGSEGV. هذا يمنع البرامج من قراءة بيانات الـ processes الأخرى أو كلمات المرور.',
    ],
    syscall: [
      'مسموح.',
      'تدخل تعليمة syscall إلى الـ kernel من نقطة الدخول الرسمية. يتحقق الـ kernel من صلاحياتك ومن الوسائط ثم ينفّذ العملية نيابةً عنك. آمن ومضبوط وقابل للتدقيق.',
    ],
  },
  es: {
    intro: (
      <>
        Los programas de usuario se ejecutan en un modo restringido de la CPU. Para hacer cualquier cosa que involucre hardware u otros processes, como leer un
        archivo, deben pedírselo al kernel mediante una <Term k="syscall">system call</Term>. Una instrucción <Term k="trap">trap</Term> cambia la CPU a{' '}
        <Term k="kernelmode">kernel mode</Term>, ejecuta el handler del kernel y luego regresa.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Mode bit:</strong> la CPU sabe si está ejecutando código de usuario o del kernel, y rechaza las instrucciones privilegiadas en user mode.
      </>,
      <>
        <strong>Una única puerta controlada:</strong> el trap siempre entra por el mismo punto de entrada del kernel, que despacha según el número de system call.
      </>,
      <>
        <strong>No es gratis:</strong> cada llamada cuesta dos cambios de modo, y los dispositivos lentos hacen que el process se bloquee.
      </>,
    ],
    walkTitle: 'Sigue una system call',
    walkSubtitle: 'Avanza paso a paso y observa cómo la llamada baja por las capas, cruza la frontera entre user y kernel, y vuelve.',
    callLabel: 'System call',
    stepCounter: (i, n) => `paso ${i}/${n}`,
    spaces: { user: 'Espacio de usuario (ring 3)', kernel: 'Espacio del kernel (ring 0)', hardware: 'Hardware' },
    layers: {
      app: 'Código de la aplicación',
      libc: 'Biblioteca de C (libc)',
      entry: 'Entrada de system calls / tabla de dispatch',
      kernel: 'Servicio del kernel (VFS, gestión de processes)',
      fs: 'Sistema de archivos / page cache',
      driver: 'Driver del dispositivo',
      hardware: 'Hardware de disco / terminal',
    },
    boundary: 'frontera de privilegio',
    cpuMode: 'Modo de la CPU',
    procState: 'Estado del process',
    othersRun: 'se ejecutan otros processes',
    onCpu: 'en la CPU',
    stepN: (n) => `Paso ${n}`,
    registers: 'Registros',
    retNote: { bytesRead: 'bytes leídos', bytesWritten: 'bytes escritos', pid: 'pid' },
    step: (m) => {
      const r = (ret: RetValue) => `${ret.value} (${syscallsText.es!.retNote[ret.note]})`
      switch (m.k) {
        case 'call': return ['El programa hace una llamada', `La aplicación ejecuta ${m.code} Parece una llamada a función normal.`]
        case 'wrapper': return ['El wrapper de libc prepara el trap', `El wrapper de libc pone el número de system call ${m.nr} en rax y los argumentos en rdi, rsi y rdx, siguiendo la ABI de system calls.`]
        case 'trap': return ['Instrucción syscall: trap al kernel', 'La CPU cambia a kernel mode, guarda el instruction pointer y el stack del usuario, y salta al punto de entrada del kernel configurado en el arranque. El código de usuario no puede llegar aquí de ninguna otra forma.']
        case 'dispatch': return [
          `Dispatch: sys_call_table[${m.nr}]`,
          `El kernel valida el número y llama al handler sys_${m.name}(). ${m.name === 'getpid' ? 'Lee el PID del process control block del process actual.' : 'Busca el file descriptor en la tabla de archivos del process y comprueba los permisos y que el buffer sea una dirección de usuario válida.'}`,
        ]
        case 'readFs': return ['Sistema de archivos y page cache', 'El VFS pregunta al sistema de archivos qué blocks del disco contienen el rango pedido. Los datos no están en la page cache, así que hace falta leer del disco.']
        case 'readDriver': return ['El driver lanza el I/O', 'El block driver encola una petición al controlador del disco. El process se duerme (Waiting) y, mientras tanto, el scheduler ejecuta otro process.']
        case 'readDisk': return ['El disco transfiere los datos (DMA)', 'El disco lee los blocks y los copia a memoria mediante DMA, y luego lanza un interrupt. El interrupt handler despierta a nuestro process (Ready).']
        case 'readCopy': return ['copy_to_user()', 'Los datos ya están en la page cache. El kernel copia los bytes al buffer del usuario en 0x7ffd10, con cuidado, porque es memoria de usuario.']
        case 'writeCopy': return ['copy_from_user()', 'El fd 1 es una terminal, así que el VFS dirige la llamada a la capa tty. El kernel copia los 13 bytes de la memoria de usuario a un buffer del kernel.']
        case 'writeDriver': return ['Driver de TTY / consola', 'El driver de la terminal encola los caracteres para su salida. Es rápido, así que el process no necesita bloquearse.']
        case 'writeScreen': return ['Los caracteres llegan a la pantalla', 'La pantalla o la pseudo-terminal recibe "Hello, world".']
        case 'retval': return ['El valor de retorno se coloca en rax', `El handler devuelve ${r(m.ret)}. El kernel lo guarda en rax, restaura los registros de usuario guardados y ejecuta sysret.`]
        case 'backUser': return ['De vuelta en user mode', 'La CPU vuelve a user mode. El wrapper de libc comprueba si hay un código de error negativo (en ese caso pondría errno) y retorna.']
        case 'continue': return ['El programa continúa', `La llamada devolvió ${r(m.ret)}. El programa sigue con la siguiente línea como si hubiera llamado a una función normal.`]
      }
    },
    breakTitle: 'Intenta romper las reglas',
    breakSubtitle: '¿Qué pasa cuando código en user mode intenta hacer cosas privilegiadas directamente?',
    tryCli: 'Ejecutar "cli" (desactivar interrupts)',
    tryKernel: 'Leer la memoria del kernel directamente',
    trySyscall: 'Pedirlo amablemente con una system call',
    pickAction: 'Elige una acción de arriba.',
    cli: [
      'General protection fault.',
      'cli es una instrucción privilegiada. La CPU se niega a ejecutarla en user mode y hace un trap al kernel, que mata el process con SIGSEGV. Si el código de usuario pudiera desactivar los interrupts, podría congelar toda la máquina.',
    ],
    kernel: [
      'Page fault: violación de protección.',
      'Las páginas del kernel están marcadas como supervisor-only en la page table. La MMU bloquea el acceso y el process recibe SIGSEGV. Así los programas no pueden leer los datos ni las contraseñas de otros processes.',
    ],
    syscall: [
      'Permitido.',
      'La instrucción syscall entra al kernel por su punto de entrada oficial. El kernel comprueba tus permisos y argumentos y realiza la operación en tu nombre. Seguro, controlado y auditable.',
    ],
  },
}
