export type Layer = 'app' | 'libc' | 'entry' | 'kernel' | 'fs' | 'driver' | 'hardware'
export type SyscallName = 'read' | 'write' | 'getpid'

export interface SyscallStep {
  layer: Layer
  mode: 'user' | 'kernel'
  title: string
  detail: string
  registers: Record<string, string>
  processState: 'running' | 'waiting'
}

export const layers: { id: Layer; label: string; space: 'user' | 'kernel' | 'hardware' }[] = [
  { id: 'app', label: 'Application code', space: 'user' },
  { id: 'libc', label: 'C library (libc)', space: 'user' },
  { id: 'entry', label: 'System call entry / dispatch table', space: 'kernel' },
  { id: 'kernel', label: 'Kernel service (VFS, process mgmt)', space: 'kernel' },
  { id: 'fs', label: 'File system / page cache', space: 'kernel' },
  { id: 'driver', label: 'Device driver', space: 'kernel' },
  { id: 'hardware', label: 'Disk / terminal hardware', space: 'hardware' },
]

export const syscallNumbers: Record<SyscallName, number> = { read: 0, write: 1, getpid: 39 }

export function syscallSteps(name: SyscallName): SyscallStep[] {
  const nr = syscallNumbers[name]
  const args =
    name === 'read'
      ? { rdi: '3 (fd)', rsi: '0x7ffd10 (buf)', rdx: '4096 (count)' }
      : name === 'write'
        ? { rdi: '1 (stdout)', rsi: '0x601040 (msg)', rdx: '13 (count)' }
        : { rdi: '-', rsi: '-', rdx: '-' }
  const loaded = { rax: `${nr} (${name})`, ...args }
  const call = name === 'read' ? 'n = read(fd, buf, 4096);' : name === 'write' ? 'write(1, "Hello, world\\n", 13);' : 'pid = getpid();'
  const ret = name === 'read' ? '4096 (bytes read)' : name === 'write' ? '13 (bytes written)' : '1234 (pid)'

  const steps: SyscallStep[] = [
    { layer: 'app', mode: 'user', title: 'The program makes a call', detail: `The application executes ${call} It looks like an ordinary function call.`, registers: { rax: '-', rdi: '-', rsi: '-', rdx: '-' }, processState: 'running' },
    { layer: 'libc', mode: 'user', title: 'libc wrapper prepares the trap', detail: `The libc wrapper puts the system call number ${nr} in rax and the arguments in rdi, rsi, rdx, following the system call ABI.`, registers: loaded, processState: 'running' },
    { layer: 'entry', mode: 'kernel', title: 'syscall instruction: trap into the kernel', detail: 'The CPU switches to kernel mode, saves the user instruction pointer and stack, and jumps to the kernel entry point configured at boot. User code cannot jump here any other way.', registers: loaded, processState: 'running' },
    { layer: 'kernel', mode: 'kernel', title: `Dispatch: sys_call_table[${nr}]`, detail: `The kernel validates the number and calls the handler sys_${name}(). ${name === 'getpid' ? 'It reads the PID from the current process control block.' : 'It looks up the file descriptor in the process file table and checks permissions and that the buffer is a valid user address.'}`, registers: loaded, processState: 'running' },
  ]

  if (name === 'read') {
    steps.push(
      { layer: 'fs', mode: 'kernel', title: 'File system and page cache', detail: 'The VFS asks the file system which disk blocks hold the requested range. The data is not in the page cache, so a disk read is needed.', registers: loaded, processState: 'running' },
      { layer: 'driver', mode: 'kernel', title: 'Driver issues the I/O', detail: 'The block driver queues a request to the disk controller. The process is put to sleep (Waiting) and the scheduler runs another process meanwhile.', registers: loaded, processState: 'waiting' },
      { layer: 'hardware', mode: 'kernel', title: 'Disk transfers the data (DMA)', detail: 'The disk reads the blocks and copies them into memory via DMA, then raises an interrupt. The interrupt handler wakes our process (Ready).', registers: loaded, processState: 'waiting' },
      { layer: 'fs', mode: 'kernel', title: 'copy_to_user()', detail: 'The data now sits in the page cache. The kernel copies the bytes into the user buffer at 0x7ffd10, carefully, because it is user memory.', registers: loaded, processState: 'running' },
    )
  } else if (name === 'write') {
    steps.push(
      { layer: 'fs', mode: 'kernel', title: 'copy_from_user()', detail: 'fd 1 is a terminal, so the VFS routes the call to the tty layer. The kernel copies the 13 bytes from user memory into a kernel buffer.', registers: loaded, processState: 'running' },
      { layer: 'driver', mode: 'kernel', title: 'TTY / console driver', detail: 'The terminal driver queues the characters for output. This is fast, so the process does not need to block.', registers: loaded, processState: 'running' },
      { layer: 'hardware', mode: 'kernel', title: 'Characters reach the screen', detail: 'The display or pseudo-terminal receives "Hello, world".', registers: loaded, processState: 'running' },
    )
  }

  steps.push(
    { layer: 'entry', mode: 'kernel', title: 'Return value placed in rax', detail: `The handler returns ${ret}. The kernel stores it in rax, restores the saved user registers and executes sysret.`, registers: { ...loaded, rax: ret }, processState: 'running' },
    { layer: 'libc', mode: 'user', title: 'Back in user mode', detail: 'The CPU drops back to user mode. The libc wrapper checks for a negative error code (and would set errno) and returns.', registers: { ...loaded, rax: ret }, processState: 'running' },
    { layer: 'app', mode: 'user', title: 'The program continues', detail: `The call returned ${ret}. The program carries on with the next line as if it had called a normal function.`, registers: { ...loaded, rax: ret }, processState: 'running' },
  )
  return steps
}
