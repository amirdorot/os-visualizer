import type { DiskAlgo } from '../../engines/storage'
import { ltr, type Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

export const storageQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'sto-inode-name': {
      prompt: 'איפה נשמר שם הקובץ במערכת קבצים בסגנון Unix?',
      options: ['ב-inode', 'ברשומת התיקייה שמצביעה על ה-inode', 'ב-superblock', 'ב-block הנתונים הראשון'],
      explanation: 'ה-inodes מחזיקים מטא-נתונים ומצביעים ל-blocks, אבל לא את השם. תיקיות ממפות שמות למספרי inode, ולכן ל-inode אחד יכולים להיות כמה שמות (hard links).',
    },
    'sto-linked-random': {
      prompt: 'איזו שיטת הקצאה הופכת גישה אקראית (למשל קריאה של block 900 בקובץ) לאיטית ביותר?',
      options: ['Contiguous', 'Linked', 'Indexed', 'כולן שוות'],
      explanation: 'ב-linked allocation צריך לעקוב אחרי 899 מצביעי next, וכל אחד מהם הוא קריאה מהדיסק. ב-contiguous מחשבים את הכתובת ישירות, וב-indexed מחפשים אותה ב-index block.',
    },
    'sto-contig-grow': {
      prompt: 'מהי הבעיה העיקרית של contiguous allocation?',
      options: ['קריאה סדרתית איטית', 'קשה להגדיל קבצים, והמקום הפנוי מתפצל', 'היא דורשת index block לכל קובץ', 'אי אפשר לשמור בה תיקיות'],
      explanation: 'גם גישה סדרתית וגם גישה אקראית מהירות, אבל קובץ יכול לגדול רק אם ה-block הבא פנוי, ומחיקת קבצים משאירה חורים שעלולים להיות קטנים מדי לקבצים חדשים (external fragmentation).',
    },
    'sto-sstf': {
      prompt: 'עם SSTF, מהי התנועה הכוללת של הראש (ב-cylinders)?',
      scenario: `הראש ב-cylinder 50\nבקשות: ${ltr('45, 70, 90, 10')}`,
      unit: 'cylinders',
      explanation: `SSTF תמיד משרת את הבקשה הקרובה ביותר: ${ltr('50 -> 45')} (5), אחר כך 70 (25, קרוב יותר מ-10 שנמצא במרחק 35), אחר כך 90 (20), ולבסוף כל הדרך חזרה ל-10 (80). סך הכול ${ltr('5 + 25 + 20 + 80 = 130')}.`,
    },
    'sto-open-read': {
      prompt: 'סדרו את מה שקורה כשתוכנית פותחת וקוראת את /home/notes.txt.',
      items: [
        'חיפוש "home" בתיקיית השורש כדי לקבל את ה-inode שלה',
        'חיפוש "notes.txt" בתיקייה /home כדי לקבל את ה-inode שלו',
        'קריאת ה-inode כדי למצוא את מספרי ה-blocks של נתוני הקובץ',
        'קריאת ה-blocks של הנתונים מהדיסק (או מה-page cache)',
        'העתקת הבתים ל-buffer של התוכנית',
      ],
      explanation: 'פענוח הנתיב מתקדם תיקייה אחת בכל פעם מהשורש, ובכל צעד מתרגם שם ל-inode. ה-inode האחרון אומר למערכת הקבצים אילו blocks מחזיקים את הנתונים.',
    },
    'sto-delete': {
      prompt: 'כשמוחקים קובץ, מה בדרך כלל קורה לנתונים שלו בדיסק?',
      options: [
        'הם נדרסים מיד באפסים',
        'ה-blocks מסומנים כפנויים ב-bitmap, אבל הבתים נשארים עד שמשתמשים בהם מחדש',
        'הם מועברים למחיצה נסתרת',
        'הסקטורים בדיסק מוסרים פיזית',
      ],
      explanation: 'המחיקה רק מסירה את רשומת התיקייה, משחררת את ה-inode ומסמנת את ה-blocks כפנויים. הבתים הישנים נשארים עד שכותבים עליהם משהו אחר, ולכן קיימים כלים לשחזור קבצים (וכלים למחיקה מאובטחת).',
    },
  },
  ar: {
    'sto-inode-name': {
      prompt: 'أين يُخزَّن اسم الملف في نظام ملفات على طريقة Unix؟',
      options: ['في الـ inode', 'في مُدخل المجلد الذي يشير إلى الـ inode', 'في الـ superblock', 'في أول block بيانات'],
      explanation: 'تحمل الـ inodes البيانات الوصفية ومؤشرات الـ blocks لكنها لا تحمل الاسم. المجلدات تربط الأسماء بأرقام الـ inodes، ولهذا يمكن أن يكون للـ inode الواحد عدة أسماء (hard links).',
    },
    'sto-linked-random': {
      prompt: 'أي طريقة تخصيص تجعل الوصول العشوائي (مثل قراءة الـ block رقم 900 من ملف) الأبطأ؟',
      options: ['Contiguous', 'Linked', 'Indexed', 'كلها متساوية'],
      explanation: 'في الـ linked allocation عليك أن تتبع 899 مؤشر next، وكل واحد منها قراءة من القرص. أما الـ contiguous فيحسب العنوان مباشرة، والـ indexed يبحث عنه في الـ index block.',
    },
    'sto-contig-grow': {
      prompt: 'ما المشكلة الرئيسية في الـ contiguous allocation؟',
      options: ['القراءة التسلسلية بطيئة', 'يصعب تكبير الملفات وتتجزأ المساحة الحرة', 'يحتاج إلى index block لكل ملف', 'لا يمكنه تخزين المجلدات'],
      explanation: 'الوصول التسلسلي والعشوائي كلاهما سريع، لكن الملف لا يكبر إلا إذا كان الـ block التالي حرًا، وحذف الملفات يترك فجوات قد تكون أصغر من أن تتسع لملفات جديدة (external fragmentation).',
    },
    'sto-sstf': {
      prompt: 'باستخدام SSTF، ما إجمالي حركة الرأس (بالـ cylinders)؟',
      scenario: `الرأس عند الـ cylinder رقم 50\nالطلبات: ${ltr('45, 70, 90, 10')}`,
      unit: 'cylinders',
      explanation: `يخدم SSTF دائمًا أقرب طلب: ${ltr('50 -> 45')} (5)، ثم 70 (25، وهو أقرب من 10 الذي يبعد 35)، ثم 90 (20)، ثم العودة كل المسافة إلى 10 (80). الإجمالي ${ltr('5 + 25 + 20 + 80 = 130')}.`,
    },
    'sto-open-read': {
      prompt: 'رتّب ما يحدث عندما يفتح برنامج الملف /home/notes.txt ويقرؤه.',
      items: [
        'البحث عن "home" في المجلد الجذر للحصول على الـ inode الخاص به',
        'البحث عن "notes.txt" في المجلد /home للحصول على الـ inode الخاص به',
        'قراءة الـ inode لمعرفة أرقام الـ blocks التي تحوي بيانات الملف',
        'قراءة blocks البيانات من القرص (أو من الـ page cache)',
        'نسخ البايتات إلى الـ buffer الخاص بالبرنامج',
      ],
      explanation: 'يمر تحليل المسار على مجلد واحد في كل مرة بدءًا من الجذر، وفي كل خطوة يترجم اسمًا إلى inode. يخبر الـ inode الأخير نظام الملفات بالـ blocks التي تحمل البيانات.',
    },
    'sto-delete': {
      prompt: 'عندما تحذف ملفًا، ماذا يحدث عادةً لبياناته على القرص؟',
      options: [
        'تُستبدل بالأصفار فورًا',
        'تُعلَّم الـ blocks على أنها حرة في الـ bitmap لكن البايتات تبقى حتى يُعاد استخدامها',
        'تُنقل إلى قسم مخفي',
        'تُزال قطاعات القرص فعليًا',
      ],
      explanation: 'الحذف يزيل مُدخل المجلد فقط، ويحرر الـ inode، ويعلّم الـ blocks على أنها حرة. تبقى البايتات القديمة حتى يُكتب فوقها، ولهذا توجد أدوات لاسترجاع الملفات المحذوفة (وأدوات للمسح الآمن).',
    },
  },
  es: {
    'sto-inode-name': {
      prompt: '¿Dónde se guarda el nombre de un archivo en un sistema de archivos tipo Unix?',
      options: ['En el inode', 'En la entrada del directorio que apunta al inode', 'En el superblock', 'En el primer block de datos'],
      explanation: 'Los inodes guardan metadatos y punteros a blocks, pero no el nombre. Los directorios asocian nombres con números de inode, por eso un mismo inode puede tener varios nombres (hard links).',
    },
    'sto-linked-random': {
      prompt: '¿Qué método de asignación hace más lento el acceso aleatorio (por ejemplo, leer el block 900 de un archivo)?',
      options: ['Contiguous', 'Linked', 'Indexed', 'Todos son iguales'],
      explanation: 'Con linked allocation tienes que seguir 899 punteros next, y cada uno es una lectura de disco. Contiguous calcula la dirección directamente, e indexed la busca en el index block.',
    },
    'sto-contig-grow': {
      prompt: '¿Cuál es el principal problema de contiguous allocation?',
      options: ['Las lecturas secuenciales son lentas', 'Es difícil hacer crecer los archivos y el espacio libre se fragmenta', 'Necesita un index block por archivo', 'No puede guardar directorios'],
      explanation: 'Tanto el acceso secuencial como el aleatorio son rápidos, pero un archivo solo puede crecer si el block siguiente está libre, y al borrar archivos quedan huecos que pueden ser demasiado pequeños para archivos nuevos (external fragmentation).',
    },
    'sto-sstf': {
      prompt: 'Con SSTF, ¿cuál es el movimiento total del cabezal (en cylinders)?',
      scenario: 'Cabezal en el cylinder 50\nPeticiones: 45, 70, 90, 10',
      unit: 'cylinders',
      explanation: 'SSTF siempre atiende la petición más cercana: 50 -> 45 (5), luego 70 (25, más cerca que 10, que está a 35), luego 90 (20) y por último todo el camino de vuelta hasta 10 (80). Total = 5 + 25 + 20 + 80 = 130.',
    },
    'sto-open-read': {
      prompt: 'Ordena lo que ocurre cuando un programa abre y lee /home/notes.txt.',
      items: [
        'Buscar "home" en el directorio raíz para obtener su inode',
        'Buscar "notes.txt" en el directorio /home para obtener su inode',
        'Leer el inode para encontrar los números de block con los datos del archivo',
        'Leer los blocks de datos del disco (o de la page cache)',
        'Copiar los bytes al buffer del programa',
      ],
      explanation: 'La resolución de la ruta recorre un directorio cada vez desde la raíz, y en cada paso traduce un nombre a un inode. El último inode le dice al sistema de archivos qué blocks contienen los datos.',
    },
    'sto-delete': {
      prompt: 'Cuando borras un archivo, ¿qué suele pasar con sus datos en el disco?',
      options: [
        'Se sobrescriben con ceros inmediatamente',
        'Los blocks se marcan como libres en el bitmap, pero los bytes siguen ahí hasta que se reutilizan',
        'Se mueven a una partición oculta',
        'Los sectores del disco se eliminan físicamente',
      ],
      explanation: 'Borrar solo elimina la entrada del directorio, libera el inode y marca los blocks como libres. Los bytes antiguos siguen ahí hasta que se sobrescriben, por eso existen herramientas para recuperar archivos borrados (y para borrarlos de forma segura).',
    },
  },
}

