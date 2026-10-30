import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'

const ProcessesPage = lazy(() => import('./topics/processes/ProcessesPage'))
const ThreadsPage = lazy(() => import('./topics/threads/ThreadsPage'))
const SchedulingPage = lazy(() => import('./topics/scheduling/SchedulingPage'))
const MemoryPage = lazy(() => import('./topics/memory/MemoryPage'))
const StoragePage = lazy(() => import('./topics/storage/StoragePage'))
const SyscallsPage = lazy(() => import('./topics/syscalls/SyscallsPage'))
const QuizHub = lazy(() => import('./pages/QuizHub'))
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'))

function Loading() {
  return <div className="p-12 text-center text-muted">Loading...</div>
}

function wrap(node: ReactNode) {
  return <Suspense fallback={<Loading />}>{node}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'processes', element: wrap(<ProcessesPage />) },
      { path: 'threads', element: wrap(<ThreadsPage />) },
      { path: 'scheduling', element: wrap(<SchedulingPage />) },
      { path: 'memory', element: wrap(<MemoryPage />) },
      { path: 'storage', element: wrap(<StoragePage />) },
      { path: 'syscalls', element: wrap(<SyscallsPage />) },
      { path: 'quiz', element: wrap(<QuizHub />) },
      { path: 'glossary', element: wrap(<GlossaryPage />) },
      {
        path: '*',
        element: <div className="p-12 text-center text-muted">Page not found.</div>,
      },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })

export default function App() {
  return <RouterProvider router={router} />
}
