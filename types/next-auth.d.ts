import 'next-auth'
import { UserRole } from './index'

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    schoolId?: string
    studentId?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: UserRole
      schoolId?: string
      studentId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    schoolId?: string
    studentId?: string
  }
}