export const storageChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-sto-grow': ['להיכשל בהגדלת קובץ contiguous', 'ב-contiguous allocation, בחרו קובץ שמיד אחריו יש קובץ אחר והוסיפו לו block.'],
    'ch-sto-scatter': ['ליצור קובץ linked שה-blocks שלו לא רצופים', 'עברו ל-linked allocation. המחיקה של notes.txt השאירה חור, ולכן קובץ של 4 blocks יתפצל.'],
    'ch-sto-sstf': ['למצוא בקשות שבהן SSTF מזיז את הראש פחות משליש מהמרחק של FCFS', `גרמו לתור לקפוץ הלוך ושוב לאורך הדיסק, למשל ${ltr('10, 190, 20, 180, 30, 170')}. ב-FCFS הראש חוצה את כל הדיסק בכל פעם.`],
  },
  ar: {
    'ch-sto-grow': ['الفشل في تكبير ملف contiguous', 'مع الـ contiguous allocation، اختر ملفًا يليه مباشرةً ملف آخر وأضف إليه block.'],
    'ch-sto-scatter': ['إنشاء ملف linked لا تكون الـ blocks الخاصة به متتالية', 'انتقل إلى الـ linked allocation. حذف notes.txt ترك فجوة، لذا سيُقسَّم ملف من 4 blocks.'],
    'ch-sto-sstf': ['إيجاد طلبات يحرّك فيها SSTF الرأس أقل من ثلث مسافة FCFS', `اجعل الطابور يتنقل ذهابًا وإيابًا عبر القرص، مثل ${ltr('10, 190, 20, 180, 30, 170')}. في FCFS يعبر الرأس القرص كله في كل مرة.`],
  },
  es: {
    'ch-sto-grow': ['No poder hacer crecer un archivo contiguous', 'Con contiguous allocation, selecciona un archivo que tenga otro archivo justo detrás y añádele un block.'],
    'ch-sto-scatter': ['Crear un archivo linked cuyos blocks no sean consecutivos', 'Cambia a linked allocation. Al borrar notes.txt quedó un hueco, así que un archivo de 4 blocks quedará dividido.'],
    'ch-sto-sstf': ['Encontrar peticiones en las que SSTF mueva el cabezal menos de un tercio que FCFS', 'Haz que la cola zigzaguee por todo el disco, por ejemplo 10, 190, 20, 180, 30, 170. FCFS cruza el disco entero cada vez.'],
  },
}

