import type { Localized } from '../../i18n'
import type { QuestionText, Translations } from '../../i18n/content'

const mutexItems = ['lock(&m)', 'reg = counter', 'reg = reg + 1', 'counter = reg', 'unlock(&m)']

export const threadsQuizText: Translations<Record<string, QuestionText>> = {
  he: {
    'thr-shared': {
      prompt: 'מה מהבאים לא משותף בין threads של אותו process?',
      options: ['משתנים גלובליים', 'זיכרון ה-heap', 'ה-file descriptors הפתוחים', 'ה-stack'],
      explanation: 'לכל thread יש stack משלו (משתנים מקומיים, כתובות חזרה), ורגיסטרים ו-program counter משלו. הקוד, המשתנים הגלובליים, ה-heap והקבצים הפתוחים שייכים ל-process ומשותפים.',
    },
    'thr-race-min': {
      prompt: 'שני threads מריצים כל אחד counter++ פעם אחת בדיוק, בלי lock. counter++ מתקמפל ל-LOAD, ADD, STORE. אם מתחילים מ-0, מה הערך הסופי הקטן ביותר האפשרי?',
      explanation: 'אם שני ה-threads מבצעים LOAD של 0 לפני שאחד מהם מבצע STORE, שניהם מחשבים 1 ושניהם כותבים 1. עדכון אחד הולך לאיבוד, ולכן התוצאה יכולה להיות 1 במקום 2.',
    },
    'thr-why-cheaper': {
      prompt: 'למה יצירת thread זולה בדרך כלל מיצירת process?',
      options: [
        'ל-threads לא צריך stack',
        'Threads חולקים את מרחב הכתובות, ולכן לא צריך page tables חדשות או העתקות של זיכרון',
        'Threads רצים ב-kernel mode',
        'אי אפשר להפקיע threads',
      ],
      explanation: 'thread חדש צריך רק stack ובלוק בקרה קטן. process חדש צריך מרחב כתובות משלו, page tables וטבלת קבצים. גם context switch בין threads של אותו process זול יותר, כי מרחב הכתובות (ותוכן ה-TLB) נשאר אותו דבר.',
    },
    'thr-mutex-order': {
      prompt: 'סדרו הגדלה מסונכרנת נכון של counter משותף.',
      items: mutexItems,
      explanation: 'כל רצף הקריאה-שינוי-כתיבה הוא ה-critical section. הוא חייב להיות בין lock ל-unlock, כדי ששום thread אחר לא יוכל להשתחל באמצע.',
    },
    'thr-deadlock': {
      prompt: 'Thread A מחזיק ב-lock X ומחכה ל-lock Y. Thread B מחזיק ב-Y ומחכה ל-X. מה זה?',
      options: ['Race condition', 'Deadlock', 'Starvation', 'Context switch'],
      explanation: 'כל thread מחכה לנצח למשאב שהשני מחזיק: המתנה מעגלית, כלומר deadlock. פתרון נפוץ הוא לתפוס תמיד את ה-locks באותו סדר גלובלי.',
    },
  },
  ar: {
    'thr-shared': {
      prompt: 'أيٌّ مما يلي لا تتشاركه الـ threads التابعة للـ process نفسه؟',
      options: ['المتغيرات العامة', 'ذاكرة الـ heap', 'الـ file descriptors المفتوحة', 'الـ stack'],
      explanation: 'لكل thread ‏stack خاص به (المتغيرات المحلية وعناوين العودة)، وسجلات و program counter خاصة به. أما الشيفرة والمتغيرات العامة والـ heap والملفات المفتوحة فتنتمي إلى الـ process وهي مشتركة.',
    },
    'thr-race-min': {
      prompt: 'يشغّل كل من thread اثنين counter++ مرة واحدة بالضبط دون lock. تُترجَم counter++ إلى LOAD و ADD و STORE. إذا بدأنا من 0، فما أصغر قيمة نهائية ممكنة؟',
      explanation: 'إذا نفّذ كلا الـ threads عملية LOAD للقيمة 0 قبل أن ينفّذ أيٌّ منهما STORE، فسيحسب كلاهما 1 ويكتب كلاهما 1. يضيع تحديث واحد، فقد تكون النتيجة 1 بدلًا من 2.',
    },
    'thr-why-cheaper': {
      prompt: 'لماذا يكون إنشاء thread عادةً أرخص من إنشاء process؟',
      options: [
        'الـ threads لا تحتاج إلى stack',
        'الـ threads تتشارك فضاء العناوين، فلا حاجة إلى page tables جديدة أو نسخ للذاكرة',
        'الـ threads تعمل في kernel mode',
        'لا يمكن انتزاع الـ CPU من الـ threads',
      ],
      explanation: 'يحتاج الـ thread الجديد فقط إلى stack وكتلة تحكم صغيرة. أما الـ process الجديد فيحتاج إلى فضاء عناوين خاص به و page tables وجدول ملفات. كما أن الـ context switch بين threads الـ process نفسه أرخص، لأن فضاء العناوين (ومحتوى الـ TLB) يبقى كما هو.',
    },
    'thr-mutex-order': {
      prompt: 'رتّب خطوات زيادة counter مشترك بتزامن صحيح.',
      items: mutexItems,
      explanation: 'سلسلة القراءة-التعديل-الكتابة كلها هي الـ critical section. يجب أن تقع بين lock و unlock حتى لا يتمكن أي thread آخر من التداخل في منتصفها.',
    },
    'thr-deadlock': {
      prompt: 'Thread A يمسك lock X وينتظر lock Y. و Thread B يمسك Y وينتظر X. ما هذا؟',
      options: ['Race condition', 'Deadlock', 'Starvation', 'Context switch'],
      explanation: 'كل thread ينتظر إلى الأبد موردًا يمسكه الآخر: انتظار دائري، أي deadlock. الحل الشائع هو أخذ الـ locks دائمًا بالترتيب العام نفسه.',
    },
  },
  es: {
    'thr-shared': {
      prompt: '¿Cuál de estos NO se comparte entre los threads de un mismo process?',
      options: ['Las variables globales', 'La memoria del heap', 'Los file descriptors abiertos', 'El stack'],
      explanation: 'Cada thread tiene su propio stack (variables locales, direcciones de retorno) y sus propios registros y program counter. El código, las variables globales, el heap y los archivos abiertos pertenecen al process y se comparten.',
    },
    'thr-race-min': {
      prompt: 'Dos threads ejecutan counter++ exactamente una vez cada uno, sin lock. counter++ se compila a LOAD, ADD, STORE. Empezando en 0, ¿cuál es el valor final más pequeño posible?',
      explanation: 'Si ambos threads hacen LOAD de 0 antes de que cualquiera haga STORE, los dos calculan 1 y los dos escriben 1. Se pierde una actualización, así que el resultado puede ser 1 en lugar de 2.',
    },
    'thr-why-cheaper': {
      prompt: '¿Por qué crear un thread suele ser más barato que crear un process?',
      options: [
        'Los threads no necesitan stack',
        'Los threads comparten el espacio de direcciones, así que no hacen falta page tables nuevas ni copias de memoria',
        'Los threads se ejecutan en kernel mode',
        'Los threads no pueden ser expulsados',
      ],
      explanation: 'Un thread nuevo solo necesita un stack y un pequeño bloque de control. Un process nuevo necesita su propio espacio de direcciones, page tables y tabla de archivos. El context switch entre threads del mismo process también es más barato, porque el espacio de direcciones (y el contenido de la TLB) no cambia.',
    },
    'thr-mutex-order': {
      prompt: 'Ordena un incremento correctamente sincronizado de un counter compartido.',
      items: mutexItems,
      explanation: 'Toda la secuencia de lectura-modificación-escritura es la critical section. Debe ir entre lock y unlock para que ningún otro thread pueda intercalarse en medio.',
    },
    'thr-deadlock': {
      prompt: 'El thread A tiene el lock X y espera el lock Y. El thread B tiene Y y espera X. ¿Qué es esto?',
      options: ['Una race condition', 'Un deadlock', 'Starvation', 'Un context switch'],
      explanation: 'Cada thread espera para siempre un recurso que tiene el otro: una espera circular, es decir, un deadlock. Una solución habitual es adquirir siempre los locks en el mismo orden global.',
    },
  },
}

