/*
 * Shareable "ticket stubs" story image (1080×1920) of the books a reader read.
 * Drawn with Canvas 2D in the reader's browser; designed at 540×960 and
 * scaled ×2. Header, tickets and a handwritten tally are centred as one block
 * so one ticket looks as deliberate as four.
 */

export type ShareBook = {
  sessionNo: string
  time: string
  title: string
  tableNo: string
}

type Options = {
  readerName: string
  dateLabel: string // e.g. "28 Oct 2026"
  books: ShareBook[]
}

const W = 540
const H = 960
const SCALE = 2

const C = {
  bg: '#2c2620',
  paper: '#fbf6ec',
  stub: '#d9620e',
  stamp: '#d9620e',
  ink: '#23231f',
  muted: 'rgba(35,35,31,.55)',
  light: '#f3eadb',
  perforation: '#e4d8c0',
}

const SERIF = 'Prata, Georgia, serif'
const MONO = '"Sometype Mono", "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'
const HAND = '"Gloria Hallelujah", cursive'

/** "DIPTI MONALI" → "Dipti", "Dr. Sachin Goel" → "Sachin", "bharati" → "Bharati" */
export function firstName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const word = (parts[0]?.endsWith('.') && parts[1] ? parts[1] : parts[0]) || 'I'
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  // Canvas letterSpacing isn't everywhere yet; draw char by char.
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
  return cx - x - spacing
}

function spacedWidth(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  return [...text].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, -spacing)
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1]
    while (ctx.measureText(`${last}…`).width > maxWidth && last.includes(' ')) {
      last = last.slice(0, last.lastIndexOf(' '))
    }
    kept[maxLines - 1] = `${last}…`
    return kept
  }
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawStamp(ctx: CanvasRenderingContext2D, text: string, right: number, bottom: number, angle: number) {
  ctx.save()
  ctx.font = `700 13px ${MONO}`
  const w = spacedWidth(ctx, text, 1.4) + 18
  const h = 26
  ctx.translate(right - w / 2, bottom - h / 2)
  ctx.rotate(angle)
  roundRect(ctx, -w / 2, -h / 2, w, h, 6)
  ctx.fillStyle = 'rgba(217,98,14,.06)'
  ctx.fill()
  ctx.lineWidth = 2.5
  ctx.strokeStyle = C.stamp
  ctx.stroke()
  ctx.fillStyle = C.stamp
  ctx.textBaseline = 'middle'
  spaced(ctx, text, -w / 2 + 9, 1, 1.4)
  ctx.restore()
}

