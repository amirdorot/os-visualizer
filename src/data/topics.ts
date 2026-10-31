import { useText, type Localized } from '../i18n'
import type { TopicMeta } from '../types'

export const topics: TopicMeta[] = [
  {
    id: 'processes',
    path: '/processes',
    title: 'Processes',
    tagline: 'Programs in execution: states, PCBs, fork, exec, wait and exit.',
    icon: 'process',
    accent: {
      text: 'text-violet-600 dark:text-violet-300',
      bg: 'bg-violet-500',
      soft: 'bg-violet-500/10',
      border: 'border-violet-500/40',
      gradient: 'from-violet-500 to-fuchsia-500',
      hex: '#8b5cf6',
    },
  },
  {
    id: 'threads',
    path: '/threads',
    title: 'Threads',
    tagline: 'Many flows of control in one address space, and why they need locks.',
    icon: 'threads',
    accent: {
      text: 'text-pink-600 dark:text-pink-300',
      bg: 'bg-pink-500',
      soft: 'bg-pink-500/10',
      border: 'border-pink-500/40',
      gradient: 'from-pink-500 to-rose-500',
      hex: '#ec4899',
    },
  },
  {
    id: 'sync',
    path: '/sync',
    title: 'Synchronization',
    tagline: 'Semaphores and the producer-consumer problem: who waits, and when.',
    icon: 'lock',
    accent: {
      text: 'text-cyan-600 dark:text-cyan-300',
      bg: 'bg-cyan-500',
      soft: 'bg-cyan-500/10',
      border: 'border-cyan-500/40',
      gradient: 'from-cyan-500 to-blue-500',
      hex: '#06b6d4',
    },
  },
  {
    id: 'deadlock',
    path: '/deadlock',
    title: 'Deadlock',
    tagline: 'Circular waits, resource allocation graphs and the banker\'s algorithm.',
    icon: 'cycle',
    accent: {
      text: 'text-red-600 dark:text-red-300',
      bg: 'bg-red-500',
      soft: 'bg-red-500/10',
      border: 'border-red-500/40',
      gradient: 'from-red-500 to-orange-600',
      hex: '#ef4444',
    },
  },
  {
    id: 'scheduling',
    path: '/scheduling',
    title: 'CPU Scheduling',
    tagline: 'Who runs next? FCFS, SJF, Round Robin, Priority and context switches.',
    icon: 'cpu',
    accent: {
      text: 'text-amber-600 dark:text-amber-300',
      bg: 'bg-amber-500',
      soft: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      gradient: 'from-amber-500 to-orange-500',
      hex: '#f59e0b',
    },
  },
  {
    id: 'memory',
    path: '/memory',
    title: 'Memory Management',
    tagline: 'Virtual addresses, page tables, page faults and allocation strategies.',
    icon: 'memory',
    accent: {
      text: 'text-emerald-600 dark:text-emerald-300',
      bg: 'bg-emerald-500',
      soft: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      gradient: 'from-emerald-500 to-teal-500',
      hex: '#10b981',
    },
  },
  {
    id: 'storage',
    path: '/storage',
    title: 'Storage & File Systems',
    tagline: 'Blocks, inodes, directories, allocation methods and disk scheduling.',
    icon: 'disk',
    accent: {
      text: 'text-sky-600 dark:text-sky-300',
      bg: 'bg-sky-500',
      soft: 'bg-sky-500/10',
      border: 'border-sky-500/40',
      gradient: 'from-sky-500 to-indigo-500',
      hex: '#0ea5e9',
    },
  },
  {
    id: 'syscalls',
    path: '/syscalls',
    title: 'System Calls',
    tagline: 'Crossing the boundary from user mode into the kernel and back.',
    icon: 'syscall',
    accent: {
      text: 'text-rose-600 dark:text-rose-300',
      bg: 'bg-rose-500',
      soft: 'bg-rose-500/10',
      border: 'border-rose-500/40',
      gradient: 'from-rose-500 to-red-500',
      hex: '#f43f5e',
    },
  },
]

export function topicById(id: string): TopicMeta {
  const t = topics.find((t) => t.id === id)
  if (!t) throw new Error(`Unknown topic ${id}`)
  return t
}

