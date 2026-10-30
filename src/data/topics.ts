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
