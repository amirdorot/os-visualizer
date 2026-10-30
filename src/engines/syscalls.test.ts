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

  it('getpid never touches a device', () => {
    expect(syscallSteps('getpid').some((s) => s.layer === 'driver' || s.layer === 'hardware')).toBe(false)
  })
})
