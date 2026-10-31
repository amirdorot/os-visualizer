import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Card } from '../components/ui'
import { useTopics } from '../data/topics'
import { useText, type Localized } from '../i18n'
import { useUi } from '../i18n/ui'
import { REPO_URL, feedbackUrl } from '../lib/site'

const books = <><em>Operating System Concepts</em> (Silberschatz, Galvin and Gagne)</>
const ostep = <><em>Operating Systems: Three Easy Pieces</em> (Arpaci-Dusseau)</>

interface AboutText {
  title: string
  lead: string
  whoTitle: string
  who: [string, string, string]
  insideTitle: string
  inside: [string, string]
  howTitle: string
  how: string
  teachTitle: string
  teach: (share: string, present: string) => string
  languagesTitle: string
  languages: string
  dataTitle: string
  data: (reset: string) => string
  feedbackTitle: string
  feedback: (link: string) => string
  license: [string, string]
  send: string
  source: string
}

const about: Localized<AboutText> = {
  en: {
    title: 'About OS Visualizer',
    lead: 'OS Visualizer is a free, interactive companion for an operating systems course. Instead of reading about a page fault or a deadlock, you cause one, step through it, rewind it, and then check your understanding.',
    whoTitle: 'Who it is for',
    who: [
      'Computer science students taking a first operating systems course, and anyone preparing for exams or interviews on the topic. The material follows the standard curriculum found in textbooks such as ',
      ' and ',
      '.',
    ],
    insideTitle: 'What is inside',
    inside: ['Every topic has simulations with challenges, a quiz, and unlimited generated practice. The ', ' mixes topics and lets you review the questions you missed.'],
    howTitle: 'How the simulations work',
    how: "Each simulation runs on a small, deterministic engine (the scheduler, page replacement, disk scheduling, the banker's algorithm and so on) that is covered by automated tests. The generated practice questions use the same engines to compute their answers, so the numbers you see in a simulation and in a quiz always agree.",
    teachTitle: 'Teaching with it',
    teach: (share, present) =>
      `Every simulation keeps its settings in the page address, so "${share}" gives you a link that opens the same workload, reference string or deadlock for your students. The "${present}" button on each topic turns it into slides with larger text: use the arrow keys to move between the introduction, each simulation and the quiz, and share a link that opens on a particular slide.`,
    languagesTitle: 'Languages',
    languages: 'The site is available in English, Hebrew, Arabic and Spanish. Technical terms such as fork, mutex or page fault stay in English in every language, since that is how they appear in textbooks, documentation and code.',
    dataTitle: 'Your data',
    data: (reset) =>
      `There are no accounts and no tracking. Quiz results, challenges, your theme and language are stored only in this browser's local storage. Clearing site data, or the "${reset}" link on the home page, removes them.`,
    feedbackTitle: 'Feedback and contributions',
    feedback: (link) =>
      `Found a mistake, a confusing explanation, or have an idea for a new simulation? Every page has a "${link}" link in the footer that opens a prefilled GitHub issue. The code is open source under the `,
    license: ['MIT license', ', so you are free to reuse it, adapt it for your course or contribute improvements.'],
    send: 'Send feedback',
    source: 'View the source on GitHub',
  },
  he: {
    title: 'אודות OS Visualizer',
    lead: 'OS Visualizer הוא מלווה חינמי ואינטראקטיבי לקורס במערכות הפעלה. במקום לקרוא על page fault או deadlock, אתם גורמים לו לקרות, עוברים עליו צעד אחר צעד, מריצים אחורה ואז בודקים את ההבנה שלכם.',
    whoTitle: 'למי זה מיועד',
    who: [
      'לסטודנטים למדעי המחשב בקורס ראשון במערכות הפעלה, ולכל מי שמתכונן לבחינה או לראיון עבודה בנושא. החומר עוקב אחרי תוכנית הלימודים המקובלת בספרים כמו ',
      ' ו-',
      '.',
    ],
    insideTitle: 'מה יש כאן',
    inside: ['בכל נושא יש סימולציות עם אתגרים, בוחן ותרגול בלתי מוגבל עם שאלות שנוצרות אוטומטית. ה-', ' משלב נושאים ומאפשר לחזור על השאלות שטעיתם בהן.'],
    howTitle: 'איך הסימולציות עובדות',
    how: 'כל סימולציה רצה על מנוע קטן ודטרמיניסטי (ה-scheduler, ‏page replacement, תזמון דיסק, ה-banker\'s algorithm וכן הלאה) שמכוסה בבדיקות אוטומטיות. שאלות התרגול משתמשות באותם מנועים כדי לחשב את התשובות, כך שהמספרים בסימולציה ובבוחן תמיד מתאימים.',
    teachTitle: 'הוראה בעזרת האתר',
    teach: (share, present) =>
      `כל סימולציה שומרת את ההגדרות שלה בכתובת הדף, כך ש"${share}" נותן לכם קישור שפותח לסטודנטים את אותו עומס עבודה, reference string או deadlock. הכפתור "${present}" בכל נושא הופך אותו לשקפים עם טקסט גדול יותר: עברו עם מקשי החיצים בין המבוא, כל סימולציה והבוחן, ושתפו קישור שנפתח על שקף מסוים.`,
    languagesTitle: 'שפות',
    languages: 'האתר זמין באנגלית, עברית, ערבית וספרדית. מונחים טכניים כמו fork, ‏mutex או page fault נשארים באנגלית בכל השפות, כי כך הם מופיעים בספרי לימוד, בתיעוד ובקוד.',
    dataTitle: 'המידע שלכם',
    data: (reset) =>
      `אין חשבונות ואין מעקב. תוצאות הבחנים, האתגרים, ערכת הצבעים והשפה נשמרים רק ב-local storage של הדפדפן הזה. ניקוי נתוני האתר, או הקישור "${reset}" בדף הבית, מוחק אותם.`,
    feedbackTitle: 'משוב ותרומה',
    feedback: (link) =>
      `מצאתם טעות, הסבר מבלבל, או שיש לכם רעיון לסימולציה חדשה? בכל דף יש בתחתית קישור "${link}" שפותח GitHub issue ממולא מראש. הקוד פתוח תחת `,
    license: ['רישיון MIT', ', כך שאפשר להשתמש בו מחדש, להתאים אותו לקורס שלכם או לתרום שיפורים.'],
    send: 'שליחת משוב',
    source: 'לקוד המקור ב-GitHub',
  },
  ar: {
    title: 'حول OS Visualizer',
    lead: 'OS Visualizer رفيق مجاني وتفاعلي لمقرر أنظمة التشغيل. بدلًا من القراءة عن page fault أو deadlock، تتسبب في حدوثه، وتتتبعه خطوة بخطوة، وتعيده إلى الوراء، ثم تختبر فهمك.',
    whoTitle: 'لمن هذا الموقع',
    who: [
      'لطلاب علوم الحاسوب في مقررهم الأول لأنظمة التشغيل، ولكل من يستعد لامتحان أو مقابلة عمل في هذا الموضوع. يتبع المحتوى المنهج المعتاد في كتب مثل ',
      ' و',
      '.',
    ],
    insideTitle: 'ماذا يوجد هنا',
    inside: ['لكل موضوع محاكيات مع تحديات واختبار وتدريب غير محدود بأسئلة مولَّدة تلقائيًا. ', ' يمزج الموضوعات ويتيح لك مراجعة الأسئلة التي أخطأت فيها.'],
    howTitle: 'كيف تعمل المحاكيات',
    how: 'تعمل كل محاكاة على محرك صغير وحتمي (الـ scheduler و page replacement وجدولة القرص و banker\'s algorithm وغيرها) تغطيه اختبارات آلية. تستخدم أسئلة التدريب المحركات نفسها لحساب الإجابات، لذا تتطابق الأرقام دائمًا بين المحاكاة والاختبار.',
    teachTitle: 'التدريس باستخدامه',
    teach: (share, present) =>
      `تحفظ كل محاكاة إعداداتها في عنوان الصفحة، فيمنحك "${share}" رابطًا يفتح لطلابك عبء العمل نفسه أو reference string أو deadlock نفسه. يحوّل زر "${present}" في كل موضوع إلى شرائح بخط أكبر: استخدم مفاتيح الأسهم للتنقل بين المقدمة وكل محاكاة والاختبار، وشارك رابطًا يفتح على شريحة محددة.`,
    languagesTitle: 'اللغات',
    languages: 'الموقع متاح بالإنجليزية والعبرية والعربية والإسبانية. تبقى المصطلحات التقنية مثل fork و mutex و page fault بالإنجليزية في كل اللغات، لأنها هكذا تظهر في الكتب والتوثيق والشيفرة.',
    dataTitle: 'بياناتك',
    data: (reset) =>
      `لا توجد حسابات ولا تتبُّع. تُحفَظ نتائج الاختبارات والتحديات والسمة واللغة في local storage لهذا المتصفح فقط. يزيلها مسح بيانات الموقع أو رابط "${reset}" في الصفحة الرئيسية.`,
    feedbackTitle: 'الملاحظات والمساهمة',
    feedback: (link) =>
      `وجدت خطأً أو شرحًا مربكًا، أو لديك فكرة لمحاكاة جديدة؟ في أسفل كل صفحة رابط "${link}" يفتح GitHub issue معبَّأ مسبقًا. الشيفرة مفتوحة المصدر بموجب `,
    license: ['رخصة MIT', '، لذا يمكنك إعادة استخدامها أو تكييفها لمقررك أو المساهمة بتحسينات.'],
    send: 'إرسال ملاحظات',
    source: 'عرض الشيفرة على GitHub',
  },
  es: {
    title: 'Acerca de OS Visualizer',
    lead: 'OS Visualizer es un complemento gratuito e interactivo para un curso de sistemas operativos. En lugar de leer sobre un page fault o un deadlock, lo provocas, lo recorres paso a paso, lo rebobinas y luego compruebas lo que has entendido.',
    whoTitle: 'Para quién es',
    who: [
      'Para estudiantes de informática en su primer curso de sistemas operativos y para cualquiera que prepare un examen o una entrevista sobre el tema. El contenido sigue el temario habitual de libros como ',
      ' y ',
      '.',
    ],
    insideTitle: 'Qué contiene',
    inside: ['Cada tema tiene simulaciones con retos, un cuestionario y práctica ilimitada con preguntas generadas. El ', ' mezcla temas y te permite repasar las preguntas que fallaste.'],
    howTitle: 'Cómo funcionan las simulaciones',
    how: "Cada simulación se ejecuta sobre un motor pequeño y determinista (el scheduler, page replacement, planificación de disco, el banker's algorithm, etc.) cubierto por pruebas automáticas. Las preguntas de práctica usan los mismos motores para calcular sus respuestas, así que los números de una simulación y de un cuestionario siempre coinciden.",
    teachTitle: 'Para enseñar',
    teach: (share, present) =>
      `Cada simulación guarda su configuración en la dirección de la página, así que "${share}" te da un enlace que abre la misma carga de trabajo, reference string o deadlock para tus estudiantes. El botón "${present}" de cada tema lo convierte en diapositivas con texto más grande: usa las flechas para pasar de la introducción a cada simulación y al cuestionario, y comparte un enlace que se abre en una diapositiva concreta.`,
    languagesTitle: 'Idiomas',
    languages: 'El sitio está disponible en inglés, hebreo, árabe y español. Los términos técnicos como fork, mutex o page fault se mantienen en inglés en todos los idiomas, porque así aparecen en los libros, la documentación y el código.',
    dataTitle: 'Tus datos',
    data: (reset) =>
      `No hay cuentas ni seguimiento. Los resultados, los retos, el tema y el idioma se guardan solo en el local storage de este navegador. Se borran al limpiar los datos del sitio o con el enlace "${reset}" de la página de inicio.`,
    feedbackTitle: 'Comentarios y contribuciones',
    feedback: (link) =>
      `¿Encontraste un error, una explicación confusa o tienes una idea para una simulación nueva? Cada página tiene en el pie un enlace "${link}" que abre un GitHub issue ya rellenado. El código es abierto bajo la `,
    license: ['licencia MIT', ', así que puedes reutilizarlo, adaptarlo a tu curso o contribuir mejoras.'],
    send: 'Enviar comentarios',
    source: 'Ver el código en GitHub',
  },
}