function drawTicket(
  ctx: CanvasRenderingContext2D,
  book: ShareBook,
  opts: Options,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
) {
  const stubW = 118
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(angle)
  ctx.translate(-w / 2, -h / 2)

  // Paper with shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,.5)'
  ctx.shadowBlur = 22
  ctx.shadowOffsetY = 12
  roundRect(ctx, 0, 0, w, h, 10)
  ctx.fillStyle = C.paper
  ctx.fill()
  ctx.restore()

  // Orange stub
  ctx.save()
  roundRect(ctx, 0, 0, w, h, 10)
  ctx.clip()
  ctx.fillStyle = C.stub
  ctx.fillRect(0, 0, stubW, h)
  ctx.restore()

  // Perforation + notches
  ctx.save()
  ctx.setLineDash([5, 5])
  ctx.lineWidth = 2
  ctx.strokeStyle = C.perforation
  ctx.beginPath()
  ctx.moveTo(stubW, 12)
  ctx.lineTo(stubW, h - 12)
  ctx.stroke()
  ctx.restore()
  ctx.fillStyle = C.bg
  for (const ny of [0, h]) {
    ctx.beginPath()
    ctx.arc(stubW, ny, 11, 0, Math.PI * 2)
    ctx.fill()
  }

  // Stub text
  const big = h >= 240 ? 80 : h >= 170 ? 64 : 46
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `11px ${MONO}`
  const sLabel = 'SESSION'
  const sw = spacedWidth(ctx, sLabel, 2)
  const top = h / 2 - big * 0.62
  ctx.globalAlpha = 0.85
  spaced(ctx, sLabel, stubW / 2 - sw / 2, top, 2)
  ctx.globalAlpha = 1
  ctx.font = `${big}px ${SERIF}`
  ctx.textAlign = 'center'
  ctx.fillText(book.sessionNo, stubW / 2, top + big * 0.95)
  ctx.font = `11px ${MONO}`
  ctx.textAlign = 'left'
  const tw = spacedWidth(ctx, book.time, 0.8)
  spaced(ctx, book.time, stubW / 2 - tw / 2, top + big * 0.95 + 24, 0.8)

  // Main part
  const px = stubW + 20
  const maxW = w - px - 20
  ctx.fillStyle = C.muted
  ctx.font = `10px ${MONO}`
  spaced(ctx, 'ADMIT ONE READER', px, 30, 2.2)

  ctx.fillStyle = C.ink
  const titleSize = h >= 240 ? 32 : h >= 170 ? 24 : 20
  ctx.font = `${titleSize}px ${SERIF}`
  const lines = wrap(ctx, book.title, maxW, h >= 240 ? 3 : h >= 170 ? 3 : 2)
  lines.forEach((line, i) => ctx.fillText(line, px, 34 + titleSize * 1.15 + i * titleSize * 1.2))

  ctx.fillStyle = C.muted
  ctx.font = `11px ${MONO}`
  spaced(ctx, opts.dateLabel.toUpperCase(), px, h - 18, 1.2)

  if (book.tableNo) drawStamp(ctx, `TABLE ${book.tableNo}`, w - 16, h - 12, -0.1)

  ctx.restore()
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function renderShareImage(opts: Options): Promise<Blob> {
  await Promise.all([
    document.fonts.load(`24px Prata`),
    document.fonts.load(`700 13px "Sometype Mono"`),
    document.fonts.load(`13px "Sometype Mono"`),
    document.fonts.load(`600 15px Inter`),
    document.fonts.load(`22px "Gloria Hallelujah"`),
  ]).catch(() => {})
  const logo = await loadImage('/images/logo.webp')

  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // Background with a little film grain
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.08)'
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
  }

  // Header, tickets and tally laid out as one block, centred above the footer
  const books = opts.books.slice(0, 4)
  const n = Math.max(books.length, 1)
  const h = n === 1 ? 250 : n === 2 ? 220 : n === 3 ? 180 : 140
  const gap = n === 4 ? 20 : 30
  const ticketsH = n * h + (n - 1) * gap
  const headSize = n <= 2 ? 46 : 36
  const headerH = 30 + headSize // eyebrow + headline
  const tallyH = 56
  const blockH = headerH + 44 + ticketsH + tallyH
  const top = 40 + Math.max(0, (820 - blockH) / 2)

  ctx.fillStyle = C.light
  ctx.globalAlpha = 0.65
  ctx.font = `12px ${MONO}`
  spaced(ctx, `LIVING STORIES · ${opts.dateLabel.toUpperCase()}`, 44, top + 12, 3)
  ctx.globalAlpha = 1
  ctx.font = `${headSize}px ${SERIF}`
  const headline = `${firstName(opts.readerName)} was there.`
  ctx.fillText(wrap(ctx, headline, W - 88, 1)[0], 44, top + 22 + headSize)

  let y = top + headerH + 44
  const angles = n === 1 ? [-0.03] : [-0.05, 0.035, -0.035, 0.05]
  books.forEach((book, i) => {
    drawTicket(ctx, book, opts, 44, y, W - 88, h, angles[i])
    y += h + gap
  })

  // Handwritten tally under the tickets
  ctx.save()
  ctx.fillStyle = C.light
  ctx.globalAlpha = 0.85
  ctx.font = `22px ${HAND}`
  ctx.textAlign = 'center'
  ctx.translate(W / 2, y - gap + 48)
  ctx.rotate(-0.02)
  ctx.fillText(`${n} human book${n === 1 ? '' : 's'}, read across a table.`, 0, 0)
  ctx.restore()

  // Brand footer
  ctx.textAlign = 'left'
  ctx.font = `600 15px ${SANS}`
  const brand = 'Living Stories Collective'
  const logoW = logo ? 46 : 0
  const brandW = logoW + (logo ? 8 : 0) + ctx.measureText(brand).width
  const bx = W / 2 - brandW / 2
  if (logo) ctx.drawImage(logo, bx, 896 - 12, 46, 24)
  ctx.fillStyle = C.light
  ctx.textBaseline = 'middle'
  ctx.fillText(brand, bx + logoW + (logo ? 8 : 0), 896)
  ctx.textBaseline = 'alphabetic'
  ctx.globalAlpha = 0.7
  ctx.font = `11px ${MONO}`
  const url = 'LIVINGSTORIESCOLLECTIVE.ORG'
  spaced(ctx, url, W / 2 - spacedWidth(ctx, url, 1.2) / 2, 930, 1.2)
  ctx.globalAlpha = 1

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'),
  )
}

/** Share sheet with the image on phones; download elsewhere. */
export async function shareOrDownload(blob: Blob, filename: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: 'I read human books at Living Stories Collective. livingstoriescollective.org' })
      return 'shared'
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'downloaded'
}