export const threadsChallengeText: Translations<Record<string, [string, string]>> = {
  he: {
    'ch-thr-lose2': ['לאבד לפחות 2 עדכונים (mutex כבוי)', 'הגדילו את מספר ההגדלות לכל thread, או שחקו בתפקיד ה-scheduler: LOAD בשני ה-threads לפני שאחד מהם מבצע STORE, פעמיים.'],
    'ch-thr-perfect': ['לקבל את הסכום הנכון בלי mutex בעזרת תזמון זהיר', 'השתמשו בכפתורי ההרצה ותנו לכל thread לסיים LOAD, ADD, STORE לפני שעוברים ל-thread אחר. לפחות 2 threads ו-2 הגדלות לכל אחד.'],
    'ch-thr-mutex': ['לסיים עם mutex דלוק ועם 3 threads או יותר', 'הדליקו את ה-mutex, בחרו 3 threads ולחצו על הפעלה. שימו לב איך threads נחסמים ב-lock().'],
  },
  ar: {
    'ch-thr-lose2': ['أضِع تحديثين على الأقل (الـ mutex مطفأ)', 'استخدم عددًا أكبر من الزيادات لكل thread، أو العب دور الـ scheduler: نفّذ LOAD في كلا الـ threads قبل أن ينفّذ أيٌّ منهما STORE، مرتين.'],
    'ch-thr-perfect': ['احصل على المجموع الصحيح دون mutex بجدولة دقيقة', 'استخدم أزرار التشغيل ودع كل thread ينهي LOAD و ADD و STORE قبل التبديل. على الأقل 2 threads و 2 زيادات لكل منهما.'],
    'ch-thr-mutex': ['أنهِ التشغيل والـ mutex مفعّل مع 3 threads أو أكثر', 'فعّل الـ mutex، واختر 3 threads واضغط تشغيل. راقب الـ threads وهي تُحجَب على lock().'],
  },
  es: {
    'ch-thr-lose2': ['Perder al menos 2 actualizaciones (mutex desactivado)', 'Usa más incrementos por thread, o haz de scheduler: LOAD en ambos threads antes de que cualquiera haga STORE, dos veces.'],
    'ch-thr-perfect': ['Obtener el total correcto sin mutex planificando con cuidado', 'Usa los botones de ejecutar y deja que cada thread termine LOAD, ADD, STORE antes de cambiar. Al menos 2 threads y 2 incrementos cada uno.'],
    'ch-thr-mutex': ['Terminar con el mutex activado usando 3 o más threads', 'Activa el mutex, elige 3 threads y pulsa play. Observa cómo los threads se bloquean en lock().'],
  },
}

