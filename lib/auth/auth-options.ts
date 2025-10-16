import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/mongodb'
import Student from '@/lib/db/models/Student'
import School from '@/lib/db/models/School'

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
          const isPasswordValid = await bcrypt.compare(
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
          const isPasswordValid = await bcrypt.compare(
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
        session.user.role = token.role as 'parent' | 'school'
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
}
