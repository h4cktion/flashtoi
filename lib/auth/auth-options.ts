import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/db/mongodb'
import Student from '@/lib/db/models/Student'
import School from '@/lib/db/models/School'
import Admin from '@/lib/db/models/Admin'
import { verifyPassword } from './password'

export const authOptions: NextAuthConfig = {
  providers: [
    // Provider 1: Parent Authentication (QR Code or Login/Password)
    Credentials({
      id: 'parent',
      name: 'Parent',
      credentials: {
        identifier: { label: 'QR Code or Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          // Find student by QR code or login code
          const student = await Student.findOne({
            $or: [
              { qrCode: credentials.identifier },
              { loginCode: credentials.identifier },
            ],
          }).select('+password')
          if (!student) {
            return null
          }

          // Verify password
          const isPasswordValid = await verifyPassword(
            credentials.password as string,
            student.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Return user object for session
          return {
            id: student._id.toString(),
            name: `${student.firstName} ${student.lastName}`,
            email: null,
            role: 'parent' as const,
            studentId: student._id.toString(),
            schoolId: student.schoolId.toString(),
          }
        } catch (error) {
          console.error('Parent auth error:', error)
          return null
        }
      },
    }),

    // Provider: QR Code Auto-Login (no password required)
    Credentials({
      id: 'qr-autologin',
      name: 'QR Auto Login',
      credentials: {
        qrCode: { label: 'QR Code', type: 'text' },
      },
      async authorize(credentials) {
        console.log('[QR Provider] Starting authorization with credentials:', credentials)

        if (!credentials?.qrCode) {
          console.error('[QR Provider] No qrCode provided')
          return null
        }

        try {
          console.log('[QR Provider] Connecting to MongoDB')
          await connectDB()

          console.log('[QR Provider] Searching for student with qrCode:', credentials.qrCode)
          // Find student by QR code only
          const student = await Student.findOne({
            qrCode: credentials.qrCode,
          })

          if (!student) {
            console.error('[QR Provider] Student not found')
            return null
          }

          console.log('[QR Provider] Student found:', student._id.toString())

          // Return user object for session (no password verification)
          return {
            id: student._id.toString(),
            name: `${student.firstName} ${student.lastName}`,
            email: null,
            role: 'parent' as const,
            studentId: student._id.toString(),
            schoolId: student.schoolId.toString(),
          }
        } catch (error) {
          console.error('[QR Provider] Error:', error)
          return null
        }
      },
    }),

    // Provider 2: School Authentication (Login/Password)
    Credentials({
      id: 'school',
      name: 'School',
      credentials: {
        loginCode: { label: 'Login Code', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.loginCode || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          // Find school by login code
          const school = await School.findOne({
            loginCode: credentials.loginCode,
          }).select('+password')

          if (!school) {
            return null
          }

          // Verify password
          const isPasswordValid = await verifyPassword(
            credentials.password as string,
            school.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Return user object for session
          return {
            id: school._id.toString(),
            name: school.name,
            email: school.email,
            role: 'school' as const,
            schoolId: school._id.toString(),
          }
        } catch (error) {
          console.error('School auth error:', error)
          return null
        }
      },
    }),

    // Provider 3: Admin Authentication (Email/Password)
    Credentials({
      id: 'admin',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          // Find admin by email
          const admin = await Admin.findOne({
            email: credentials.email,
          }).select('+password')

          if (!admin) {
            return null
          }

          // Verify password
          const isPasswordValid = await verifyPassword(
            credentials.password as string,
            admin.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Return user object for session
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: 'admin' as const,
          }
        } catch (error) {
          console.error('Admin auth error:', error)
          return null
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Add custom fields to JWT token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.schoolId = user.schoolId
        token.studentId = user.studentId
      }
      return token
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'parent' | 'school' | 'admin'
        session.user.schoolId = token.schoolId as string | undefined
        session.user.studentId = token.studentId as string | undefined
      }
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}
