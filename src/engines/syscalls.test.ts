import { describe, expect, it } from 'vitest'
import { syscallSteps, type SyscallName } from './syscalls'

function modeSwitches(name: SyscallName) {
  const steps = syscallSteps(name)
  return steps.filter((s, i) => i > 0 && s.mode !== steps[i - 1].mode).length
}

describe('system call walkthrough', () => {
  it.each(['read', 'write', 'getpid'] as const)('%s enters and leaves kernel mode exactly once', (name) => {
    const steps = syscallSteps(name)
    expect(steps[0].mode).toBe('user')
    expect(steps.at(-1)!.mode).toBe('user')
    expect(modeSwitches(name)).toBe(2)
  })

  it('read blocks the process while the disk works', () => {
    expect(syscallSteps('read').some((s) => s.processState === 'waiting')).toBe(true)
  })

  it('returns the result in rax', () => {
    const last = syscallSteps('read').at(-1)!
    expect(last.registers.rax).toEqual({ value: '4096', note: 'bytesRead' })
    expect(last.msg).toEqual({ k: 'continue', ret: { value: 4096, note: 'bytesRead' } })
  })

  it('getpid never touches a device', () => {
    expect(syscallSteps('getpid').some((s) => s.layer === 'driver' || s.layer === 'hardware')).toBe(false)
  })
})
