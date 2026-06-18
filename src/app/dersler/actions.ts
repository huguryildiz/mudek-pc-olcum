'use server'

import { getStore, persist } from '@/lib/store'
import { revalidatePath } from 'next/cache'

export async function addCourse(data: {
  code: string
  name: string
  semester: string
  instructors: string[]
}) {
  const store = getStore()
  const id = `course-${Date.now()}`
  store.courses.push({
    id,
    programId: 'prog-1',
    code: data.code.trim().toUpperCase(),
    name: data.name.trim(),
    semester: data.semester.trim(),
    instructors: data.instructors,
    sections: [],
  })
  persist()
  revalidatePath('/dersler')
}