export default function AboutPage() {
  const a = useText(about)
  const ui = useUi()
  const topics = useTopics()
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{a.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">{a.lead}</p>

      <div className="mt-8 grid gap-6">
        <Card title={a.whoTitle}>
          <p className="text-sm leading-relaxed text-muted">
            {a.who[0]}
            <bdi>{books}</bdi>
            {a.who[1]}
            <bdi>{ostep}</bdi>
            {a.who[2]}
          </p>
        </Card>

        <Card title={a.insideTitle}>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {topics.map((t) => (
              <li key={t.id}>
                <Link to={t.path} className="flex items-start gap-2 hover:underline">
                  <Icon name={t.icon} className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <strong>{t.title}</strong>
                    <span className="block text-muted">{t.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            {a.inside[0]}
            <Link to="/quiz" className="underline">
              {ui.layout.quizHub}
            </Link>
            {a.inside[1]}
          </p>
        </Card>

        <Card title={a.howTitle}>
          <p className="text-sm leading-relaxed text-muted">{a.how}</p>
        </Card>

        <Card title={a.teachTitle}>
          <p className="text-sm leading-relaxed text-muted">{a.teach(ui.share.setup, ui.topic.present)}</p>
        </Card>

        <Card title={a.languagesTitle}>
          <p className="text-sm leading-relaxed text-muted">{a.languages}</p>
        </Card>

        <Card title={a.dataTitle}>
          <p className="text-sm leading-relaxed text-muted">{a.data(ui.home.resetAll)}</p>
        </Card>

        <Card title={a.feedbackTitle}>
          <p className="text-sm leading-relaxed text-muted">
            {a.feedback(ui.layout.feedback)}
            <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="underline">
              {a.license[0]}
            </a>
            {a.license[1]}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={feedbackUrl('/about')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              <Icon name="chat" className="size-4" /> {a.send}
            </a>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:border-indigo-400">
              {a.source}
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
