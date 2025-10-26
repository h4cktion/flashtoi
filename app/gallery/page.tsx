import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

export default async function GalleryIndexPage() {
  const session = await auth()

  if (!session || session.user.role !== 'parent') {
    redirect('/login')
  }

  if (session.user.studentId) {
    redirect(`/gallery/${session.user.studentId}`)
  }

  redirect('/login')
}
