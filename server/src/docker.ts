import { readFileSync, statSync } from 'node:fs'

let isDockerCached: boolean

function hasDockerEnv() {
  try {
    statSync('/.dockerenv')
    return true
  } catch {
    return false
  }
}

function hasDockerCGroup() {
  try {
    return readFileSync('/proc/self/cgroup', 'utf8').includes('docker')
  } catch {
    return false
  }
}

export function isDocker() {
  if (isDockerCached === undefined) {
    isDockerCached = hasDockerEnv() || hasDockerCGroup()
  }

  return isDockerCached
}