interface GenText {
  diskNames: Record<DiskAlgo, string>
  diskPrompt: (algo: string) => string
  diskScenario: (head: number, queue: number[]) => string
  diskUnit: string
  diskExplain: (path: number[], moves: number[], total: number) => string
  blocksPrompt: (size: string, indexed: boolean) => string
  blocksUnit: string
  blocksExplain: (size: number, data: number, indexed: boolean) => string
}

const route = (path: number[]) => path.join(' -> ')
const sum = (moves: number[], total: number) => `${moves.join(' + ')} = ${total}`

export const storageGenText: Localized<GenText> = {
  en: {
    diskNames: { FCFS: 'FCFS', SSTF: 'SSTF', SCAN: 'SCAN (moving toward 199 first)', CSCAN: 'C-SCAN (moving toward 199, wrap-around counted)' },
    diskPrompt: (algo) => `Using ${algo}, what is the total head movement in cylinders? (Cylinders 0-199.)`,
    diskScenario: (head, queue) => `Head at ${head}\nQueue: ${queue.join(', ')}`,
    diskUnit: 'cylinders',
    diskExplain: (path, moves, total) => `Path: ${route(path)}.\nTotal = ${sum(moves, total)}.`,
    blocksPrompt: (size, indexed) =>
      `Blocks are 4 KiB (4096 bytes). How many disk blocks does a ${size}-byte file use with ${indexed ? 'indexed allocation (one index block per file)' : 'contiguous allocation'}?`,
    blocksUnit: 'blocks',
    blocksExplain: (size, data, indexed) =>
      `${size} / 4096 rounded up = ${data} data blocks${indexed ? ', plus 1 index block' : ''}. The unused space in the last block is internal fragmentation.`,
  },
  he: {
    diskNames: { FCFS: 'FCFS', SSTF: 'SSTF', SCAN: 'SCAN (שנע קודם לכיוון 199)', CSCAN: 'C-SCAN (שנע לכיוון 199, כולל הקפיצה חזרה)' },
    diskPrompt: (algo) => `עם ${algo}, מהי התנועה הכוללת של הראש ב-cylinders? (cylinders ${ltr('0-199')}.)`,
    diskScenario: (head, queue) => `הראש ב-${head}\nתור: ${ltr(queue.join(', '))}`,
    diskUnit: 'cylinders',
    diskExplain: (path, moves, total) => `המסלול: ${ltr(route(path))}.\nסך הכול: ${ltr(sum(moves, total))}.`,
    blocksPrompt: (size, indexed) =>
      `כל block הוא 4 KiB (4096 בתים). בכמה blocks בדיסק משתמש קובץ של ${size} בתים עם ${indexed ? 'indexed allocation (index block אחד לכל קובץ)' : 'contiguous allocation'}?`,
    blocksUnit: 'blocks',
    blocksExplain: (size, data, indexed) =>
      `${ltr(`${size} / 4096`)} מעוגל למעלה הוא ${data} blocks של נתונים${indexed ? ', ועוד index block אחד' : ''}. המקום שלא נוצל ב-block האחרון הוא internal fragmentation.`,
  },
  ar: {
    diskNames: { FCFS: 'FCFS', SSTF: 'SSTF', SCAN: 'SCAN (يتحرك أولًا نحو 199)', CSCAN: 'C-SCAN (يتحرك نحو 199، مع احتساب القفزة إلى البداية)' },
    diskPrompt: (algo) => `باستخدام ${algo}، ما إجمالي حركة الرأس بالـ cylinders؟ (الـ cylinders ${ltr('0-199')}.)`,
    diskScenario: (head, queue) => `الرأس عند ${head}\nالطابور: ${ltr(queue.join(', '))}`,
    diskUnit: 'cylinders',
    diskExplain: (path, moves, total) => `المسار: ${ltr(route(path))}.\nالإجمالي: ${ltr(sum(moves, total))}.`,
    blocksPrompt: (size, indexed) =>
      `حجم كل block هو 4 KiB (4096 بايت). كم block على القرص يستخدم ملف حجمه ${size} بايت مع ${indexed ? 'الـ indexed allocation (‏index block واحد لكل ملف)' : 'الـ contiguous allocation'}؟`,
    blocksUnit: 'blocks',
    blocksExplain: (size, data, indexed) =>
      `${ltr(`${size} / 4096`)} مقرّبًا للأعلى يساوي ${data} blocks بيانات${indexed ? '، بالإضافة إلى index block واحد' : ''}. المساحة غير المستخدمة في آخر block هي internal fragmentation.`,
  },
  es: {
    diskNames: { FCFS: 'FCFS', SSTF: 'SSTF', SCAN: 'SCAN (moviéndose primero hacia 199)', CSCAN: 'C-SCAN (moviéndose hacia 199, contando el salto de vuelta)' },
    diskPrompt: (algo) => `Con ${algo}, ¿cuál es el movimiento total del cabezal en cylinders? (Cylinders 0-199.)`,
    diskScenario: (head, queue) => `Cabezal en ${head}\nCola: ${queue.join(', ')}`,
    diskUnit: 'cylinders',
    diskExplain: (path, moves, total) => `Recorrido: ${route(path)}.\nTotal = ${sum(moves, total)}.`,
    blocksPrompt: (size, indexed) =>
      `Los blocks son de 4 KiB (4096 bytes). ¿Cuántos blocks de disco usa un archivo de ${size} bytes con ${indexed ? 'indexed allocation (un index block por archivo)' : 'contiguous allocation'}?`,
    blocksUnit: 'blocks',
    blocksExplain: (size, data, indexed) =>
      `${size} / 4096 redondeado hacia arriba = ${data} blocks de datos${indexed ? ', más 1 index block' : ''}. El espacio sin usar del último block es internal fragmentation.`,
  },
}
