// ────────────────────────────────────────────────────────
// Core domain types for MÜDEK accreditation system
// NULL semantics: null = "ölçülmedi" (unmeasured) ≠ 0
// ────────────────────────────────────────────────────────

export type PO_ID = `PO-${1|2|3|4|5|6|7|8|9|10|11}`

export const ALL_POS: PO_ID[] = [
  'PO-1','PO-2','PO-3','PO-4','PO-5','PO-6',
  'PO-7','PO-8','PO-9','PO-10','PO-11',
]

export const PO_LABELS: Record<PO_ID, string> = {
  'PO-1':  'Mühendislik Bilgisi',
  'PO-2':  'Problem Analizi',
  'PO-3':  'Mühendislik Tasarımı',
  'PO-4':  'Teknik ve Araçların Kullanımı',
  'PO-5':  'Araştırma ve İnceleme',
  'PO-6':  'Mühendislik Uygulamalarının Küresel Etkisi',
  'PO-7':  'Etik Davranış',
  'PO-8':  'Bireysel ve Takım Çalışması',
  'PO-9':  'Sözlü ve Yazılı İletişim',
  'PO-10': 'Proje Yönetimi',
  'PO-11': 'Yaşam Boyu Öğrenme',
}

export const PO_DESCRIPTIONS: Record<PO_ID, string> = {
  'PO-1':  'Matematik, fen bilimleri, temel mühendislik, bilgisayarla hesaplama ve ilgili mühendislik disiplinine özgü konularda bilgi; bu bilgileri, karmaşık mühendislik problemlerinin çözümünde kullanabilme becerisi.',
  'PO-2':  'Karmaşık mühendislik problemlerini, temel bilim, matematik ve mühendislik bilgilerini kullanarak ve ele alınan problemle ilgili BM Sürdürülebilir Kalkınma Amaçlarını gözeterek tanımlama, formüle etme ve analiz becerisi.',
  'PO-3':  'Karmaşık mühendislik problemlerine yaratıcı çözümler tasarlama becerisi; karmaşık sistemleri, süreçleri, cihazları veya ürünleri gerçekçi kısıtları ve koşulları gözeterek, mevcut ve gelecekteki gereksinimleri karşılayacak biçimde tasarlama becerisi.',
  'PO-4':  'Karmaşık mühendislik problemlerinin analizi ve çözümüne yönelik, tahmin ve modelleme de dahil olmak üzere, uygun teknikleri, kaynakları ve modern mühendislik ve bilişim araçlarını, sınırlamalarının da farkında olarak seçme ve kullanma becerisi.',
  'PO-5':  'Karmaşık mühendislik problemlerinin incelenmesi için literatür araştırması, deney tasarlama, deney yapma, veri toplama, sonuçları analiz etme ve yorumlama dahil, araştırma yöntemlerini kullanma becerisi.',
  'PO-6':  'Mühendislik uygulamalarının BM Sürdürülebilir Kalkınma Amaçları kapsamında, topluma, sağlık ve güvenliğe, ekonomiye, sürdürülebilirlik ve çevreye etkileri hakkında bilgi; mühendislik çözümlerinin hukuksal sonuçları konusunda farkındalık.',
  'PO-7':  'Mühendislik meslek ilkelerine uygun davranma, etik sorumluluk hakkında bilgi; hiçbir konuda ayrımcılık yapmadan, tarafsız davranma ve çeşitliliği kapsayıcı olma konularında farkındalık.',
  'PO-8':  'Bireysel olarak ve disiplin içi ve çok disiplinli takımlarda (yüz yüze, uzaktan veya karma) takım üyesi veya lideri olarak etkin biçimde çalışabilme becerisi.',
  'PO-9':  'Hedef kitlenin çeşitli farklılıklarını (eğitim, dil, meslek gibi) dikkate alarak, teknik konularda sözlü, yazılı etkin iletişim kurma becerisi.',
  'PO-10': 'Proje yönetimi ve ekonomik yapılabilirlik analizi gibi iş hayatındaki uygulamalar hakkında bilgi; girişimcilik ve yenilikçilik hakkında farkındalık.',
  'PO-11': 'Bağımsız ve sürekli öğrenebilme, yeni ve gelişmekte olan teknolojilere uyum sağlayabilme ve teknolojik değişimlerle ilgili sorgulayıcı düşünebilmeyi kapsayan yaşam boyu öğrenme becerisi.',
}

