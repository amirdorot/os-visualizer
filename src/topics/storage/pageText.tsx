import type { ReactNode } from 'react'
import { Term } from '../../components/Term'
import type { DiskAlgo, FsMsg } from '../../engines/storage'
import { ltr, type Localized } from '../../i18n'

type Row = [method: string, stores: string, sequential: string, random: string, grow: string, fragmentation: string]

interface StorageText {
  intro: ReactNode
  keyIdeas: ReactNode[]
  explorerTitle: string
  explorerSubtitle: string
  methodLabel: string
  dirTree: string
  inDir: string
  name: string
  size: (n: number) => string
  newFile: string
  newFolder: string
  append: string
  deleteFolder: string
  deleteFile: string
  diskBlocks: string
  used: (used: number, total: number) => string
  blockFree: (b: number) => string
  blockSuperblock: (b: number) => string
  blockInodeTable: (b: number) => string
  blockOwner: (b: number, name: string) => string
  end: string
  blocksLegend: string
  inodeTitle: (id: number | string) => string
  rows: { path: string; type: string; size: string; startLength: string; firstBlock: string; indexBlock: string; dataBlocks: string; entries: string }
  types: { file: string; dir: string }
  sizeValue: (blocks: number) => string
  empty: string
  selectHint: string
  bitmapTitle: string
  bitmapLegend: string
  msg: (m: FsMsg) => string
  compareTitle: string
  compareSubtitle: string
  compareHeaders: Row
  compareRows: [Row, Row, Row]
  compareNote: ReactNode
  diskTitle: string
  diskSubtitle: string
  algoLabel: string
  queueLabel: (max: number) => string
  headStart: string
  direction: string
  toward199: string
  toward0: string
  randomRequests: string
  moved: (n: number) => string
  pathLabel: (path: number[]) => string
  start: string
  edge: string
  total: (algo: string) => string
  cylinders: (n: number) => string
  algoNotes: Record<DiskAlgo, string>
  compareMovement: string
}