interface GenText {
  interleavePrompt: string
  noLoss: string
  lost: string
}

export const threadsGenText: Localized<GenText> = {
  en: {
    interleavePrompt: 'counter starts at 0 and each thread has its own register. Two threads run counter++ in this exact interleaving. What is the final value of counter?',
    noLoss: 'Each thread finished its STORE before the other one LOADed, so no update was lost: 2.',
    lost: 'Both threads LOADed the same old value before either stored its result, so one increment overwrote the other: the final value is 1.',
  },
  he: {
    interleavePrompt: 'counter מתחיל ב-0 ולכל thread יש רגיסטר משלו. שני threads מריצים counter++ בדיוק בסדר השזירה הזה. מה הערך הסופי של counter?',
    noLoss: 'כל thread סיים את ה-STORE שלו לפני שה-thread השני ביצע LOAD, ולכן אף עדכון לא אבד: 2.',
    lost: 'שני ה-threads ביצעו LOAD של אותו ערך ישן לפני שאחד מהם שמר את התוצאה, ולכן הגדלה אחת דרסה את השנייה: הערך הסופי הוא 1.',
  },
  ar: {
    interleavePrompt: 'يبدأ counter من 0 ولكل thread سجل خاص به. يشغّل thread اثنان counter++ بهذا التداخل بالضبط. ما القيمة النهائية لـ counter؟',
    noLoss: 'أنهى كل thread عملية STORE الخاصة به قبل أن ينفّذ الآخر LOAD، لذا لم يضع أي تحديث: 2.',
    lost: 'نفّذ كلا الـ threads عملية LOAD للقيمة القديمة نفسها قبل أن يخزّن أيٌّ منهما نتيجته، فكتبت زيادة فوق الأخرى: القيمة النهائية 1.',
  },
  es: {
    interleavePrompt: 'counter empieza en 0 y cada thread tiene su propio registro. Dos threads ejecutan counter++ exactamente en este intercalado. ¿Cuál es el valor final de counter?',
    noLoss: 'Cada thread terminó su STORE antes de que el otro hiciera LOAD, así que no se perdió ninguna actualización: 2.',
    lost: 'Ambos threads hicieron LOAD del mismo valor antiguo antes de que cualquiera guardara su resultado, así que un incremento sobrescribió al otro: el valor final es 1.',
  },
}
