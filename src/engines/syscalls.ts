export type Layer = 'app' | 'libc' | 'entry' | 'kernel' | 'fs' | 'driver' | 'hardware'
export type SyscallName = 'read' | 'write' | 'getpid'

export interface RetValue {
  value: number
  note: 'bytesRead' | 'bytesWritten' | 'pid'
}

/** A register value with an optional annotation. Notes other than the return value notes are code names. */
export interface RegValue {
  value: string
  note?: 'fd' | 'buf' | 'count' | 'stdout' | 'msg' | SyscallName | RetValue['note']
}

export type SyscallMsg =
  | { k: 'call'; code: string }
  | { k: 'wrapper'; nr: number }
  | { k: 'trap' }
  | { k: 'dispatch'; nr: number; name: SyscallName }
  | { k: 'readFs' }
  | { k: 'readDriver' }
  | { k: 'readDisk' }
  | { k: 'readCopy' }
  | { k: 'writeCopy' }
  | { k: 'writeDriver' }
  | { k: 'writeScreen' }
  | { k: 'retval'; ret: RetValue }
  | { k: 'backUser' }
  | { k: 'continue'; ret: RetValue }

export interface SyscallStep {
  layer: Layer
  mode: 'user' | 'kernel'
  msg: SyscallMsg
  registers: Record<string, RegValue>
  processState: 'running' | 'waiting'
}

export const layers: { id: Layer; space: 'user' | 'kernel' | 'hardware' }[] = [
  { id: 'app', space: 'user' },
  { id: 'libc', space: 'user' },
  { id: 'entry', space: 'kernel' },
  { id: 'kernel', space: 'kernel' },
  { id: 'fs', space: 'kernel' },
  { id: 'driver', space: 'kernel' },
  { id: 'hardware', space: 'hardware' },
]

export const syscallNumbers: Record<SyscallName, number> = { read: 0, write: 1, getpid: 39 }

export function syscallSteps(name: SyscallName): SyscallStep[] {
  const nr = syscallNumbers[name]
  const none: RegValue = { value: '-' }
  const args: Record<string, RegValue> =
    name === 'read'
      ? { rdi: { value: '3', note: 'fd' }, rsi: { value: '0x7ffd10', note: 'buf' }, rdx: { value: '4096', note: 'count' } }
      : name === 'write'
        ? { rdi: { value: '1', note: 'stdout' }, rsi: { value: '0x601040', note: 'msg' }, rdx: { value: '13', note: 'count' } }
        : { rdi: none, rsi: none, rdx: none }
  const loaded = { rax: { value: `${nr}`, note: name }, ...args }
  const call = name === 'read' ? 'n = read(fd, buf, 4096);' : name === 'write' ? 'write(1, "Hello, world\\n", 13);' : 'pid = getpid();'
  const ret: RetValue = name === 'read' ? { value: 4096, note: 'bytesRead' } : name === 'write' ? { value: 13, note: 'bytesWritten' } : { value: 1234, note: 'pid' }
  const returned = { ...loaded, rax: { value: `${ret.value}`, note: ret.note } }

  const steps: SyscallStep[] = [
    { layer: 'app', mode: 'user', msg: { k: 'call', code: call }, registers: { rax: none, rdi: none, rsi: none, rdx: none }, processState: 'running' },
    { layer: 'libc', mode: 'user', msg: { k: 'wrapper', nr }, registers: loaded, processState: 'running' },
    { layer: 'entry', mode: 'kernel', msg: { k: 'trap' }, registers: loaded, processState: 'running' },
    { layer: 'kernel', mode: 'kernel', msg: { k: 'dispatch', nr, name }, registers: loaded, processState: 'running' },
  ]

  if (name === 'read') {
    steps.push(
      { layer: 'fs', mode: 'kernel', msg: { k: 'readFs' }, registers: loaded, processState: 'running' },
      { layer: 'driver', mode: 'kernel', msg: { k: 'readDriver' }, registers: loaded, processState: 'waiting' },
      { layer: 'hardware', mode: 'kernel', msg: { k: 'readDisk' }, registers: loaded, processState: 'waiting' },
      { layer: 'fs', mode: 'kernel', msg: { k: 'readCopy' }, registers: loaded, processState: 'running' },
    )
  } else if (name === 'write') {
    steps.push(
      { layer: 'fs', mode: 'kernel', msg: { k: 'writeCopy' }, registers: loaded, processState: 'running' },
      { layer: 'driver', mode: 'kernel', msg: { k: 'writeDriver' }, registers: loaded, processState: 'running' },
      { layer: 'hardware', mode: 'kernel', msg: { k: 'writeScreen' }, registers: loaded, processState: 'running' },
    )
  }

  steps.push(
    { layer: 'entry', mode: 'kernel', msg: { k: 'retval', ret }, registers: returned, processState: 'running' },
    { layer: 'libc', mode: 'user', msg: { k: 'backUser' }, registers: returned, processState: 'running' },
    { layer: 'app', mode: 'user', msg: { k: 'continue', ret }, registers: returned, processState: 'running' },
  )
  return steps
}