export const storageText: Localized<StorageText> = {
  en: {
    intro: (
      <>
        A disk is just a long array of numbered <Term k="block">blocks</Term>. The file system builds files and folders on top of it:{' '}
        <Term k="inode">inodes</Term> describe files, directories map names to inodes, and a <Term k="bitmap">free-block bitmap</Term> tracks which blocks are in
        use.
      </>
    ),
    keyIdeas: [
      <>
        <strong>Allocation method</strong> decides which blocks a file gets: contiguous, linked chain, or an index block of pointers.
      </>,
      <>
        <strong>Deleting a file</strong> only frees its inode and blocks; the bytes stay on disk until reused.
      </>,
      <>
        <strong>Disk scheduling</strong> reorders pending requests to cut <Term k="seek">seek time</Term> on spinning disks.
      </>,
    ],
    explorerTitle: 'File system explorer',
    explorerSubtitle: 'Create, grow and delete files and watch the inodes, directory tree, disk blocks and bitmap change together.',
    methodLabel: 'Allocation method',
    dirTree: 'Directory tree',
    inDir: 'In',
    name: 'Name',
    size: (n) => `Size: ${n} block(s)`,
    newFile: 'New file',
    newFolder: 'New folder',
    append: 'Append a block',
    deleteFolder: 'Delete folder',
    deleteFile: 'Delete file',
    diskBlocks: 'Disk blocks',
    used: (u, n) => `${u}/${n} used`,
    blockFree: (b) => `block ${b}: free`,
    blockSuperblock: (b) => `block ${b}: superblock`,
    blockInodeTable: (b) => `block ${b}: inode table`,
    blockOwner: (b, name) => `block ${b}: ${name}`,
    end: 'end',
    blocksLegend: 'SB = superblock, IT = inode table. Click a block to select its file.',
    inodeTitle: (id) => `Inode ${id}`,
    rows: { path: 'path', type: 'type', size: 'size', startLength: 'start, length', firstBlock: 'first block', indexBlock: 'index block', dataBlocks: 'data blocks', entries: 'entries' },
    types: { file: 'file', dir: 'dir' },
    sizeValue: (n) => `${n} blocks (${n * 4} KiB)`,
    empty: '(empty)',
    selectHint: 'Select a file or folder.',
    bitmapTitle: 'Free-block bitmap',
    bitmapLegend: '1 = used, 0 = free. The allocator scans this to find space.',
    msg: (m) => {
      switch (m.k) {
        case 'emptyName': return 'Name cannot be empty.'
        case 'exists': return `"${m.name}" already exists here.`
        case 'mkdir': return `Created directory ${m.path} (inode ${m.inode}). A directory is a list of name -> inode entries.`
        case 'noRun': return `No run of ${m.size} consecutive free blocks.`
        case 'fragmented': return `No run of ${m.size} consecutive free blocks (even though ${m.free} blocks are free: external fragmentation).`
        case 'diskFull': return `Disk full: need ${m.need} blocks, ${m.free} free.`
        case 'indexLimit': return `An index block in this demo holds at most ${m.max} pointers.`
        case 'diskFullIndexed': return `Disk full: need ${m.need} data blocks plus 1 index block.`
        case 'created': {
          const detail =
            m.method === 'contiguous'
              ? `blocks ${m.blocks[0]}-${m.blocks.at(-1)}`
              : m.method === 'linked'
                ? `a chain starting at block ${m.blocks[0]}`
                : `index block ${m.indexBlock} pointing to [${m.blocks.join(', ')}]`
          return `Created ${m.path}: inode ${m.inode}, ${detail}. The free-block bitmap was updated.`
        }
        case 'selectFile': return 'Select a file first.'
        case 'cannotGrow': return `Cannot grow ${m.name} in place: block ${m.block} is not free. Contiguous files must be moved to a larger hole to grow.`
        case 'full': return 'Disk full.'
        case 'indexFull': return `The index block is full (${m.max} pointers). Real file systems add indirect blocks.`
        case 'appended': return `Wrote one more block to ${m.name}: block ${m.block}.`
        case 'deleteRoot': return 'Cannot delete the root directory.'
        case 'deleted': return `Deleted ${m.path}. Its directory entry and inode were removed and ${m.freed} block(s) marked free. (The data itself is not erased!)`
      }
    },
    compareTitle: 'Allocation methods compared',
    compareSubtitle: 'Switch the method in the explorer above and try growing a file to feel the difference.',
    compareHeaders: ['Method', 'Inode stores', 'Sequential read', 'Random access', 'Growing a file', 'Fragmentation'],
    compareRows: [
      ['Contiguous', 'start block + length', 'Excellent', 'Excellent', 'Hard: next block may be taken', 'Yes (external)'],
      ['Linked', 'first block; each block points to the next', 'Good', 'Poor: must follow the chain', 'Easy', 'No'],
      ['Indexed', 'an index block listing all data blocks', 'Good', 'Good: one lookup', 'Easy until the index fills', 'No'],
    ],
    compareNote: (
      <>
        Real systems mix these ideas: ext4 uses <em>extents</em> (contiguous runs) described by an index tree, and classic Unix inodes have direct pointers plus
        single, double and triple indirect blocks.
      </>
    ),
    diskTitle: 'Disk scheduling',
    diskSubtitle: 'The disk head must visit every pending cylinder. Different orders mean very different amounts of head movement.',
    algoLabel: 'Disk scheduling algorithm',
    queueLabel: (max) => `Request queue (cylinders 0-${max})`,
    headStart: 'Head starts at',
    direction: 'Initial direction',
    toward199: 'Toward 199',
    toward0: 'Toward 0',
    randomRequests: 'Random requests',
    moved: (n) => `head movement: ${n} cylinders`,
    pathLabel: (path) => `Disk head path: ${path.join(' to ')}`,
    start: ' (start)',
    edge: ' (edge)',
    total: (algo) => `${algo} total`,
    cylinders: (n) => `${n} cylinders`,
    algoNotes: {
      FCFS: 'Serves requests in arrival order. Fair, but the head zig-zags wildly.',
      SSTF: 'Always goes to the closest pending request. Much less movement, but far-away requests can starve.',
      SCAN: 'The elevator algorithm: sweep in one direction to the edge, then reverse. Predictable waits.',
      CSCAN: 'Sweep up to the edge, jump back to cylinder 0 and sweep up again. More uniform wait times than SCAN.',
    },
    compareMovement: 'Compare total head movement',
  },
  he: {
    intro: (
      <>
        דיסק הוא בסך הכול מערך ארוך של <Term k="block">blocks</Term> ממוספרים. מערכת הקבצים בונה מעליו קבצים ותיקיות: <Term k="inode">inodes</Term> מתארים
        קבצים, תיקיות ממפות שמות ל-inodes, ו-<Term k="bitmap">bitmap של blocks פנויים</Term> עוקב אחרי ה-blocks שבשימוש.
      </>
    ),
    keyIdeas: [
      <>
        <strong>שיטת ההקצאה</strong> קובעת אילו blocks יקבל קובץ: רצף אחד (contiguous), שרשרת (linked) או index block של מצביעים (indexed).
      </>,
      <>
        <strong>מחיקת קובץ</strong> רק משחררת את ה-inode וה-blocks שלו; הבתים נשארים בדיסק עד שמשתמשים בהם מחדש.
      </>,
      <>
        <strong>תזמון דיסק</strong> מסדר מחדש את הבקשות הממתינות כדי לקצר את <Term k="seek">זמן ה-seek</Term> בדיסקים מסתובבים.
      </>,
    ],
    explorerTitle: 'סייר מערכת הקבצים',
    explorerSubtitle: 'צרו קבצים, הגדילו ומחקו אותם, וראו איך ה-inodes, עץ התיקיות, ה-blocks בדיסק וה-bitmap משתנים יחד.',
    methodLabel: 'שיטת הקצאה',
    dirTree: 'עץ התיקיות',
    inDir: 'בתוך',
    name: 'שם',
    size: (n) => `גודל: ${n} blocks`,
    newFile: 'קובץ חדש',
    newFolder: 'תיקייה חדשה',
    append: 'הוספת block',
    deleteFolder: 'מחיקת התיקייה',
    deleteFile: 'מחיקת הקובץ',
    diskBlocks: 'ה-blocks בדיסק',
    used: (u, n) => `${ltr(`${u}/${n}`)} בשימוש`,
    blockFree: (b) => `block ${b}: פנוי`,
    blockSuperblock: (b) => `block ${b}: superblock`,
    blockInodeTable: (b) => `block ${b}: טבלת ה-inodes`,
    blockOwner: (b, name) => `block ${b}: ${name}`,
    end: 'סוף',
    blocksLegend: 'SB = superblock, IT = טבלת ה-inodes. לחצו על block כדי לבחור את הקובץ שלו.',
    inodeTitle: (id) => `Inode ${id}`,
    rows: { path: 'נתיב', type: 'סוג', size: 'גודל', startLength: 'התחלה, אורך', firstBlock: 'block ראשון', indexBlock: 'index block', dataBlocks: 'blocks של נתונים', entries: 'רשומות' },
    types: { file: 'קובץ', dir: 'תיקייה' },
    sizeValue: (n) => `${n} blocks (${n * 4} KiB)`,
    empty: '(ריקה)',
    selectHint: 'בחרו קובץ או תיקייה.',
    bitmapTitle: 'Bitmap של blocks פנויים',
    bitmapLegend: '1 = בשימוש, 0 = פנוי. ה-allocator סורק אותו כדי למצוא מקום.',
    msg: (m) => {
      switch (m.k) {
        case 'emptyName': return 'השם לא יכול להיות ריק.'
        case 'exists': return `"${m.name}" כבר קיים כאן.`
        case 'mkdir': return `נוצרה התיקייה ${ltr(m.path)} (inode ${m.inode}). תיקייה היא רשימה של רשומות ${ltr('name -> inode')}.`
        case 'noRun': return `אין רצף של ${m.size} blocks פנויים ברצף.`
        case 'fragmented': return `אין רצף של ${m.size} blocks פנויים ברצף (אף על פי ש-${m.free} blocks פנויים: external fragmentation).`
        case 'diskFull': return `הדיסק מלא: צריך ${m.need} blocks, ופנויים ${m.free}.`
        case 'indexLimit': return `index block בהדגמה הזו מחזיק לכל היותר ${m.max} מצביעים.`
        case 'diskFullIndexed': return `הדיסק מלא: צריך ${m.need} blocks של נתונים ועוד index block אחד.`
        case 'created': {
          const detail =
            m.method === 'contiguous'
              ? `blocks ${ltr(`${m.blocks[0]}-${m.blocks.at(-1)}`)}`
              : m.method === 'linked'
                ? `שרשרת שמתחילה ב-block ${m.blocks[0]}`
                : `index block ${m.indexBlock} שמצביע על ${ltr(`[${m.blocks.join(', ')}]`)}`
          return `נוצר ${ltr(m.path)}: inode ${m.inode}, ${detail}. ה-bitmap של ה-blocks הפנויים עודכן.`
        }
        case 'selectFile': return 'קודם בחרו קובץ.'
        case 'cannotGrow': return `אי אפשר להגדיל את ${m.name} במקום: block ${m.block} לא פנוי. כדי להגדיל קובץ contiguous צריך להעביר אותו לחור גדול יותר.`
        case 'full': return 'הדיסק מלא.'
        case 'indexFull': return `ה-index block מלא (${m.max} מצביעים). מערכות קבצים אמיתיות מוסיפות indirect blocks.`
        case 'appended': return `נכתב עוד block לקובץ ${m.name}: block ${m.block}.`
        case 'deleteRoot': return 'אי אפשר למחוק את תיקיית השורש.'
        case 'deleted': return `${ltr(m.path)} נמחק. רשומת התיקייה וה-inode שלו הוסרו, ו-${m.freed} blocks סומנו כפנויים. (הנתונים עצמם לא נמחקו!)`
      }
    },
    compareTitle: 'השוואה בין שיטות ההקצאה',
    compareSubtitle: 'החליפו את השיטה בסייר שלמעלה ונסו להגדיל קובץ כדי להרגיש את ההבדל.',
    compareHeaders: ['שיטה', 'מה ה-inode שומר', 'קריאה סדרתית', 'גישה אקראית', 'הגדלת קובץ', 'Fragmentation'],
    compareRows: [
      ['Contiguous', 'block התחלה + אורך', 'מצוינת', 'מצוינת', 'קשה: ה-block הבא עלול להיות תפוס', 'כן (external)'],
      ['Linked', 'block ראשון; כל block מצביע על הבא', 'טובה', 'גרועה: צריך לעקוב אחרי השרשרת', 'קלה', 'לא'],
      ['Indexed', 'index block שמפרט את כל ה-blocks של הנתונים', 'טובה', 'טובה: חיפוש אחד', 'קלה עד שה-index מתמלא', 'לא'],
    ],
    compareNote: (
      <>
        מערכות אמיתיות משלבות את הרעיונות האלה: ext4 משתמשת ב-<em>extents</em> (רצפים של blocks) שמתוארים בעץ index, וב-inodes הקלאסיים של Unix יש מצביעים
        ישירים ועוד indirect blocks ברמה אחת, שתיים ושלוש.
      </>
    ),
    diskTitle: 'תזמון דיסק',
    diskSubtitle: 'ראש הדיסק חייב לבקר בכל cylinder שממתין. סדרים שונים פירושם כמויות שונות מאוד של תנועת ראש.',
    algoLabel: 'אלגוריתם תזמון הדיסק',
    queueLabel: (max) => `תור הבקשות (cylinders ${ltr(`0-${max}`)})`,
    headStart: 'מיקום ההתחלה של הראש',
    direction: 'כיוון התחלתי',
    toward199: 'לכיוון 199',
    toward0: 'לכיוון 0',
    randomRequests: 'בקשות אקראיות',
    moved: (n) => `תנועת הראש: ${n} cylinders`,
    pathLabel: (path) => `מסלול ראש הדיסק: ${ltr(path.join(' -> '))}`,
    start: ' (התחלה)',
    edge: ' (קצה)',
    total: (algo) => `סך הכול ב-${algo}`,
    cylinders: (n) => `${n} cylinders`,
    algoNotes: {
      FCFS: 'משרת את הבקשות לפי סדר ההגעה. הוגן, אבל הראש קופץ הלוך ושוב בפראות.',
      SSTF: 'תמיד עובר לבקשה הממתינה הקרובה ביותר. הרבה פחות תנועה, אבל בקשות רחוקות עלולות להיתקע (starvation).',
      SCAN: 'אלגוריתם המעלית: סורק בכיוון אחד עד הקצה ואז מתהפך. זמני המתנה צפויים.',
      CSCAN: 'סורק למעלה עד הקצה, קופץ חזרה ל-cylinder 0 וסורק שוב למעלה. זמני המתנה אחידים יותר מאשר ב-SCAN.',
    },
    compareMovement: 'השוואת תנועת הראש הכוללת',
  },
  ar: {
    intro: (
      <>
        القرص ليس إلا مصفوفة طويلة من الـ <Term k="block">blocks</Term> المرقّمة. يبني نظام الملفات فوقه الملفات والمجلدات: تصف الـ{' '}
        <Term k="inode">inodes</Term> الملفات، وتربط المجلدات الأسماء بالـ inodes، ويتتبّع <Term k="bitmap">bitmap الـ blocks الحرة</Term> الـ blocks
        المستخدمة.
      </>
    ),
    keyIdeas: [
      <>
        <strong>طريقة التخصيص</strong> تحدد الـ blocks التي يحصل عليها الملف: تسلسل واحد (contiguous)، أو سلسلة (linked)، أو index block من المؤشرات
        (indexed).
      </>,
      <>
        <strong>حذف الملف</strong> يحرر الـ inode والـ blocks الخاصة به فقط، وتبقى البايتات على القرص حتى يُعاد استخدامها.
      </>,
      <>
        <strong>جدولة القرص</strong> تعيد ترتيب الطلبات المنتظرة لتقليل <Term k="seek">زمن الـ seek</Term> في الأقراص الدوّارة.
      </>,
    ],
    explorerTitle: 'مستكشف نظام الملفات',
    explorerSubtitle: 'أنشئ الملفات وكبّرها واحذفها، وراقب كيف تتغير الـ inodes وشجرة المجلدات والـ blocks على القرص والـ bitmap معًا.',
    methodLabel: 'طريقة التخصيص',
    dirTree: 'شجرة المجلدات',
    inDir: 'في',
    name: 'الاسم',
    size: (n) => `الحجم: ${n} blocks`,
    newFile: 'ملف جديد',
    newFolder: 'مجلد جديد',
    append: 'إضافة block',
    deleteFolder: 'حذف المجلد',
    deleteFile: 'حذف الملف',
    diskBlocks: 'الـ blocks على القرص',
    used: (u, n) => `${ltr(`${u}/${n}`)} مستخدمة`,
    blockFree: (b) => `block ${b}: حر`,
    blockSuperblock: (b) => `block ${b}: superblock`,
    blockInodeTable: (b) => `block ${b}: جدول الـ inodes`,
    blockOwner: (b, name) => `block ${b}: ${name}`,
    end: 'نهاية',
    blocksLegend: 'SB = superblock، IT = جدول الـ inodes. انقر على block لتحديد الملف الخاص به.',
    inodeTitle: (id) => `Inode ${id}`,
    rows: { path: 'المسار', type: 'النوع', size: 'الحجم', startLength: 'البداية، الطول', firstBlock: 'أول block', indexBlock: 'index block', dataBlocks: 'blocks البيانات', entries: 'المُدخلات' },
    types: { file: 'ملف', dir: 'مجلد' },
    sizeValue: (n) => `${n} blocks (${n * 4} KiB)`,
    empty: '(فارغ)',
    selectHint: 'اختر ملفًا أو مجلدًا.',
    bitmapTitle: 'Bitmap الـ blocks الحرة',
    bitmapLegend: '1 = مستخدم، 0 = حر. يفحصه الـ allocator ليجد مساحة.',
    msg: (m) => {
      switch (m.k) {
        case 'emptyName': return 'لا يمكن أن يكون الاسم فارغًا.'
        case 'exists': return `"${m.name}" موجود هنا بالفعل.`
        case 'mkdir': return `أُنشئ المجلد ${ltr(m.path)} (inode ${m.inode}). المجلد قائمة من المُدخلات ${ltr('name -> inode')}.`
        case 'noRun': return `لا يوجد تسلسل من ${m.size} blocks حرة متتالية.`
        case 'fragmented': return `لا يوجد تسلسل من ${m.size} blocks حرة متتالية (مع أن ${m.free} blocks حرة: external fragmentation).`
        case 'diskFull': return `القرص ممتلئ: المطلوب ${m.need} blocks، والحر ${m.free}.`
        case 'indexLimit': return `الـ index block في هذا العرض يحمل ${m.max} مؤشرات على الأكثر.`
        case 'diskFullIndexed': return `القرص ممتلئ: المطلوب ${m.need} blocks بيانات بالإضافة إلى index block واحد.`
        case 'created': {
          const detail =
            m.method === 'contiguous'
              ? `الـ blocks ${ltr(`${m.blocks[0]}-${m.blocks.at(-1)}`)}`
              : m.method === 'linked'
                ? `سلسلة تبدأ عند الـ block رقم ${m.blocks[0]}`
                : `الـ index block رقم ${m.indexBlock} الذي يشير إلى ${ltr(`[${m.blocks.join(', ')}]`)}`
          return `أُنشئ ${ltr(m.path)}: الـ inode رقم ${m.inode}، ${detail}. حُدّث الـ bitmap الخاص بالـ blocks الحرة.`
        }
        case 'selectFile': return 'اختر ملفًا أولًا.'
        case 'cannotGrow': return `لا يمكن تكبير ${m.name} في مكانه: الـ block رقم ${m.block} غير حر. لتكبير ملف contiguous يجب نقله إلى فجوة أكبر.`
        case 'full': return 'القرص ممتلئ.'
        case 'indexFull': return `الـ index block ممتلئ (${m.max} مؤشرات). تضيف أنظمة الملفات الحقيقية indirect blocks.`
        case 'appended': return `كُتب block إضافي في ${m.name}: الـ block رقم ${m.block}.`
        case 'deleteRoot': return 'لا يمكن حذف المجلد الجذر.'
        case 'deleted': return `حُذف ${ltr(m.path)}. أُزيل مُدخل المجلد والـ inode الخاص به، وعُلّمت ${m.freed} blocks على أنها حرة. (البيانات نفسها لم تُمسح!)`
      }
    },
    compareTitle: 'مقارنة طرق التخصيص',
    compareSubtitle: 'غيّر الطريقة في المستكشف أعلاه وحاول تكبير ملف لتلمس الفرق.',
    compareHeaders: ['الطريقة', 'ما يخزنه الـ inode', 'القراءة التسلسلية', 'الوصول العشوائي', 'تكبير الملف', 'Fragmentation'],
    compareRows: [
      ['Contiguous', 'block البداية + الطول', 'ممتازة', 'ممتاز', 'صعب: قد يكون الـ block التالي مشغولًا', 'نعم (external)'],
      ['Linked', 'أول block، وكل block يشير إلى التالي', 'جيدة', 'ضعيف: يجب تتبع السلسلة', 'سهل', 'لا'],
      ['Indexed', 'index block يسرد كل blocks البيانات', 'جيدة', 'جيد: بحث واحد', 'سهل حتى يمتلئ الـ index', 'لا'],
    ],
    compareNote: (
      <>
        تمزج الأنظمة الحقيقية بين هذه الأفكار: يستخدم ext4 الـ <em>extents</em> (تسلسلات متصلة من الـ blocks) موصوفة بشجرة index، وفي الـ inodes الكلاسيكية في Unix
        مؤشرات مباشرة بالإضافة إلى indirect blocks أحادية وثنائية وثلاثية.
      </>
    ),
    diskTitle: 'جدولة القرص',
    diskSubtitle: 'يجب أن يزور رأس القرص كل cylinder منتظر. الترتيبات المختلفة تعني مقادير مختلفة جدًا من حركة الرأس.',
    algoLabel: 'خوارزمية جدولة القرص',
    queueLabel: (max) => `طابور الطلبات (الـ cylinders ${ltr(`0-${max}`)})`,
    headStart: 'موضع بداية الرأس',
    direction: 'الاتجاه الأولي',
    toward199: 'نحو 199',
    toward0: 'نحو 0',
    randomRequests: 'طلبات عشوائية',
    moved: (n) => `حركة الرأس: ${n} cylinders`,
    pathLabel: (path) => `مسار رأس القرص: ${ltr(path.join(' -> '))}`,
    start: ' (البداية)',
    edge: ' (الحافة)',
    total: (algo) => `الإجمالي في ${algo}`,
    cylinders: (n) => `${n} cylinders`,
    algoNotes: {
      FCFS: 'يخدم الطلبات بترتيب وصولها. عادل، لكن الرأس يتنقل ذهابًا وإيابًا بعنف.',
      SSTF: 'ينتقل دائمًا إلى أقرب طلب منتظر. حركة أقل بكثير، لكن الطلبات البعيدة قد تعاني من الـ starvation.',
      SCAN: 'خوارزمية المصعد: يمسح في اتجاه واحد حتى الحافة ثم ينعكس. أزمنة انتظار يمكن توقعها.',
      CSCAN: 'يمسح صعودًا حتى الحافة، ثم يقفز عائدًا إلى الـ cylinder رقم 0 ويمسح صعودًا من جديد. أزمنة انتظار أكثر تجانسًا من SCAN.',
    },
    compareMovement: 'مقارنة إجمالي حركة الرأس',
  },
  es: {
    intro: (
      <>
        Un disco no es más que un largo array de <Term k="block">blocks</Term> numerados. El sistema de archivos construye encima archivos y carpetas: los{' '}
        <Term k="inode">inodes</Term> describen archivos, los directorios asocian nombres con inodes y un <Term k="bitmap">bitmap de blocks libres</Term> registra
        qué blocks están en uso.
      </>
    ),
    keyIdeas: [
      <>
        <strong>El método de asignación</strong> decide qué blocks recibe un archivo: un tramo contiguo (contiguous), una cadena (linked) o un index block de
        punteros (indexed).
      </>,
      <>
        <strong>Borrar un archivo</strong> solo libera su inode y sus blocks; los bytes siguen en el disco hasta que se reutilizan.
      </>,
      <>
        <strong>La planificación de disco</strong> reordena las peticiones pendientes para reducir el <Term k="seek">tiempo de seek</Term> en discos giratorios.
      </>,
    ],
    explorerTitle: 'Explorador del sistema de archivos',
    explorerSubtitle: 'Crea, haz crecer y borra archivos y observa cómo cambian a la vez los inodes, el árbol de directorios, los blocks del disco y el bitmap.',
    methodLabel: 'Método de asignación',
    dirTree: 'Árbol de directorios',
    inDir: 'En',
    name: 'Nombre',
    size: (n) => `Tamaño: ${n} block(s)`,
    newFile: 'Nuevo archivo',
    newFolder: 'Nueva carpeta',
    append: 'Añadir un block',
    deleteFolder: 'Borrar carpeta',
    deleteFile: 'Borrar archivo',
    diskBlocks: 'Blocks del disco',
    used: (u, n) => `${u}/${n} en uso`,
    blockFree: (b) => `block ${b}: libre`,
    blockSuperblock: (b) => `block ${b}: superblock`,
    blockInodeTable: (b) => `block ${b}: tabla de inodes`,
    blockOwner: (b, name) => `block ${b}: ${name}`,
    end: 'fin',
    blocksLegend: 'SB = superblock, IT = tabla de inodes. Haz clic en un block para seleccionar su archivo.',
    inodeTitle: (id) => `Inode ${id}`,
    rows: { path: 'ruta', type: 'tipo', size: 'tamaño', startLength: 'inicio, longitud', firstBlock: 'primer block', indexBlock: 'index block', dataBlocks: 'blocks de datos', entries: 'entradas' },
    types: { file: 'archivo', dir: 'directorio' },
    sizeValue: (n) => `${n} blocks (${n * 4} KiB)`,
    empty: '(vacío)',
    selectHint: 'Selecciona un archivo o una carpeta.',
    bitmapTitle: 'Bitmap de blocks libres',
    bitmapLegend: '1 = en uso, 0 = libre. El allocator lo recorre para encontrar espacio.',
    msg: (m) => {
      switch (m.k) {
        case 'emptyName': return 'El nombre no puede estar vacío.'
        case 'exists': return `"${m.name}" ya existe aquí.`
        case 'mkdir': return `Se creó el directorio ${m.path} (inode ${m.inode}). Un directorio es una lista de entradas name -> inode.`
        case 'noRun': return `No hay un tramo de ${m.size} blocks libres consecutivos.`
        case 'fragmented': return `No hay un tramo de ${m.size} blocks libres consecutivos (aunque hay ${m.free} blocks libres: external fragmentation).`
        case 'diskFull': return `Disco lleno: se necesitan ${m.need} blocks y hay ${m.free} libres.`
        case 'indexLimit': return `En esta demostración un index block guarda como máximo ${m.max} punteros.`
        case 'diskFullIndexed': return `Disco lleno: se necesitan ${m.need} blocks de datos más 1 index block.`
        case 'created': {
          const detail =
            m.method === 'contiguous'
              ? `blocks ${m.blocks[0]}-${m.blocks.at(-1)}`
              : m.method === 'linked'
                ? `una cadena que empieza en el block ${m.blocks[0]}`
                : `index block ${m.indexBlock} que apunta a [${m.blocks.join(', ')}]`
          return `Se creó ${m.path}: inode ${m.inode}, ${detail}. Se actualizó el bitmap de blocks libres.`
        }
        case 'selectFile': return 'Primero selecciona un archivo.'
        case 'cannotGrow': return `No se puede hacer crecer ${m.name} en su sitio: el block ${m.block} no está libre. Para crecer, un archivo contiguous debe moverse a un hueco más grande.`
        case 'full': return 'Disco lleno.'
        case 'indexFull': return `El index block está lleno (${m.max} punteros). Los sistemas de archivos reales añaden indirect blocks.`
        case 'appended': return `Se escribió un block más en ${m.name}: el block ${m.block}.`
        case 'deleteRoot': return 'No se puede borrar el directorio raíz.'
        case 'deleted': return `Se borró ${m.path}. Se eliminaron su entrada de directorio y su inode, y ${m.freed} block(s) se marcaron como libres. (¡Los datos en sí no se borran!)`
      }
    },
    compareTitle: 'Comparación de métodos de asignación',
    compareSubtitle: 'Cambia el método en el explorador de arriba e intenta hacer crecer un archivo para notar la diferencia.',
    compareHeaders: ['Método', 'Qué guarda el inode', 'Lectura secuencial', 'Acceso aleatorio', 'Hacer crecer un archivo', 'Fragmentation'],
    compareRows: [
      ['Contiguous', 'block inicial + longitud', 'Excelente', 'Excelente', 'Difícil: el block siguiente puede estar ocupado', 'Sí (external)'],
      ['Linked', 'primer block; cada block apunta al siguiente', 'Buena', 'Malo: hay que seguir la cadena', 'Fácil', 'No'],
      ['Indexed', 'un index block con todos los blocks de datos', 'Buena', 'Bueno: una consulta', 'Fácil hasta que se llena el index', 'No'],
    ],
    compareNote: (
      <>
        Los sistemas reales combinan estas ideas: ext4 usa <em>extents</em> (tramos contiguos) descritos por un árbol de índices, y los inodes clásicos de Unix tienen
        punteros directos más indirect blocks simples, dobles y triples.
      </>
    ),
    diskTitle: 'Planificación de disco',
    diskSubtitle: 'El cabezal del disco debe visitar cada cylinder pendiente. Distintos órdenes suponen cantidades muy distintas de movimiento del cabezal.',
    algoLabel: 'Algoritmo de planificación de disco',
    queueLabel: (max) => `Cola de peticiones (cylinders 0-${max})`,
    headStart: 'El cabezal empieza en',
    direction: 'Dirección inicial',
    toward199: 'Hacia 199',
    toward0: 'Hacia 0',
    randomRequests: 'Peticiones aleatorias',
    moved: (n) => `movimiento del cabezal: ${n} cylinders`,
    pathLabel: (path) => `Recorrido del cabezal: ${path.join(' -> ')}`,
    start: ' (inicio)',
    edge: ' (borde)',
    total: (algo) => `Total de ${algo}`,
    cylinders: (n) => `${n} cylinders`,
    algoNotes: {
      FCFS: 'Atiende las peticiones en orden de llegada. Es justo, pero el cabezal zigzaguea sin control.',
      SSTF: 'Siempre va a la petición pendiente más cercana. Mucho menos movimiento, pero las peticiones lejanas pueden sufrir starvation.',
      SCAN: 'El algoritmo del ascensor: barre en una dirección hasta el borde y luego se da la vuelta. Esperas predecibles.',
      CSCAN: 'Barre hacia arriba hasta el borde, salta de vuelta al cylinder 0 y vuelve a barrer hacia arriba. Tiempos de espera más uniformes que SCAN.',
    },
    compareMovement: 'Comparar el movimiento total del cabezal',
  },
}
