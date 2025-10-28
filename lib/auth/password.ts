import bcrypt from 'bcryptjs'

/**
 * Vérifie si un mot de passe correspond au hash
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Hash un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}
