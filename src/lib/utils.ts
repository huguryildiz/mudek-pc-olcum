import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function round(n: number | null, decimals = 2): number | null {
  if (n === null) return null
  const factor = Math.pow(10, decimals)
  return Math.round(n * factor) / factor
}

export function formatScore(score: number | null, decimals = 2): string {
  if (score === null) return '—'
  return score.toFixed(decimals)
}

/** Generate a BBO-safe filename (ASCII only) */
export function bboSafeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/[^a-zA-Z0-9._\-]/g, '_')
    .replace(/_+/g, '_')
}

/** Generate document filename per MÜDEK doc-format rules:
 *  [CourseCode]_[Section]_[Semester]_[DocType]_[YYMMDD].EXT
 */
export function generateDocFilename(params: {
  courseCode: string
  section: string
  semester: string   // "2025 Bahar" → "2025B"
  docType: string
  ext: string
  date?: Date
}): string {
  const { courseCode, section, semester, docType, ext, date = new Date() } = params
  const semesterShort = semester
    .replace('Bahar', 'B').replace('Güz', 'G').replace('Yaz', 'Y')
    .replace(' ', '')
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const dateStr = `${yy}${mm}${dd}`
  return `${courseCode}_${section}_${semesterShort}_${docType}_${dateStr}.${ext}`
}

/** Group an array by a key function */
export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item)
    ;(acc[k] ??= []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function nanToNull(v: unknown): number | null {
  if (typeof v !== 'number') return null
  return isNaN(v) ? null : v
}

/** Display PO_ID as Turkish PÇ label for the UI (e.g. 'PO-1' → 'PÇ-1') */
export function poDisplayId(id: string): string {
  return id.replace('PO-', 'PÇ-')
}
