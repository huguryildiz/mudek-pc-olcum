// ────────────────────────────────────────────────────────
// Synthetic seed data
// 5 students, EE311 + EE492 courses
// At least one NULL score to demonstrate NULL semantics
// ────────────────────────────────────────────────────────

import type { StoreData } from './store'
import type { PO_ID } from './types'

export function createSeedData(): StoreData {
  // ── Program ─────────────────────────────────────────────
  const program = {
    id: 'prog-1',
    name: 'Elektrik-Elektronik Mühendisliği',
    code: 'EEM',
    curriculumMap: [
      {
        courseCode: 'EE311',
        poWeights: { 'PO-1': 1, 'PO-2': 1, 'PO-4': 0.5 } as Partial<Record<PO_ID, number>>,
      },
      {
        courseCode: 'EE492',
        poWeights: {
          'PO-1': 1, 'PO-2': 1, 'PO-3': 1, 'PO-4': 0.75, 'PO-5': 0.75,
          'PO-8': 1, 'PO-9': 1, 'PO-10': 1,
        } as Partial<Record<PO_ID, number>>,
      },
    ],
  }

  // ── Courses ──────────────────────────────────────────────
  const ee311: StoreData['courses'][0] = {
    id: 'course-ee311',
    programId: 'prog-1',
    code: 'EE311',
    name: 'Sinyaller ve Sistemler',
    semester: '2024 Güz',
    instructors: ['H. Uğur Yıldız'],
    sections: ['01'],
  }

  const ee492: StoreData['courses'][0] = {
    id: 'course-ee492',
    programId: 'prog-1',
    code: 'EE492',
    name: 'Bitirme Projesi II',
    semester: '2025 Bahar',
    instructors: ['H. Uğur Yıldız', 'Aykut Yıldız'],
    sections: ['01', 'O-01'],
  }

  // ── Students ─────────────────────────────────────────────
  const students = [
    { id: 's1', studentNo: '22120110001', name: 'Elif Yılmaz' },
    { id: 's2', studentNo: '22120110002', name: 'Mert Demir' },
    { id: 's3', studentNo: '22120110003', name: 'Zeynep Kaya' },
    { id: 's4', studentNo: '22120110004', name: 'Can Aydın' },
    { id: 's5', studentNo: '22120110005', name: 'Selin Şahin' },
  ]

  // ── EE311 Assessment Items ────────────────────────────────
  // Weights: ALE=5%, MT-Q=6.25%, Final-Q=8.75%
  // normFactor: ALE raw÷20, Exam-Q raw÷5
  const ee311Items: StoreData['assessmentItems'] = [
    { id: 'ee311-ale1', courseId: 'course-ee311', code: 'ALE-1', label: 'ALA #1', group: 'ALE', groupLabel: 'Ara Lab Ödevi', order: 1, normFactor: 20, maxRaw: 100 },
    { id: 'ee311-ale2', courseId: 'course-ee311', code: 'ALE-2', label: 'ALA #2', group: 'ALE', groupLabel: 'Ara Lab Ödevi', order: 2, normFactor: 20, maxRaw: 100 },
    { id: 'ee311-ale3', courseId: 'course-ee311', code: 'ALE-3', label: 'ALA #3', group: 'ALE', groupLabel: 'Ara Lab Ödevi', order: 3, normFactor: 20, maxRaw: 100 },
    { id: 'ee311-mt1q1', courseId: 'course-ee311', code: 'MT1-S1', label: 'Vize 1 – Soru 1', group: 'MT1', groupLabel: 'Vize Sınavı I', order: 1, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt1q2', courseId: 'course-ee311', code: 'MT1-S2', label: 'Vize 1 – Soru 2', group: 'MT1', groupLabel: 'Vize Sınavı I', order: 2, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt1q3', courseId: 'course-ee311', code: 'MT1-S3', label: 'Vize 1 – Soru 3', group: 'MT1', groupLabel: 'Vize Sınavı I', order: 3, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt1q4', courseId: 'course-ee311', code: 'MT1-S4', label: 'Vize 1 – Soru 4', group: 'MT1', groupLabel: 'Vize Sınavı I', order: 4, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt2q1', courseId: 'course-ee311', code: 'MT2-S1', label: 'Vize 2 – Soru 1', group: 'MT2', groupLabel: 'Vize Sınavı II', order: 1, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt2q2', courseId: 'course-ee311', code: 'MT2-S2', label: 'Vize 2 – Soru 2', group: 'MT2', groupLabel: 'Vize Sınavı II', order: 2, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt2q3', courseId: 'course-ee311', code: 'MT2-S3', label: 'Vize 2 – Soru 3', group: 'MT2', groupLabel: 'Vize Sınavı II', order: 3, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-mt2q4', courseId: 'course-ee311', code: 'MT2-S4', label: 'Vize 2 – Soru 4', group: 'MT2', groupLabel: 'Vize Sınavı II', order: 4, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-fnq1', courseId: 'course-ee311', code: 'FN-S1',  label: 'Final – Soru 1',  group: 'Final', groupLabel: 'Final Sınavı', order: 1, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-fnq2', courseId: 'course-ee311', code: 'FN-S2',  label: 'Final – Soru 2',  group: 'Final', groupLabel: 'Final Sınavı', order: 2, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-fnq3', courseId: 'course-ee311', code: 'FN-S3',  label: 'Final – Soru 3',  group: 'Final', groupLabel: 'Final Sınavı', order: 3, normFactor: 5, maxRaw: 25 },
    { id: 'ee311-fnq4', courseId: 'course-ee311', code: 'FN-S4',  label: 'Final – Soru 4',  group: 'Final', groupLabel: 'Final Sınavı', order: 4, normFactor: 5, maxRaw: 25 },
  ]

  // ── EE311 Learning Outcomes ───────────────────────────────
  // LO-1: ALE1(5)+MT1Q1(6.25)+MT1Q2(6.25)+FinalQ1(8.75) denom=26.25
  // LO-2: ALE1(5)+MT1Q3(6.25)+MT1Q4(6.25)+FinalQ1(8.75) denom=26.25
  // LO-3: ALE2(5)+MT2Q1(6.25)+MT2Q2(6.25)+FinalQ2(8.75) denom=26.25
  // LO-4: ALE2(5)+MT2Q3(6.25)+MT2Q4(6.25)+FinalQ2(8.75) denom=26.25
  // LO-5: ALE3(5)+FinalQ3(8.75) denom=13.75
  // LO-6: ALE3(5)+FinalQ4(8.75) denom=13.75
  const ee311LOs: StoreData['loDefinitions'] = [
    {
      id: 'ee311-lo1', courseId: 'course-ee311', code: 'ÖÇ-1',
      label: 'Sürekli ve ayrık zamanlı sinyalleri analiz eder',
      itemWeights: [
        { itemId: 'ee311-ale1', weight: 5 },
        { itemId: 'ee311-mt1q1', weight: 6.25 },
        { itemId: 'ee311-mt1q2', weight: 6.25 },
        { itemId: 'ee311-fnq1', weight: 8.75 },
      ],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-4', weight: 0.5 },
      ],
    },
    {
      id: 'ee311-lo2', courseId: 'course-ee311', code: 'ÖÇ-2',
      label: 'Fourier ve Laplace dönüşümlerini uygular',
      itemWeights: [
        { itemId: 'ee311-ale1', weight: 5 },
        { itemId: 'ee311-mt1q3', weight: 6.25 },
        { itemId: 'ee311-mt1q4', weight: 6.25 },
        { itemId: 'ee311-fnq1', weight: 8.75 },
      ],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-4', weight: 0.5 },
      ],
    },
    {
      id: 'ee311-lo3', courseId: 'course-ee311', code: 'ÖÇ-3',
      label: 'Sistem kararlılığını değerlendirir',
      itemWeights: [
        { itemId: 'ee311-ale2', weight: 5 },
        { itemId: 'ee311-mt2q1', weight: 6.25 },
        { itemId: 'ee311-mt2q2', weight: 6.25 },
        { itemId: 'ee311-fnq2', weight: 8.75 },
      ],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-4', weight: 0.5 },
      ],
    },
    {
      id: 'ee311-lo4', courseId: 'course-ee311', code: 'ÖÇ-4',
      label: 'Z-dönüşümü ve ayrık sistemleri analiz eder',
      itemWeights: [
        { itemId: 'ee311-ale2', weight: 5 },
        { itemId: 'ee311-mt2q3', weight: 6.25 },
        { itemId: 'ee311-mt2q4', weight: 6.25 },
        { itemId: 'ee311-fnq2', weight: 8.75 },
      ],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-4', weight: 0.5 },
      ],
    },
    {
      id: 'ee311-lo5', courseId: 'course-ee311', code: 'ÖÇ-5',
      label: 'Sayısal filtre tasarımı yapar',
      itemWeights: [
        { itemId: 'ee311-ale3', weight: 5 },
        { itemId: 'ee311-fnq3', weight: 8.75 },
      ],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-4', weight: 0.5 },
      ],
    },
    {
      id: 'ee311-lo6', courseId: 'course-ee311', code: 'ÖÇ-6',
      label: 'İşaret akışı graflarını yorumlar',
      itemWeights: [
        { itemId: 'ee311-ale3', weight: 5 },
        { itemId: 'ee311-fnq4', weight: 8.75 },
      ],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-4', weight: 0.5 },
      ],
    },
  ]

  // ── EE492 Assessment Items ────────────────────────────────
  const ee492Items: StoreData['assessmentItems'] = [
    { id: 'ee492-ir-proto',  courseId: 'course-ee492', code: 'AR-Prototip',    label: 'Ara Rapor – Prototip',           group: 'IR', groupLabel: 'Ara Rapor', order: 1, normFactor: 10, maxRaw: 50 },
    { id: 'ee492-ir-design', courseId: 'course-ee492', code: 'AR-Tasarım',     label: 'Ara Rapor – Tasarım Yineleme',   group: 'IR', groupLabel: 'Ara Rapor', order: 2, normFactor: 8,  maxRaw: 40 },
    { id: 'ee492-ir-total',  courseId: 'course-ee492', code: 'AR-Toplam',      label: 'Ara Rapor – Toplam',             group: 'IR', groupLabel: 'Ara Rapor', order: 3, normFactor: 20, maxRaw: 100 },
    { id: 'ee492-fr-detail', courseId: 'course-ee492', code: 'SR-Detay',       label: 'Son Rapor – Detay & Maliyet',    group: 'FR', groupLabel: 'Son Rapor', order: 1, normFactor: 4,  maxRaw: 20 },
    { id: 'ee492-fr-team',   courseId: 'course-ee492', code: 'SR-Takım',       label: 'Son Rapor – Takım Çalışması',    group: 'FR', groupLabel: 'Son Rapor', order: 2, normFactor: 3,  maxRaw: 15 },
    { id: 'ee492-fr-total',  courseId: 'course-ee492', code: 'SR-Toplam',      label: 'Son Rapor – Toplam',             group: 'FR', groupLabel: 'Son Rapor', order: 3, normFactor: 20, maxRaw: 100 },
    { id: 'ee492-pp',        courseId: 'course-ee492', code: 'PP-Skor',        label: 'Poster Sunumu',                  group: 'PP', groupLabel: 'Poster Sunumu', order: 1, normFactor: 20, maxRaw: 100 },
  ]

  const ee492LOs: StoreData['loDefinitions'] = [
    {
      id: 'ee492-lo1', courseId: 'course-ee492', code: 'ÖÇ-1',
      label: 'Prototip tasarım sürecini belgeler',
      itemWeights: [{ itemId: 'ee492-ir-proto', weight: 1 }],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-3', weight: 1 },
        { poId: 'PO-4', weight: 0.75 }, { poId: 'PO-5', weight: 0.5 },
      ],
    },
    {
      id: 'ee492-lo2', courseId: 'course-ee492', code: 'ÖÇ-2',
      label: 'Tasarım yinelemelerini açıklar',
      itemWeights: [{ itemId: 'ee492-ir-design', weight: 1 }],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-3', weight: 1 },
        { poId: 'PO-4', weight: 0.75 }, { poId: 'PO-5', weight: 1 },
      ],
    },
    {
      id: 'ee492-lo3', courseId: 'course-ee492', code: 'ÖÇ-3',
      label: 'Tasarım detaylarını ve maliyet analizini sunar',
      itemWeights: [{ itemId: 'ee492-fr-detail', weight: 1 }],
      poContributions: [
        { poId: 'PO-1', weight: 1 }, { poId: 'PO-2', weight: 1 }, { poId: 'PO-3', weight: 1 },
        { poId: 'PO-4', weight: 0.75 }, { poId: 'PO-5', weight: 1 },
      ],
    },
    {
      id: 'ee492-lo4', courseId: 'course-ee492', code: 'ÖÇ-4',
      label: 'Proje yönetimi araçlarını kullanır',
      itemWeights: [
        { itemId: 'ee492-ir-total', weight: 0.25 },
        { itemId: 'ee492-fr-total', weight: 0.45 },
      ],
      poContributions: [{ poId: 'PO-10', weight: 1 }],
    },
    {
      id: 'ee492-lo5', courseId: 'course-ee492', code: 'ÖÇ-5',
      label: 'Poster sunumu hazırlar ve sunar',
      itemWeights: [{ itemId: 'ee492-pp', weight: 1 }],
      poContributions: [{ poId: 'PO-9', weight: 1 }],
    },
    {
      id: 'ee492-lo6', courseId: 'course-ee492', code: 'ÖÇ-6',
      label: 'Ekip içi işbirliği ve iletişim kurar',
      itemWeights: [{ itemId: 'ee492-fr-team', weight: 1 }],
      poContributions: [{ poId: 'PO-8', weight: 1 }, { poId: 'PO-9', weight: 0.5 }],
    },
  ]

  // ── Enrollments ───────────────────────────────────────────
  const enrollments: StoreData['enrollments'] = students.flatMap(s => [
    { id: `enr-${s.id}-ee311`, studentId: s.id, courseId: 'course-ee311', section: '01' },
    { id: `enr-${s.id}-ee492`, studentId: s.id, courseId: 'course-ee492', section: '01' },
  ])

  // ── Synthetic scores ──────────────────────────────────────
  // Each student has realistic scores; Selin Şahin (s5) has NULL for ALE-3 and MT2-Q3
  const ee311Scores: [string, string, number | null][] = [
    // [studentId, itemId, raw]
    // Elif Yılmaz (s1) - strong student
    ['s1','ee311-ale1',90], ['s1','ee311-ale2',85], ['s1','ee311-ale3',95],
    ['s1','ee311-mt1q1',22], ['s1','ee311-mt1q2',20], ['s1','ee311-mt1q3',23], ['s1','ee311-mt1q4',18],
    ['s1','ee311-mt2q1',21], ['s1','ee311-mt2q2',19], ['s1','ee311-mt2q3',20], ['s1','ee311-mt2q4',22],
    ['s1','ee311-fnq1',22], ['s1','ee311-fnq2',20], ['s1','ee311-fnq3',23], ['s1','ee311-fnq4',21],
    // Mert Demir (s2) - average student
    ['s2','ee311-ale1',70], ['s2','ee311-ale2',65], ['s2','ee311-ale3',75],
    ['s2','ee311-mt1q1',16], ['s2','ee311-mt1q2',14], ['s2','ee311-mt1q3',18], ['s2','ee311-mt1q4',15],
    ['s2','ee311-mt2q1',14], ['s2','ee311-mt2q2',12], ['s2','ee311-mt2q3',13], ['s2','ee311-mt2q4',15],
    ['s2','ee311-fnq1',15], ['s2','ee311-fnq2',13], ['s2','ee311-fnq3',14], ['s2','ee311-fnq4',12],
    // Zeynep Kaya (s3) - above average
    ['s3','ee311-ale1',80], ['s3','ee311-ale2',88], ['s3','ee311-ale3',85],
    ['s3','ee311-mt1q1',19], ['s3','ee311-mt1q2',17], ['s3','ee311-mt1q3',20], ['s3','ee311-mt1q4',21],
    ['s3','ee311-mt2q1',18], ['s3','ee311-mt2q2',20], ['s3','ee311-mt2q3',17], ['s3','ee311-mt2q4',19],
    ['s3','ee311-fnq1',18], ['s3','ee311-fnq2',19], ['s3','ee311-fnq3',20], ['s3','ee311-fnq4',17],
    // Can Aydın (s4) - below average
    ['s4','ee311-ale1',55], ['s4','ee311-ale2',60], ['s4','ee311-ale3',50],
    ['s4','ee311-mt1q1',10], ['s4','ee311-mt1q2',12], ['s4','ee311-mt1q3',9], ['s4','ee311-mt1q4',11],
    ['s4','ee311-mt2q1',8],  ['s4','ee311-mt2q2',11], ['s4','ee311-mt2q3',7], ['s4','ee311-mt2q4',10],
    ['s4','ee311-fnq1',9], ['s4','ee311-fnq2',8], ['s4','ee311-fnq3',11], ['s4','ee311-fnq4',7],
    // Selin Şahin (s5) - has two NULL scores (unmeasured)
    ['s5','ee311-ale1',75], ['s5','ee311-ale2',70], ['s5','ee311-ale3',null],  // ALE3 = ölçülmedi
    ['s5','ee311-mt1q1',17], ['s5','ee311-mt1q2',16], ['s5','ee311-mt1q3',19], ['s5','ee311-mt1q4',17],
    ['s5','ee311-mt2q1',15], ['s5','ee311-mt2q2',14], ['s5','ee311-mt2q3',null], ['s5','ee311-mt2q4',16],  // MT2Q3 = ölçülmedi
    ['s5','ee311-fnq1',16], ['s5','ee311-fnq2',15], ['s5','ee311-fnq3',14], ['s5','ee311-fnq4',13],
  ]

  const ee492Scores: [string, string, number | null][] = [
    // [studentId, itemId, raw]
    ['s1','ee492-ir-proto',44], ['s1','ee492-ir-design',38], ['s1','ee492-ir-total',90],
    ['s1','ee492-fr-detail',18], ['s1','ee492-fr-team',14], ['s1','ee492-fr-total',87], ['s1','ee492-pp',88],
    ['s2','ee492-ir-proto',40], ['s2','ee492-ir-design',35], ['s2','ee492-ir-total',84],
    ['s2','ee492-fr-detail',16], ['s2','ee492-fr-team',12], ['s2','ee492-fr-total',82], ['s2','ee492-pp',83],
    ['s3','ee492-ir-proto',46], ['s3','ee492-ir-design',39], ['s3','ee492-ir-total',92],
    ['s3','ee492-fr-detail',19], ['s3','ee492-fr-team',15], ['s3','ee492-fr-total',91], ['s3','ee492-pp',90],
    ['s4','ee492-ir-proto',35], ['s4','ee492-ir-design',30], ['s4','ee492-ir-total',76],
    ['s4','ee492-fr-detail',14], ['s4','ee492-fr-team',10], ['s4','ee492-fr-total',72], ['s4','ee492-pp',71],
    ['s5','ee492-ir-proto',42], ['s5','ee492-ir-design',36], ['s5','ee492-ir-total',86],
    ['s5','ee492-fr-detail',17], ['s5','ee492-fr-team',13], ['s5','ee492-fr-total',85], ['s5','ee492-pp',87],
  ]

  const scores: StoreData['scores'] = [
    ...ee311Scores.map(([sid, iid, raw]) => ({
      id: `scr-${sid}-${iid}`,
      enrollmentId: `enr-${sid}-ee311`,
      itemId: iid,
      raw: raw as number | null,
    })),
    ...ee492Scores.map(([sid, iid, raw]) => ({
      id: `scr-${sid}-${iid}`,
      enrollmentId: `enr-${sid}-ee492`,
      itemId: iid,
      raw: raw as number | null,
    })),
  ]

  return {
    programs: [program],
    courses: [ee311, ee492],
    assessmentItems: [...ee311Items, ...ee492Items],
    loDefinitions: [...ee311LOs, ...ee492LOs],
    students,
    enrollments,
    scores,
    evidenceFiles: [],
  }
}
