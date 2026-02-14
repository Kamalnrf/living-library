export const PALETTE = ['#E07A5F','#D4726A','#E88D7A','#C9787C','#D4956A','#E6A07A','#C97B7B','#D98B6A']

export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function createSeededRandom(seed: number) {
  let s = seed
  return function () {
    let t = (s += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    d instanceof Date ? d : new Date(d),
  )
}

export function formatMonthYear(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d)
}

export function formatTime(d: string | Date): string {
  if (d instanceof Date) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
  }
  const parsed = new Date(d)
  if (isNaN(parsed.getTime())) return d
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(parsed)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export type BlobStyle = {
  width: number
  height: number
  left: string
  top: string
  background: string
  opacity: number
  borderRadius: string
  transform: string
}

export function generateBlobs(title: string): BlobStyle[] {
  const seed = hashString(title)
  const rand = createSeededRandom(seed)
  const count = 3 + Math.floor(rand())
  const blobs: BlobStyle[] = []

  for (let i = 0; i < count; i++) {
    const size = 30 + rand() * 40
    const left = rand() * 65
    const top = rand() * 35
    const colorIdx = Math.floor(rand() * PALETTE.length)
    const opacity = 0.3 + rand() * 0.3
    const rotation = rand() * 360

    const br: number[] = []
    for (let j = 0; j < 8; j++) br.push(Math.round(30 + rand() * 40))

    blobs.push({
      width: size,
      height: size,
      left: `${left}%`,
      top: `${top}%`,
      background: PALETTE[colorIdx],
      opacity,
      borderRadius: `${br[0]}% ${br[1]}% ${br[2]}% ${br[3]}% / ${br[4]}% ${br[5]}% ${br[6]}% ${br[7]}%`,
      transform: `rotate(${rotation}deg)`,
    })
  }
  return blobs
}

export function generateCelebrationBlob() {
  const size = 14 + Math.random() * 18
  const left = 10 + Math.random() * 80
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]
  const br = Array.from({ length: 8 }, () => Math.round(30 + Math.random() * 40))

  return {
    width: size,
    height: size,
    left: `${left}%`,
    background: color,
    borderRadius: `${br[0]}% ${br[1]}% ${br[2]}% ${br[3]}% / ${br[4]}% ${br[5]}% ${br[6]}% ${br[7]}%`,
  }
}
