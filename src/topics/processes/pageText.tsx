import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { ProcMsg } from '../../engines/processes'
import { ltr, type Localized } from '../../i18n'

type ButtonText = [label: string, hint: string]

interface ProcText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  diagramTitle: string
  diagramSubtitle: string
  undo: string
  redo: string
  reset: string
  pcbSubtitle: string
  noProcs: string
  treeTitle: string
  treeSubtitle: string
  logTitle: string
  logSubtitle: string
  blockArrow: string
  wakeArrow: string
  lastTransition: (from: ReactNode, to: ReactNode, label: string) => ReactNode
  transitionsHelp: string
  selected: string
  none: string
  running: string
  idle: string
  inWait: string
  zombieNote: string
  runningNote: string
  launch: string
  program: string
  buttons: {
    admit: ButtonText
    dispatch: ButtonText
    ioDone: ButtonText
    tick: ButtonText
    timeout: ButtonText
    io: ButtonText
    create: ButtonText
    fork: string
    exec: string
    wait: string
    exit: string
  }
  pcbRows: [pid: string, parent: string, state: string, program: string, pc: string, cpu: string, blocked: string, files: string]
  closed: string
  msg: (m: ProcMsg) => string
}

const hex = (n: number) => `0x${n.toString(16)}`

export const processesText: Localized<ProcText> = {
  en: {
    intro: (
      <>
        A <Term k="process">process</Term> is a program in execution. The kernel tracks each one in a <Term k="pcb">PCB</Term> and moves it between states as it
        runs, blocks on I/O, gets preempted and finally exits. New processes are created by <Term k="fork">fork()</Term> and usually load a new program with{' '}
        <Term k="exec">exec()</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>One CPU, one Running process.</strong> Everything else is Ready (could run) or Waiting (blocked on something).
      </>,
      <>
        <strong>Waiting never goes straight to Running.</strong> When I/O finishes the process becomes Ready and must be scheduled again.
      </>,
      <>
        <strong>Parents must wait().</strong> A dead child stays a <Term k="zombie">zombie</Term> until its parent collects its exit status.
      </>,
    ],
    diagramTitle: 'Process state diagram',
    diagramSubtitle: 'Click a process to select it, then use the actions to move it between states. Watch the tokens travel.',
    undo: 'Undo',
    redo: 'Redo',
    reset: 'Reset',
    pcbSubtitle: 'What the kernel stores about the selected process.',
    noProcs: 'No processes left. Create one.',
    treeTitle: 'Process tree',
    treeSubtitle: 'Every process has a parent. Orphans are adopted by init.',
    logTitle: 'Kernel event log',
    logSubtitle: 'Newest first.',
    blockArrow: 'I/O or wait()',
    wakeArrow: 'I/O done / child exit',
    lastTransition: (from, to, label) => (
      <>
        Last transition: <strong>{from}</strong> to <strong>{to}</strong> ({label})
      </>
    ),
    transitionsHelp:
      'Transitions: New to Ready (admit), Ready to Running (dispatch), Running to Ready (interrupt), Running to Waiting (I/O), Waiting to Ready (I/O done), Running to Terminated (exit).',
    selected: 'Selected',
    none: 'none',
    running: 'Running process',
    idle: 'none (CPU idle)',
    inWait: 'Blocked in wait(). Run one of its children and call exit().',
    zombieNote: 'Zombie: dispatch its parent and call wait() to reap it.',
    runningNote: 'This process owns the CPU. Use the system calls below.',
    launch: 'Launch a program',
    program: 'Program',
    buttons: {
      admit: ['Admit', 'Move into the ready queue'],
      dispatch: ['Dispatch to CPU', 'Give it the CPU'],
      ioDone: ['Complete I/O', 'Device interrupt: data is ready'],
      tick: ['Run instruction', 'Advance the program counter'],
      timeout: ['Timer interrupt', 'Preempt back to Ready'],
      io: ['read() from disk', 'Block on I/O'],
      create: ['Create process', 'Allocate a new PCB in the New state'],
      fork: 'Duplicate this process',
      exec: 'Replace the program',
      wait: 'Wait for a child to exit',
      exit: 'Terminate this process',
    },
    pcbRows: ['PID', 'Parent PID', 'State', 'Program', 'Program counter', 'CPU time used', 'Blocked on', 'Open files'],
    closed: '(closed)',
    msg: (m) => {
      const orphans = (o: number[]) => (o.length ? ` Its children ${o.join(', ')} are orphans and are re-parented to init.` : '')
      switch (m.k) {
        case 'boot': return 'System booted. init (PID 1) started bash (PID 100), which is ready to run.'
        case 'tableFull': return 'Process table is full in this demo.'
        case 'onlyNewAdmit': return 'Only a New process can be admitted.'
        case 'cpuBusy': return 'The CPU is busy. Preempt or block the running process first.'
        case 'onlyReadyDispatch': return 'Only a Ready process can be dispatched.'
        case 'notWaitingIo': return 'That process is not waiting for I/O.'
        case 'onlyRunningFork': return 'Only a running process can call fork().'
        case 'noneRunning': return 'No process is running.'
        case 'created': return `Created PID ${m.pid} (${m.program}). The kernel allocated a PCB; the process is New.`
        case 'admitted': return `PID ${m.pid} admitted to the ready queue.`
        case 'dispatched': return `Scheduler dispatched PID ${m.pid}: its saved registers are loaded and it is now Running.`
        case 'tick': return `PID ${m.pid} executed an instruction (PC is now ${hex(m.pc)}).`
        case 'timeout': return `Timer interrupt: PID ${m.pid} is preempted and goes back to Ready.`
        case 'io': return `PID ${m.pid} requested disk I/O and is now Waiting (blocked). The CPU is free.`
        case 'ioDone': return `I/O completed: an interrupt moves PID ${m.pid} back to Ready.`
        case 'fork': return `PID ${m.pid} called fork(). Child PID ${m.child} is a copy (same program "${m.program}", same PC, same open files). fork() returned ${m.child} to the parent and 0 to the child.`
        case 'exec': return `PID ${m.pid} called exec("${m.program}"). Its code, data and stack were replaced; the PID and open files stay the same.`
        case 'waitNoChildren': return `PID ${m.pid} called wait() but has no children: it returns -1 immediately.`
        case 'reaped': return `PID ${m.pid} called wait() and reaped zombie child ${m.child} immediately. Its PCB is freed.`
        case 'waitBlocks': return `PID ${m.pid} called wait() and blocks until one of its children exits.`
        case 'exitInit': return `PID ${m.pid} exited. init reaps it right away.${orphans(m.orphans)}`
        case 'exitWoken': return `PID ${m.pid} exited. Its parent ${m.parent} was waiting, so it collects the exit status and becomes Ready.${orphans(m.orphans)}`
        case 'exitZombie': return `PID ${m.pid} exited, but parent ${m.parent} has not called wait(). It is now a zombie.${orphans(m.orphans)}`
      }
    },
  },
  he: {
    intro: (
      <>
        <Term k="process">Process</Term> הוא תוכנית בהרצה. ה-kernel עוקב אחרי כל process ב-<Term k="pcb">PCB</Term> ומעביר אותו בין מצבים כשהוא רץ, נחסם על
        I/O, מופקע ולבסוף מסיים. Processes חדשים נוצרים בעזרת <Term k="fork">fork()</Term>, ובדרך כלל טוענים תוכנית חדשה עם <Term k="exec">exec()</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>CPU אחד, process אחד ב-Running.</strong> כל השאר נמצאים ב-Ready (יכולים לרוץ) או ב-Waiting (חסומים בהמתנה למשהו).
      </>,
      <>
        <strong>מ-Waiting לא עוברים ישר ל-Running.</strong> כשה-I/O מסתיים ה-process עובר ל-Ready, וצריך לחכות שיתזמנו אותו שוב.
      </>,
      <>
        <strong>Parent חייב לקרוא ל-wait().</strong> Child שמת נשאר <Term k="zombie">zombie</Term> עד שה-parent שלו אוסף את קוד היציאה.
      </>,
    ],
    diagramTitle: 'דיאגרמת המצבים של process',
    diagramSubtitle: 'לחצו על process כדי לבחור בו, ואז השתמשו בפעולות כדי להעביר אותו בין מצבים. שימו לב איך האסימונים זזים.',
    undo: 'ביטול',
    redo: 'חזרה',
    reset: 'איפוס',
    pcbSubtitle: 'מה ה-kernel שומר על ה-process שנבחר.',
    noProcs: 'לא נשארו processes. צרו אחד.',
    treeTitle: 'עץ ה-processes',
    treeSubtitle: 'לכל process יש parent. את ה-orphans מאמץ init.',
    logTitle: 'יומן האירועים של ה-kernel',
    logSubtitle: 'החדשים ביותר למעלה.',
    blockArrow: 'I/O או wait()',
    wakeArrow: 'סיום I/O / יציאת child',
    lastTransition: (from, to, label) => (
      <>
        המעבר האחרון: מ-<strong>{from}</strong> ל-<strong>{to}</strong> ({label})
      </>
    ),
    transitionsHelp: 'המעברים: New ל-Ready (admit), Ready ל-Running (dispatch), Running ל-Ready (interrupt), Running ל-Waiting (I/O), Waiting ל-Ready (סיום I/O), Running ל-Terminated (exit).',
    selected: 'נבחר',
    none: 'אין',
    running: 'ה-process שרץ',
    idle: 'אין (ה-CPU פנוי)',
    inWait: 'חסום ב-wait(). הריצו אחד מה-children שלו וקראו ל-exit().',
    zombieNote: 'Zombie: הריצו את ה-parent שלו וקראו ל-wait() כדי לאסוף אותו.',
    runningNote: 'ה-process הזה מחזיק ב-CPU. השתמשו ב-system calls שלמטה.',
    launch: 'הפעלת תוכנית',
    program: 'תוכנית',
    buttons: {
      admit: ['קבלה ל-Ready', 'העברה לתור ה-ready'],
      dispatch: ['הרצה על ה-CPU', 'לתת לו את ה-CPU'],
      ioDone: ['סיום I/O', 'Interrupt מההתקן: הנתונים מוכנים'],
      tick: ['הרצת פקודה', 'קידום ה-program counter'],
      timeout: ['Timer interrupt', 'הפקעה וחזרה ל-Ready'],
      io: ['read() מהדיסק', 'חסימה על I/O'],
      create: ['יצירת process', 'הקצאת PCB חדש במצב New'],
      fork: 'שכפול ה-process הזה',
      exec: 'החלפת התוכנית',
      wait: 'המתנה לסיום של child',
      exit: 'סיום ה-process הזה',
    },
    pcbRows: ['PID', 'PID של ה-parent', 'מצב', 'תוכנית', 'Program counter', 'זמן CPU שנוצל', 'חסום על', 'קבצים פתוחים'],
    closed: '(סגורים)',
    msg: (m) => {
      const orphans = (o: number[]) => (o.length ? ` ה-children שלו ${o.join(', ')} הם orphans ועוברים לאחריות init.` : '')
      switch (m.k) {
        case 'boot': return 'המערכת עלתה. init (PID 1) הפעיל את bash (PID 100), שמוכן לרוץ.'
        case 'tableFull': return 'טבלת ה-processes מלאה בהדגמה הזו.'
        case 'onlyNewAdmit': return 'אפשר לקבל ל-Ready רק process שנמצא ב-New.'
        case 'cpuBusy': return 'ה-CPU תפוס. קודם הפקיעו או חסמו את ה-process שרץ.'
        case 'onlyReadyDispatch': return 'אפשר להריץ רק process שנמצא ב-Ready.'
        case 'notWaitingIo': return 'ה-process הזה לא מחכה ל-I/O.'
        case 'onlyRunningFork': return 'רק process שרץ יכול לקרוא ל-fork().'
        case 'noneRunning': return 'אף process לא רץ.'
        case 'created': return `נוצר PID ${m.pid} (${m.program}). ה-kernel הקצה PCB, וה-process נמצא ב-New.`
        case 'admitted': return `PID ${m.pid} התקבל לתור ה-ready.`
        case 'dispatched': return `ה-scheduler הריץ את PID ${m.pid}: הרגיסטרים השמורים שלו נטענו והוא עכשיו ב-Running.`
        case 'tick': return `PID ${m.pid} ביצע פקודה (ה-PC עכשיו ${hex(m.pc)}).`
        case 'timeout': return `Timer interrupt: מפקיעים את ה-CPU מ-PID ${m.pid}, והוא חוזר ל-Ready.`
        case 'io': return `PID ${m.pid} ביקש I/O מהדיסק והוא עכשיו ב-Waiting (חסום). ה-CPU פנוי.`
        case 'ioDone': return `ה-I/O הסתיים: interrupt מחזיר את PID ${m.pid} ל-Ready.`
        case 'fork': return `PID ${m.pid} קרא ל-fork(). ה-child עם PID ${m.child} הוא העתק (אותה תוכנית "${m.program}", אותו PC, אותם קבצים פתוחים). fork() החזירה ${m.child} ל-parent ו-0 ל-child.`
        case 'exec': return `PID ${m.pid} קרא ל-exec("${m.program}"). הקוד, הנתונים וה-stack שלו הוחלפו; ה-PID והקבצים הפתוחים נשארים.`
        case 'waitNoChildren': return `PID ${m.pid} קרא ל-wait() אבל אין לו children, ולכן היא מחזירה מיד ${ltr('-1')}.`
        case 'reaped': return `PID ${m.pid} קרא ל-wait() ואסף מיד את ה-zombie child ${m.child}. ה-PCB שלו שוחרר.`
        case 'waitBlocks': return `PID ${m.pid} קרא ל-wait() ונחסם עד שאחד ה-children שלו יסיים.`
        case 'exitInit': return `PID ${m.pid} סיים. init אוסף אותו מיד.${orphans(m.orphans)}`
        case 'exitWoken': return `PID ${m.pid} סיים. ה-parent שלו, ${m.parent}, חיכה, ולכן הוא אוסף את קוד היציאה ועובר ל-Ready.${orphans(m.orphans)}`
        case 'exitZombie': return `PID ${m.pid} סיים, אבל ה-parent שלו, ${m.parent}, לא קרא ל-wait(). עכשיו הוא zombie.${orphans(m.orphans)}`
      }
    },
  },
  ar: {
    intro: (
      <>
        الـ <Term k="process">process</Term> هو برنامج قيد التنفيذ. يتتبّع الـ kernel كل process في <Term k="pcb">PCB</Term> وينقله بين الحالات وهو يعمل، ويُحجَب على
        I/O، وتُنتزَع منه الـ CPU، ثم ينتهي أخيرًا. تُنشأ الـ processes الجديدة بواسطة <Term k="fork">fork()</Term>، وعادةً ما تحمّل برنامجًا جديدًا بواسطة{' '}
        <Term k="exec">exec()</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>CPU واحدة، process واحد في Running.</strong> كل ما عداه في Ready (يمكنه العمل) أو في Waiting (محجوب بانتظار شيء ما).
      </>,
      <>
        <strong>لا انتقال مباشر من Waiting إلى Running.</strong> عندما ينتهي الـ I/O يصبح الـ process في Ready ويجب جدولته من جديد.
      </>,
      <>
        <strong>على الـ parent أن يستدعي wait().</strong> يبقى الـ child الميت <Term k="zombie">zombie</Term> حتى يجمع الـ parent حالة خروجه.
      </>,
    ],
    diagramTitle: 'مخطط حالات الـ process',
    diagramSubtitle: 'انقر على process لتحديده، ثم استخدم الإجراءات لنقله بين الحالات. راقب حركة الرموز.',
    undo: 'تراجع',
    redo: 'إعادة',
    reset: 'إعادة ضبط',
    pcbSubtitle: 'ما يخزّنه الـ kernel عن الـ process المحدد.',
    noProcs: 'لم يتبقَّ أي process. أنشئ واحدًا.',
    treeTitle: 'شجرة الـ processes',
    treeSubtitle: 'لكل process ‏parent. يتبنّى init الـ orphans.',
    logTitle: 'سجل أحداث الـ kernel',
    logSubtitle: 'الأحدث أولًا.',
    blockArrow: 'I/O أو wait()',
    wakeArrow: 'انتهاء I/O / خروج child',
    lastTransition: (from, to, label) => (
      <>
        آخر انتقال: من <strong>{from}</strong> إلى <strong>{to}</strong> ({label})
      </>
    ),
    transitionsHelp:
      'الانتقالات: من New إلى Ready (admit)، ومن Ready إلى Running (dispatch)، ومن Running إلى Ready (interrupt)، ومن Running إلى Waiting (I/O)، ومن Waiting إلى Ready (انتهاء I/O)، ومن Running إلى Terminated (exit).',
    selected: 'المحدد',
    none: 'لا شيء',
    running: 'الـ process الجاري',
    idle: 'لا يوجد (الـ CPU خاملة)',
    inWait: 'محجوب في wait(). شغّل أحد الـ children الخاصة به واستدعِ exit().',
    zombieNote: 'Zombie: شغّل الـ parent الخاص به واستدعِ wait() لجمعه.',
    runningNote: 'هذا الـ process يملك الـ CPU. استخدم الـ system calls أدناه.',
    launch: 'تشغيل برنامج',
    program: 'البرنامج',
    buttons: {
      admit: ['قبول (admit)', 'نقله إلى طابور الـ ready'],
      dispatch: ['تشغيل على الـ CPU', 'منحه الـ CPU'],
      ioDone: ['إنهاء I/O', 'Interrupt من الجهاز: البيانات جاهزة'],
      tick: ['تنفيذ تعليمة', 'تقديم الـ program counter'],
      timeout: ['Timer interrupt', 'انتزاع الـ CPU والعودة إلى Ready'],
      io: ['read() من القرص', 'الحجب على I/O'],
      create: ['إنشاء process', 'تخصيص PCB جديد في حالة New'],
      fork: 'نسخ هذا الـ process',
      exec: 'استبدال البرنامج',
      wait: 'انتظار خروج child',
      exit: 'إنهاء هذا الـ process',
    },
    pcbRows: ['PID', 'PID الخاص بالـ parent', 'الحالة', 'البرنامج', 'Program counter', 'زمن الـ CPU المستخدم', 'محجوب على', 'الملفات المفتوحة'],
    closed: '(مغلقة)',
    msg: (m) => {
      const orphans = (o: number[]) => (o.length ? ` أصبحت الـ children الخاصة به ${o.join('، ')} من الـ orphans وانتقلت إلى init.` : '')
      switch (m.k) {
        case 'boot': return 'بدأ النظام. شغّل init (PID 1) برنامج bash (PID 100)، وهو جاهز للعمل.'
        case 'tableFull': return 'جدول الـ processes ممتلئ في هذا العرض.'
        case 'onlyNewAdmit': return 'لا يمكن قبول إلا process في حالة New.'
        case 'cpuBusy': return 'الـ CPU مشغولة. انتزعها من الـ process الجاري أو احجبه أولًا.'
        case 'onlyReadyDispatch': return 'لا يمكن تشغيل إلا process في حالة Ready.'
        case 'notWaitingIo': return 'هذا الـ process لا ينتظر I/O.'
        case 'onlyRunningFork': return 'وحده الـ process الجاري يمكنه استدعاء fork().'
        case 'noneRunning': return 'لا يوجد process قيد التشغيل.'
        case 'created': return `أُنشئ PID ${m.pid} (${m.program}). خصّص الـ kernel ‏PCB، والـ process في حالة New.`
        case 'admitted': return `قُبل PID ${m.pid} في طابور الـ ready.`
        case 'dispatched': return `شغّل الـ scheduler ‏PID ${m.pid}: حُمّلت سجلاته المحفوظة وأصبح الآن في Running.`
        case 'tick': return `نفّذ PID ${m.pid} تعليمة (الـ PC الآن ${hex(m.pc)}).`
        case 'timeout': return `Timer interrupt: تُنتزَع الـ CPU من PID ${m.pid} ويعود إلى Ready.`
        case 'io': return `طلب PID ${m.pid} عملية I/O من القرص وهو الآن في Waiting (محجوب). الـ CPU متاحة.`
        case 'ioDone': return `اكتمل الـ I/O: ينقل interrupt ‏PID ${m.pid} إلى Ready من جديد.`
        case 'fork': return `استدعى PID ${m.pid} ‏fork(). الـ child ذو PID ${m.child} نسخة منه (البرنامج نفسه "${m.program}"، والـ PC نفسه، والملفات المفتوحة نفسها). أعادت fork() القيمة ${m.child} إلى الـ parent و0 إلى الـ child.`
        case 'exec': return `استدعى PID ${m.pid} ‏exec("${m.program}"). استُبدلت الشيفرة والبيانات والـ stack، ويبقى الـ PID والملفات المفتوحة كما هي.`
        case 'waitNoChildren': return `استدعى PID ${m.pid} ‏wait() لكن لا children له، فتعيد ${ltr('-1')} فورًا.`
        case 'reaped': return `استدعى PID ${m.pid} ‏wait() وجمع الـ zombie child ${m.child} فورًا. حُرّر الـ PCB الخاص به.`
        case 'waitBlocks': return `استدعى PID ${m.pid} ‏wait() ويُحجَب حتى ينتهي أحد الـ children الخاصة به.`
        case 'exitInit': return `انتهى PID ${m.pid}. يجمعه init فورًا.${orphans(m.orphans)}`
        case 'exitWoken': return `انتهى PID ${m.pid}. كان الـ parent ‏${m.parent} ينتظر، فيجمع حالة الخروج وينتقل إلى Ready.${orphans(m.orphans)}`
        case 'exitZombie': return `انتهى PID ${m.pid}، لكن الـ parent ‏${m.parent} لم يستدعِ wait(). أصبح الآن zombie.${orphans(m.orphans)}`
      }
    },
  },
  es: {
    intro: (
      <>
        Un <Term k="process">process</Term> es un programa en ejecución. El kernel registra cada uno en un <Term k="pcb">PCB</Term> y lo mueve entre estados a medida
        que se ejecuta, se bloquea en I/O, es expulsado y finalmente termina. Los processes nuevos se crean con <Term k="fork">fork()</Term> y normalmente cargan un
        programa nuevo con <Term k="exec">exec()</Term>.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Una CPU, un process en Running.</strong> Todos los demás están en Ready (podrían ejecutarse) o en Waiting (bloqueados esperando algo).
      </>,
      <>
        <strong>De Waiting nunca se pasa directamente a Running.</strong> Cuando termina el I/O, el process pasa a Ready y debe planificarse otra vez.
      </>,
      <>
        <strong>Los parents deben hacer wait().</strong> Un child muerto sigue siendo un <Term k="zombie">zombie</Term> hasta que su parent recoge su estado de salida.
      </>,
    ],
    diagramTitle: 'Diagrama de estados de un process',
    diagramSubtitle: 'Haz clic en un process para seleccionarlo y usa las acciones para moverlo entre estados. Observa cómo se desplazan las fichas.',
    undo: 'Deshacer',
    redo: 'Rehacer',
    reset: 'Reiniciar',
    pcbSubtitle: 'Lo que el kernel guarda sobre el process seleccionado.',
    noProcs: 'No quedan processes. Crea uno.',
    treeTitle: 'Árbol de processes',
    treeSubtitle: 'Todo process tiene un parent. init adopta a los orphans.',
    logTitle: 'Registro de eventos del kernel',
    logSubtitle: 'Los más recientes primero.',
    blockArrow: 'I/O o wait()',
    wakeArrow: 'fin de I/O / salida del child',
    lastTransition: (from, to, label) => (
      <>
        Última transición: de <strong>{from}</strong> a <strong>{to}</strong> ({label})
      </>
    ),
    transitionsHelp:
      'Transiciones: New a Ready (admit), Ready a Running (dispatch), Running a Ready (interrupt), Running a Waiting (I/O), Waiting a Ready (fin de I/O), Running a Terminated (exit).',
    selected: 'Seleccionado',
    none: 'ninguno',
    running: 'Process en ejecución',
    idle: 'ninguno (CPU libre)',
    inWait: 'Bloqueado en wait(). Ejecuta uno de sus children y llama a exit().',
    zombieNote: 'Zombie: ejecuta su parent y llama a wait() para recogerlo.',
    runningNote: 'Este process tiene la CPU. Usa las system calls de abajo.',
    launch: 'Lanzar un programa',
    program: 'Programa',
    buttons: {
      admit: ['Admitir', 'Pasar a la cola ready'],
      dispatch: ['Despachar a la CPU', 'Darle la CPU'],
      ioDone: ['Completar I/O', 'Interrupt del dispositivo: los datos están listos'],
      tick: ['Ejecutar instrucción', 'Avanzar el program counter'],
      timeout: ['Timer interrupt', 'Expulsarlo de vuelta a Ready'],
      io: ['read() del disco', 'Bloquearse en I/O'],
      create: ['Crear process', 'Reservar un PCB nuevo en el estado New'],
      fork: 'Duplicar este process',
      exec: 'Reemplazar el programa',
      wait: 'Esperar a que termine un child',
      exit: 'Terminar este process',
    },
    pcbRows: ['PID', 'PID del parent', 'Estado', 'Programa', 'Program counter', 'Tiempo de CPU usado', 'Bloqueado en', 'Archivos abiertos'],
    closed: '(cerrados)',
    msg: (m) => {
      const orphans = (o: number[]) => (o.length ? ` Sus children ${o.join(', ')} quedan orphans y pasan a depender de init.` : '')
      switch (m.k) {
        case 'boot': return 'Sistema iniciado. init (PID 1) arrancó bash (PID 100), que está listo para ejecutarse.'
        case 'tableFull': return 'La tabla de processes está llena en esta demostración.'
        case 'onlyNewAdmit': return 'Solo se puede admitir un process en estado New.'
        case 'cpuBusy': return 'La CPU está ocupada. Primero expulsa o bloquea el process en ejecución.'
        case 'onlyReadyDispatch': return 'Solo se puede despachar un process en estado Ready.'
        case 'notWaitingIo': return 'Ese process no está esperando I/O.'
        case 'onlyRunningFork': return 'Solo un process en ejecución puede llamar a fork().'
        case 'noneRunning': return 'No hay ningún process en ejecución.'
        case 'created': return `Se creó el PID ${m.pid} (${m.program}). El kernel reservó un PCB; el process está en New.`
        case 'admitted': return `El PID ${m.pid} entra en la cola ready.`
        case 'dispatched': return `El scheduler despachó el PID ${m.pid}: se cargan sus registros guardados y ahora está en Running.`
        case 'tick': return `El PID ${m.pid} ejecutó una instrucción (el PC ahora es ${hex(m.pc)}).`
        case 'timeout': return `Timer interrupt: el PID ${m.pid} es expulsado y vuelve a Ready.`
        case 'io': return `El PID ${m.pid} pidió I/O de disco y ahora está en Waiting (bloqueado). La CPU queda libre.`
        case 'ioDone': return `I/O completado: un interrupt devuelve el PID ${m.pid} a Ready.`
        case 'fork': return `El PID ${m.pid} llamó a fork(). El child con PID ${m.child} es una copia (mismo programa "${m.program}", mismo PC, mismos archivos abiertos). fork() devolvió ${m.child} al parent y 0 al child.`
        case 'exec': return `El PID ${m.pid} llamó a exec("${m.program}"). Se reemplazaron su código, sus datos y su stack; el PID y los archivos abiertos se mantienen.`
        case 'waitNoChildren': return `El PID ${m.pid} llamó a wait() pero no tiene children: devuelve -1 inmediatamente.`
        case 'reaped': return `El PID ${m.pid} llamó a wait() y recogió al instante al zombie child ${m.child}. Su PCB se libera.`
        case 'waitBlocks': return `El PID ${m.pid} llamó a wait() y se bloquea hasta que termine uno de sus children.`
        case 'exitInit': return `El PID ${m.pid} terminó. init lo recoge de inmediato.${orphans(m.orphans)}`
        case 'exitWoken': return `El PID ${m.pid} terminó. Su parent ${m.parent} estaba esperando, así que recoge el estado de salida y pasa a Ready.${orphans(m.orphans)}`
        case 'exitZombie': return `El PID ${m.pid} terminó, pero su parent ${m.parent} no ha llamado a wait(). Ahora es un zombie.${orphans(m.orphans)}`
      }
    },
  },
}