// ── Assessment item definition ───────────────────────────
export interface AssessmentItem {
  id: string
  courseId: string
  code: string
  label: string
  group: string
  groupLabel: string
  order: number
  normFactor: number
  maxRaw: number
}

// ── Learning Outcome definition ──────────────────────────
export interface LODefinition {
  id: string
  courseId: string
  code: string
  label: string
  itemWeights: { itemId: string; weight: number }[]
  poContributions: { poId: PO_ID; weight: number }[]
}

// ── Curriculum map entry: course → PO weight ────────────
export interface CurriculumMapEntry {
  courseCode: string
  poWeights: Partial<Record<PO_ID, number>>
}

// ── Program ──────────────────────────────────────────────
export interface Program {
  id: string
  name: string
  code: string
  curriculumMap: CurriculumMapEntry[]
}

// ── Course ───────────────────────────────────────────────
export interface Course {
  id: string
  programId: string
  code: string
  name: string
  semester: string
  instructors: string[]
  sections: string[]
}

// ── Student ──────────────────────────────────────────────
export interface Student {
  id: string
  studentNo: string
  name: string
}

// ── Enrollment ───────────────────────────────────────────
export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  section: string
}

// ── Score (leaf measurement) ─────────────────────────────
// null raw = unmeasured (excluded from averages)
export interface Score {
  id: string
  enrollmentId: string
  itemId: string
  raw: number | null
}

// ── Evidence file metadata ───────────────────────────────
export interface EvidenceFile {
  id: string
  courseId: string
  originalName: string
  storedName: string
  category: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy?: string
  // AssessmentItem id'leri: dosyanın hangi soruları kanıtladığı.
  // Boş/yok = hiçbir PÇ'ye düşmez (PÇ bağı Soru→ÖÇ→PÇ zincirinden türetilir).
  itemIds?: string[]
}

// ── PÇ kanıt ağacı (drawer için türetilmiş görünüm) ──────
export interface POEvidenceItemNode {
  itemId: string
  itemCode: string
  itemLabel: string
  files: EvidenceFile[]
}

export interface POEvidenceLONode {
  loId: string
  loCode: string
  loLabel: string
  items: POEvidenceItemNode[]
}

export interface POEvidenceCourseNode {
  courseId: string
  courseCode: string
  courseName: string
  los: POEvidenceLONode[]
}

export interface POEvidenceTree {
  poId: PO_ID
  courses: POEvidenceCourseNode[]
  totalFiles: number
}

// ── Engine result types ───────────────────────────────────

export interface StudentLOResult {
  loId: string
  loCode: string
  score: number | null
}

export interface StudentPOResult {
  poId: PO_ID
  score: number | null
}

export interface CourseStudentResult {
  enrollmentId: string
  studentId: string
  studentName: string
  loScores: StudentLOResult[]
  poScores: StudentPOResult[]
}

export interface CourseResult {
  courseId: string
  students: CourseStudentResult[]
  coursePOAvg: Record<PO_ID, number | null>
}

export interface ProgramPOResult {
  poId: PO_ID
  studentScores: { studentId: string; studentName: string; score: number | null }[]
  programAvg: number | null
}

// ── Attainment threshold ─────────────────────────────────
// Scores 0-5 scale, thresholds default: below<2.5, border 2.5-3, above≥3
export type AttainmentLevel = 'below' | 'border' | 'above' | 'unmeasured'

export function attainmentLevel(
  score: number | null,
  thresholdBelow = 2.5,
  thresholdAbove = 3.0,
): AttainmentLevel {
  if (score === null) return 'unmeasured'
  if (score < thresholdBelow) return 'below'
  if (score < thresholdAbove) return 'border'
  return 'above'
}
