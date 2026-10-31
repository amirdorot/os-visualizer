import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { FitStrategy, ReplaceAlgo } from '../../engines/memory'
import { ltr, type Localized } from '../../i18n'

export type AllocMsg =
  | { k: 'fragFail'; size: number; free: number; largest: number }
  | { k: 'noMem'; size: number; free: number }
  | { k: 'placed'; name: string; size: number; at: number; holes: number; strategy: FitStrategy }
  | { k: 'fragmented' }
  | { k: 'freed'; owner: string; size: number }

interface MemText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  tr: {
    title: string
    subtitle: string
    pageSize: string
    addrLabel: (max: number) => string
    pageBits: (n: number) => string
    offsetBits: (n: number) => string
    virtualPages: string
    page: (i: number) => string
    tableTitle: string
    cols: [page: string, frame: string, valid: string]
    rowLabel: (page: number, frame: number | null) => string
    physicalFrames: string
    frame: (i: number) => string
    holds: (page: number) => string
    free: string
    notNumber: string
    outOfRange: (addr: number, pages: number) => string
    fault: (page: number) => ReactNode
    handle: string
    ok: (page: number, frame: number, pageSize: number, offset: number, physical: number) => ReactNode
  }
  rep: {
    title: string
    subtitle: string
    algo: string
    optimal: string
    refs: string
    frames: string
    belady: string
    progress: (n: number, total: number) => string
    rowRef: string
    rowFrame: (f: number) => string
    rowResult: string
    start: string
    hit: (ref: number, slot: number) => string
    freeFrame: (ref: number, slot: number) => string
    evict: (ref: number, algo: ReplaceAlgo, victim: number) => string
    faults: string
    total: (algo: ReplaceAlgo) => string
  }
  alloc: {
    title: string
    subtitle: string
    fit: string
    size: string
    allocate: (name: string) => string
    fragmented: string
    reset: string
    blockTitle: (owner: string, size: number) => string
    holeTitle: (size: number) => string
    free: string
    freeTotal: string
    largest: string
    extFrag: string
    extFragHint: string
    msg: (m: AllocMsg) => string
  }
}

const fitName = (s: FitStrategy) => `${s} fit`