type TopicText = Record<string, { title: string; tagline: string }>

const topicText: Localized<TopicText> = {
  en: Object.fromEntries(topics.map((t) => [t.id, { title: t.title, tagline: t.tagline }])),
  he: {
    processes: { title: 'Processes', tagline: 'תוכניות בהרצה: מצבים, PCB, ‏fork, ‏exec, ‏wait ו-exit.' },
    threads: { title: 'Threads', tagline: 'כמה זרימות ביצוע במרחב כתובות אחד, ולמה הן צריכות נעילות.' },
    sync: { title: 'סנכרון', tagline: 'Semaphores ובעיית ה-producer-consumer: מי מחכה, ומתי.' },
    deadlock: { title: 'Deadlock', tagline: 'המתנה מעגלית, resource allocation graphs וה-banker\'s algorithm.' },
    scheduling: { title: 'תזמון מעבד', tagline: 'מי רץ הבא? FCFS, ‏SJF, ‏Round Robin, ‏Priority ו-context switches.' },
    memory: { title: 'ניהול זיכרון', tagline: 'כתובות וירטואליות, page tables, ‏page faults ואסטרטגיות הקצאה.' },
    storage: { title: 'אחסון ומערכות קבצים', tagline: 'בלוקים, inodes, תיקיות, שיטות הקצאה ותזמון דיסק.' },
    syscalls: { title: 'System calls', tagline: 'המעבר מ-user mode אל ה-kernel ובחזרה.' },
  },
  ar: {
    processes: { title: 'Processes', tagline: 'برامج قيد التنفيذ: الحالات و PCB و fork و exec و wait و exit.' },
    threads: { title: 'Threads', tagline: 'عدة مسارات تنفيذ في مساحة عناوين واحدة، ولماذا تحتاج إلى أقفال.' },
    sync: { title: 'التزامن', tagline: 'Semaphores ومشكلة producer-consumer: من ينتظر ومتى.' },
    deadlock: { title: 'Deadlock', tagline: 'الانتظار الدائري و resource allocation graphs و banker\'s algorithm.' },
    scheduling: { title: 'جدولة المعالج', tagline: 'من يعمل تاليًا؟ FCFS و SJF و Round Robin و Priority و context switches.' },
    memory: { title: 'إدارة الذاكرة', tagline: 'العناوين الافتراضية و page tables و page faults واستراتيجيات التخصيص.' },
    storage: { title: 'التخزين وأنظمة الملفات', tagline: 'الكتل و inodes والمجلدات وطرق التخصيص وجدولة القرص.' },
    syscalls: { title: 'System calls', tagline: 'العبور من user mode إلى الـ kernel والعودة.' },
  },
  es: {
    processes: { title: 'Processes', tagline: 'Programas en ejecución: estados, PCB, fork, exec, wait y exit.' },
    threads: { title: 'Threads', tagline: 'Varios flujos de ejecución en un mismo espacio de direcciones, y por qué necesitan locks.' },
    sync: { title: 'Sincronización', tagline: 'Semaphores y el problema producer-consumer: quién espera y cuándo.' },
    deadlock: { title: 'Deadlock', tagline: 'Esperas circulares, resource allocation graphs y el banker\'s algorithm.' },
    scheduling: { title: 'Planificación de CPU', tagline: '¿Quién se ejecuta ahora? FCFS, SJF, Round Robin, Priority y context switches.' },
    memory: { title: 'Gestión de memoria', tagline: 'Direcciones virtuales, page tables, page faults y estrategias de asignación.' },
    storage: { title: 'Almacenamiento y sistemas de archivos', tagline: 'Bloques, inodes, directorios, métodos de asignación y planificación de disco.' },
    syscalls: { title: 'System calls', tagline: 'Cruzar la frontera entre user mode y el kernel, ida y vuelta.' },
  },
}

/** Topics with their title and tagline in the current language. */
export function useTopics(): TopicMeta[] {
  const text = useText(topicText)
  return topics.map((t) => ({ ...t, ...text[t.id] }))
}

export function useTopic(id: string): TopicMeta {
  return useTopics().find((t) => t.id === id) ?? topicById(id)
}