export const memoryText: Localized<MemText> = {
  en: {
    intro: (
      <>
        Every process believes it has its own private memory starting at address 0. That illusion is <Term k="virtual">virtual memory</Term>: the MMU translates
        each address through a page table, and the OS moves <Term k="page">pages</Term> between RAM and disk on demand.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Address = page number + offset.</strong> Only the page number is translated; the offset is copied as-is.
      </>,
      <>
        <strong>Missing page?</strong> A <Term k="pagefault">page fault</Term> loads it from disk, evicting a victim chosen by the replacement policy.
      </>,
      <>
        <strong>Contiguous allocation</strong> suffers from <Term k="fragmentation">external fragmentation</Term>; paging avoids it.
      </>,
    ],
    tr: {
      title: 'Virtual to physical address translation',
      subtitle: 'Type a virtual address (decimal or 0x hex). Click page-table rows to swap pages in or out.',
      pageSize: 'Page size',
      addrLabel: (max) => `Virtual address (0 - ${max})`,
      pageBits: (n) => `page (${n} bits)`,
      offsetBits: (n) => `offset (${n} bits)`,
      virtualPages: 'Virtual pages',
      page: (i) => `Page ${i}`,
      tableTitle: 'Page table (click a row)',
      cols: ['page', 'frame', 'valid'],
      rowLabel: (p, f) => `Page ${p}: ${f !== null ? `in frame ${f}` : 'not in memory'}. Press Enter to swap ${f !== null ? 'out' : 'in'}.`,
      physicalFrames: 'Physical frames (RAM)',
      frame: (i) => `Frame ${i}`,
      holds: (p) => `holds page ${p}`,
      free: 'free',
      notNumber: 'Enter a non-negative number.',
      outOfRange: (a, pages) => `Address ${a} is beyond the ${pages}-page address space. The MMU raises a segmentation fault and the process is killed.`,
      fault: (p) => (
        <>
          <strong>Page fault!</strong> Page {p} is not in RAM. The kernel must load it from disk.
        </>
      ),
      handle: 'Handle page fault',
      ok: (p, f, ps, o, phys) => (
        <>
          Page {p} lives in frame {f}. Physical address = {f} x {ps} + {o} = <strong className="font-mono">{phys}</strong> {`(0x${phys.toString(16)})`}.
        </>
      ),
    },
    rep: {
      title: 'Page replacement',
      subtitle: 'RAM has only a few frames. Step through the reference string and watch which page gets evicted on each fault.',
      algo: 'Replacement algorithm',
      optimal: 'Optimal',
      refs: 'Reference string (page numbers)',
      frames: 'Frames',
      belady: 'Belady example',
      progress: (n, total) => `reference ${n}/${total}`,
      rowRef: 'ref',
      rowFrame: (f) => `frame ${f}`,
      rowResult: 'result',
      start: 'Press play or step forward. Frames start empty, so the first references always fault.',
      hit: (r, s) => `Page ${r} is already in frame ${s}: a hit, no disk access needed.`,
      freeFrame: (r, s) => `Page fault on ${r}. A free frame (${s}) is available, so no eviction is needed.`,
      evict: (r, algo, v) =>
        `Page fault on ${r}. All frames are full, so ${algo} evicts page ${v} (${{ FIFO: 'the one loaded earliest', LRU: 'the one used least recently', OPT: 'the one needed furthest in the future' }[algo]}).`,
      faults: 'Faults',
      total: (a) => `${a} total`,
    },
    alloc: {
      title: 'Contiguous memory allocation',
      subtitle: 'Allocate processes into a 100 KB memory, click a process to free it, and watch holes appear.',
      fit: 'Fit strategy',
      size: 'Process size (KB)',
      allocate: (n) => `Allocate ${n}`,
      fragmented: 'Load fragmented example',
      reset: 'Reset',
      blockTitle: (o, s) => `${o}: ${s} KB (click to free)`,
      holeTitle: (s) => `hole: ${s} KB`,
      free: 'free',
      freeTotal: 'Free total',
      largest: 'Largest hole',
      extFrag: 'Ext. frag',
      extFragHint: '1 - largest hole / total free',
      msg: (m) => {
        switch (m.k) {
          case 'fragFail': return `Allocation of ${m.size} KB failed even though ${m.free} KB is free in total: the largest hole is only ${m.largest} KB. That is external fragmentation.`
          case 'noMem': return `Allocation of ${m.size} KB failed: only ${m.free} KB is free.`
          case 'placed': return `${m.name} (${m.size} KB) placed at ${m.at} KB. ${m.holes} hole(s) were big enough; ${fitName(m.strategy)} chose the ${{ first: 'first one', best: 'smallest one', worst: 'largest one' }[m.strategy]}.`
          case 'fragmented': return 'Memory is now fragmented into four holes of 10, 6, 12 and 20 KB. Try placing a 9 KB process with each strategy.'
          case 'freed': return `${m.owner} exited and freed ${m.size} KB. Adjacent holes are merged (coalesced).`
        }
      },
    },
  },
  he: {
    intro: (
      <>
        כל process בטוח שיש לו זיכרון פרטי משלו שמתחיל בכתובת 0. האשליה הזו היא <Term k="virtual">virtual memory</Term>: ה-MMU מתרגם כל כתובת דרך page table,
        ומערכת ההפעלה מעבירה <Term k="page">pages</Term> בין ה-RAM לדיסק לפי הצורך.
      </>
    ),
    keyIdeas: [
      <>
        <strong>כתובת = מספר page + offset.</strong> רק מספר ה-page מתורגם; ה-offset מועתק כמו שהוא.
      </>,
      <>
        <strong>ה-page חסר?</strong> <Term k="pagefault">Page fault</Term> טוען אותו מהדיסק ומפנה קורבן שנבחר לפי מדיניות ההחלפה.
      </>,
      <>
        <strong>הקצאה רציפה</strong> סובלת מ-<Term k="fragmentation">fragmentation חיצונית</Term>; paging נמנע ממנה.
      </>,
    ],
    tr: {
      title: 'תרגום כתובת וירטואלית לכתובת פיזית',
      subtitle: 'הקלידו כתובת וירטואלית (עשרונית או הקסדצימלית עם 0x). לחצו על שורות ב-page table כדי להכניס pages לזיכרון או להוציא אותם.',
      pageSize: 'גודל page',
      addrLabel: (max) => `כתובת וירטואלית (${ltr(`0 - ${max}`)})`,
      pageBits: (n) => `page (${n} ביטים)`,
      offsetBits: (n) => `offset (${n} ביטים)`,
      virtualPages: 'Pages וירטואליים',
      page: (i) => `Page ${i}`,
      tableTitle: 'Page table (לחצו על שורה)',
      cols: ['page', 'frame', 'תקף'],
      rowLabel: (p, f) => `Page ${p}: ${f !== null ? `ב-frame ${f}` : 'לא בזיכרון'}. לחצו Enter כדי ${f !== null ? 'להוציא אותו' : 'להכניס אותו'}.`,
      physicalFrames: 'Frames פיזיים (RAM)',
      frame: (i) => `Frame ${i}`,
      holds: (p) => `מכיל את page ${p}`,
      free: 'פנוי',
      notNumber: 'הזינו מספר אי-שלילי.',
      outOfRange: (a, pages) => `הכתובת ${a} חורגת ממרחב הכתובות של ${pages} pages. ה-MMU מעלה segmentation fault וה-process נהרג.`,
      fault: (p) => (
        <>
          <strong>Page fault!</strong> Page {p} לא נמצא ב-RAM. ה-kernel צריך לטעון אותו מהדיסק.
        </>
      ),
      handle: 'טיפול ב-page fault',
      ok: (p, f, ps, o, phys) => (
        <>
          Page {p} נמצא ב-frame {f}. כתובת פיזית ={' '}
          <bdi dir="ltr">
            {f} x {ps} + {o} = <strong className="font-mono">{phys}</strong>
          </bdi>{' '}
          {`(0x${phys.toString(16)})`}.
        </>
      ),
    },
    rep: {
      title: 'Page replacement',
      subtitle: 'ב-RAM יש רק כמה frames. עברו צעד אחר צעד על מחרוזת ההפניות וראו איזה page מפונה בכל fault.',
      algo: 'אלגוריתם ההחלפה',
      optimal: 'אופטימלי',
      refs: 'מחרוזת הפניות (מספרי pages)',
      frames: 'Frames',
      belady: 'הדוגמה של Belady',
      progress: (n, total) => `הפניה ${n}/${total}`,
      rowRef: 'הפניה',
      rowFrame: (f) => `frame ${f}`,
      rowResult: 'תוצאה',
      start: 'לחצו על הפעלה או על צעד קדימה. ה-frames ריקים בהתחלה, ולכן ההפניות הראשונות תמיד גורמות ל-fault.',
      hit: (r, s) => `Page ${r} כבר נמצא ב-frame ${s}: זה hit, ואין צורך בגישה לדיסק.`,
      freeFrame: (r, s) => `Page fault על ${r}. יש frame פנוי (${s}), ולכן אין צורך לפנות אף page.`,
      evict: (r, algo, v) =>
        `Page fault על ${r}. כל ה-frames מלאים, ולכן ${algo} מפנה את page ${v} (${{ FIFO: 'זה שנטען הכי מוקדם', LRU: 'זה שהשתמשו בו הכי מזמן', OPT: 'זה שיידרש הכי רחוק בעתיד' }[algo]}).`,
      faults: 'Faults',
      total: (a) => `סך הכול ${a}`,
    },
    alloc: {
      title: 'הקצאת זיכרון רציפה',
      subtitle: 'הקצו processes בזיכרון של 100 KB, לחצו על process כדי לשחרר אותו, וראו איך נוצרים חורים.',
      fit: 'אסטרטגיית התאמה',
      size: 'גודל ה-process ‏(KB)',
      allocate: (n) => `הקצאת ${n}`,
      fragmented: 'טעינת דוגמה מפוצלת',
      reset: 'איפוס',
      blockTitle: (o, s) => `${o}: ${s} KB (לחצו כדי לשחרר)`,
      holeTitle: (s) => `חור: ${s} KB`,
      free: 'פנוי',
      freeTotal: 'סך הכול פנוי',
      largest: 'החור הגדול ביותר',
      extFrag: 'Fragmentation חיצונית',
      extFragHint: `${ltr('1 -')} החור הגדול ביותר / סך הכול פנוי`,
      msg: (m) => {
        switch (m.k) {
          case 'fragFail': return `ההקצאה של ${m.size} KB נכשלה, למרות שבסך הכול ${m.free} KB פנויים: החור הגדול ביותר הוא רק ${m.largest} KB. זו fragmentation חיצונית.`
          case 'noMem': return `ההקצאה של ${m.size} KB נכשלה: רק ${m.free} KB פנויים.`
          case 'placed': return `${m.name} (${m.size} KB) הוקצה בכתובת ${m.at} KB. מספר החורים שהיו גדולים מספיק: ${m.holes}; ${fitName(m.strategy)} בחר את ${{ first: 'הראשון', best: 'הקטן ביותר', worst: 'הגדול ביותר' }[m.strategy]}.`
          case 'fragmented': return 'הזיכרון מפוצל עכשיו לארבעה חורים של 10, 6, 12 ו-20 KB. נסו להקצות process של 9 KB עם כל אחת מהאסטרטגיות.'
          case 'freed': return `${m.owner} סיים ושחרר ${m.size} KB. חורים סמוכים מתמזגים (coalescing).`
        }
      },
    },
  },
  ar: {
    intro: (
      <>
        يعتقد كل process أن لديه ذاكرة خاصة به تبدأ من العنوان 0. هذا الوهم هو الـ <Term k="virtual">virtual memory</Term>: يترجم الـ MMU كل عنوان عبر page table،
        وينقل نظام التشغيل الـ <Term k="page">pages</Term> بين الـ RAM والقرص عند الحاجة.
      </>
    ),
    keyIdeas: [
      <>
        <strong>العنوان = رقم الـ page + الـ offset.</strong> يُترجَم رقم الـ page فقط؛ أما الـ offset فيُنسخ كما هو.
      </>,
      <>
        <strong>الـ page مفقود؟</strong> يحمّله <Term k="pagefault">page fault</Term> من القرص، ويُخرج ضحية تختارها سياسة الاستبدال.
      </>,
      <>
        <strong>التخصيص المتصل</strong> يعاني من الـ <Term k="fragmentation">fragmentation الخارجي</Term>؛ والـ paging يتجنبه.
      </>,
    ],
    tr: {
      title: 'ترجمة العنوان الافتراضي إلى عنوان فعلي',
      subtitle: 'اكتب عنوانًا افتراضيًا (عشريًا أو ست عشريًا يبدأ بـ 0x). انقر على صفوف الـ page table لإدخال الـ pages إلى الذاكرة أو إخراجها منها.',
      pageSize: 'حجم الـ page',
      addrLabel: (max) => `العنوان الافتراضي (${ltr(`0 - ${max}`)})`,
      pageBits: (n) => `page (${n} بت)`,
      offsetBits: (n) => `offset (${n} بت)`,
      virtualPages: 'الـ pages الافتراضية',
      page: (i) => `Page ${i}`,
      tableTitle: 'الـ page table (انقر على صف)',
      cols: ['page', 'frame', 'صالح'],
      rowLabel: (p, f) => `Page ${p}: ${f !== null ? `في الـ frame ${f}` : 'ليس في الذاكرة'}. اضغط Enter ${f !== null ? 'لإخراجه' : 'لإدخاله'}.`,
      physicalFrames: 'الـ frames الفعلية (RAM)',
      frame: (i) => `Frame ${i}`,
      holds: (p) => `يحوي page ${p}`,
      free: 'حر',
      notNumber: 'أدخل عددًا غير سالب.',
      outOfRange: (a, pages) => `العنوان ${a} يتجاوز فضاء العناوين المكوَّن من ${pages} pages. يرفع الـ MMU ‏segmentation fault ويُقتل الـ process.`,
      fault: (p) => (
        <>
          <strong>Page fault!</strong> الـ page {p} ليس في الـ RAM. على الـ kernel تحميله من القرص.
        </>
      ),
      handle: 'معالجة الـ page fault',
      ok: (p, f, ps, o, phys) => (
        <>
          الـ page {p} موجود في الـ frame {f}. العنوان الفعلي ={' '}
          <bdi dir="ltr">
            {f} x {ps} + {o} = <strong className="font-mono">{phys}</strong>
          </bdi>{' '}
          {`(0x${phys.toString(16)})`}.
        </>
      ),
    },
    rep: {
      title: 'Page replacement',
      subtitle: 'في الـ RAM عدد قليل من الـ frames. تقدّم خطوة بخطوة عبر سلسلة المراجع وراقب أي page يُخرَج عند كل fault.',
      algo: 'خوارزمية الاستبدال',
      optimal: 'الأمثل',
      refs: 'سلسلة المراجع (أرقام الـ pages)',
      frames: 'Frames',
      belady: 'مثال Belady',
      progress: (n, total) => `المرجع ${n}/${total}`,
      rowRef: 'مرجع',
      rowFrame: (f) => `frame ${f}`,
      rowResult: 'النتيجة',
      start: 'اضغط تشغيل أو خطوة للأمام. تبدأ الـ frames فارغة، لذا تسبب المراجع الأولى دائمًا fault.',
      hit: (r, s) => `الـ page ${r} موجود أصلًا في الـ frame ${s}: هذا hit، ولا حاجة للوصول إلى القرص.`,
      freeFrame: (r, s) => `Page fault عند ${r}. يوجد frame حر (${s})، لذا لا حاجة لإخراج أي page.`,
      evict: (r, algo, v) =>
        `Page fault عند ${r}. كل الـ frames ممتلئة، لذا تُخرج ${algo} الـ page ${v} (${{ FIFO: 'الذي حُمّل أولًا', LRU: 'الذي استُخدم منذ أطول مدة', OPT: 'الذي سيُحتاج إليه في أبعد وقت في المستقبل' }[algo]}).`,
      faults: 'Faults',
      total: (a) => `مجموع ${a}`,
    },
    alloc: {
      title: 'تخصيص الذاكرة المتصل',
      subtitle: 'خصّص processes في ذاكرة حجمها 100 KB، وانقر على process لتحريره، وراقب ظهور الفجوات.',
      fit: 'استراتيجية الملاءمة',
      size: 'حجم الـ process ‏(KB)',
      allocate: (n) => `تخصيص ${n}`,
      fragmented: 'تحميل مثال مجزّأ',
      reset: 'إعادة ضبط',
      blockTitle: (o, s) => `${o}: ${s} KB (انقر للتحرير)`,
      holeTitle: (s) => `فجوة: ${s} KB`,
      free: 'حر',
      freeTotal: 'إجمالي الحر',
      largest: 'أكبر فجوة',
      extFrag: 'Fragmentation خارجي',
      extFragHint: `${ltr('1 -')} أكبر فجوة / إجمالي الحر`,
      msg: (m) => {
        switch (m.k) {
          case 'fragFail': return `فشل تخصيص ${m.size} KB رغم أن ${m.free} KB حرة إجمالًا: أكبر فجوة هي ${m.largest} KB فقط. هذا هو الـ fragmentation الخارجي.`
          case 'noMem': return `فشل تخصيص ${m.size} KB: الحر ${m.free} KB فقط.`
          case 'placed': return `وُضع ${m.name} (${m.size} KB) عند ${m.at} KB. عدد الفجوات الكبيرة بما يكفي: ${m.holes}؛ واختارت ${fitName(m.strategy)} ${{ first: 'أولاها', best: 'أصغرها', worst: 'أكبرها' }[m.strategy]}.`
          case 'fragmented': return 'أصبحت الذاكرة الآن مجزّأة إلى أربع فجوات بأحجام 10 و6 و12 و20 KB. جرّب وضع process بحجم 9 KB بكل استراتيجية.'
          case 'freed': return `انتهى ${m.owner} وحرّر ${m.size} KB. تُدمج الفجوات المتجاورة (coalescing).`
        }
      },
    },
  },
  es: {
    intro: (
      <>
        Cada process cree que tiene su propia memoria privada que empieza en la dirección 0. Esa ilusión es la <Term k="virtual">virtual memory</Term>: la MMU traduce
        cada dirección mediante una page table, y el sistema operativo mueve <Term k="page">pages</Term> entre la RAM y el disco según se necesiten.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Dirección = número de page + offset.</strong> Solo se traduce el número de page; el offset se copia tal cual.
      </>,
      <>
        <strong>¿Falta la page?</strong> Un <Term k="pagefault">page fault</Term> la carga del disco, expulsando una víctima elegida por la política de reemplazo.
      </>,
      <>
        <strong>La asignación contigua</strong> sufre <Term k="fragmentation">fragmentation externa</Term>; el paging la evita.
      </>,
    ],
    tr: {
      title: 'Traducción de direcciones virtuales a físicas',
      subtitle: 'Escribe una dirección virtual (decimal o hexadecimal con 0x). Haz clic en las filas de la page table para meter o sacar pages de la memoria.',
      pageSize: 'Tamaño de page',
      addrLabel: (max) => `Dirección virtual (0 - ${max})`,
      pageBits: (n) => `page (${n} bits)`,
      offsetBits: (n) => `offset (${n} bits)`,
      virtualPages: 'Pages virtuales',
      page: (i) => `Page ${i}`,
      tableTitle: 'Page table (haz clic en una fila)',
      cols: ['page', 'frame', 'válida'],
      rowLabel: (p, f) => `Page ${p}: ${f !== null ? `en el frame ${f}` : 'no está en memoria'}. Pulsa Enter para ${f !== null ? 'sacarla' : 'cargarla'}.`,
      physicalFrames: 'Frames físicos (RAM)',
      frame: (i) => `Frame ${i}`,
      holds: (p) => `contiene la page ${p}`,
      free: 'libre',
      notNumber: 'Introduce un número no negativo.',
      outOfRange: (a, pages) => `La dirección ${a} está fuera del espacio de direcciones de ${pages} pages. La MMU lanza un segmentation fault y el process muere.`,
      fault: (p) => (
        <>
          <strong>¡Page fault!</strong> La page {p} no está en la RAM. El kernel debe cargarla del disco.
        </>
      ),
      handle: 'Atender page fault',
      ok: (p, f, ps, o, phys) => (
        <>
          La page {p} está en el frame {f}. Dirección física = {f} x {ps} + {o} = <strong className="font-mono">{phys}</strong> {`(0x${phys.toString(16)})`}.
        </>
      ),
    },
    rep: {
      title: 'Page replacement',
      subtitle: 'La RAM solo tiene unos pocos frames. Avanza por la cadena de referencias y observa qué page se expulsa en cada fault.',
      algo: 'Algoritmo de reemplazo',
      optimal: 'Óptimo',
      refs: 'Cadena de referencias (números de page)',
      frames: 'Frames',
      belady: 'Ejemplo de Belady',
      progress: (n, total) => `referencia ${n}/${total}`,
      rowRef: 'ref',
      rowFrame: (f) => `frame ${f}`,
      rowResult: 'resultado',
      start: 'Pulsa reproducir o paso adelante. Los frames empiezan vacíos, así que las primeras referencias siempre provocan fault.',
      hit: (r, s) => `La page ${r} ya está en el frame ${s}: es un hit, no hace falta acceder al disco.`,
      freeFrame: (r, s) => `Page fault en ${r}. Hay un frame libre (${s}), así que no hace falta expulsar nada.`,
      evict: (r, algo, v) =>
        `Page fault en ${r}. Todos los frames están llenos, así que ${algo} expulsa la page ${v} (${{ FIFO: 'la que se cargó primero', LRU: 'la que se usó hace más tiempo', OPT: 'la que se necesitará más tarde en el futuro' }[algo]}).`,
      faults: 'Faults',
      total: (a) => `Total ${a}`,
    },
    alloc: {
      title: 'Asignación contigua de memoria',
      subtitle: 'Asigna processes en una memoria de 100 KB, haz clic en un process para liberarlo y observa cómo aparecen huecos.',
      fit: 'Estrategia de ajuste',
      size: 'Tamaño del process (KB)',
      allocate: (n) => `Asignar ${n}`,
      fragmented: 'Cargar ejemplo fragmentado',
      reset: 'Reiniciar',
      blockTitle: (o, s) => `${o}: ${s} KB (haz clic para liberar)`,
      holeTitle: (s) => `hueco: ${s} KB`,
      free: 'libre',
      freeTotal: 'Total libre',
      largest: 'Hueco más grande',
      extFrag: 'Frag. externa',
      extFragHint: '1 - hueco más grande / total libre',
      msg: (m) => {
        switch (m.k) {
          case 'fragFail': return `La asignación de ${m.size} KB falló aunque hay ${m.free} KB libres en total: el hueco más grande es de solo ${m.largest} KB. Eso es fragmentation externa.`
          case 'noMem': return `La asignación de ${m.size} KB falló: solo hay ${m.free} KB libres.`
          case 'placed': return `${m.name} (${m.size} KB) se colocó en ${m.at} KB. ${m.holes} hueco(s) eran lo bastante grandes; ${fitName(m.strategy)} eligió ${{ first: 'el primero', best: 'el más pequeño', worst: 'el más grande' }[m.strategy]}.`
          case 'fragmented': return 'La memoria está ahora fragmentada en cuatro huecos de 10, 6, 12 y 20 KB. Prueba a colocar un process de 9 KB con cada estrategia.'
          case 'freed': return `${m.owner} terminó y liberó ${m.size} KB. Los huecos adyacentes se fusionan (coalescing).`
        }
      },
    },
  },
}
