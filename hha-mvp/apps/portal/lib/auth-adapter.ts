// File-based mock adapter for NextAuth in development
// Stores sessions in memory/file instead of database

import * as fs from 'fs'
import * as path from 'path'

const SESSIONS_FILE = path.join(process.cwd(), '.next', 'auth-sessions.json')

interface SessionData {
  sessionToken: string
  userId: string
  expires: number
}

interface UserData {
  id: string
  email: string
  name?: string
  emailVerified?: number
}

export class FileBasedAdapter {
  private sessions: Map<string, SessionData> = new Map()
  private users: Map<string, UserData> = new Map()

  constructor() {
    this.loadSessions()
  }

  private loadSessions() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const data = fs.readFileSync(SESSIONS_FILE, 'utf-8')
        const parsed = JSON.parse(data)
        this.sessions = new Map(Object.entries(parsed.sessions || {}))
        this.users = new Map(Object.entries(parsed.users || {}))
      }
    } catch (error) {
      // Ignore errors on load
    }
  }

  private saveSessions() {
    try {
      const dir = path.dirname(SESSIONS_FILE)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(
        SESSIONS_FILE,
        JSON.stringify({
          sessions: Object.fromEntries(this.sessions),
          users: Object.fromEntries(this.users),
        }),
        'utf-8'
      )
    } catch (error) {
      // Ignore errors on save
    }
  }

  async createUser(user: Omit<UserData, 'id'>) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newUser = { ...user, id }
    this.users.set(id, newUser)
    this.saveSessions()
    return newUser
  }

  async getUser(id: string) {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async createSession(data: { sessionToken: string; userId: string; expires: Date }) {
    const session: SessionData = {
      sessionToken: data.sessionToken,
      userId: data.userId,
      expires: data.expires.getTime(),
    }
    this.sessions.set(data.sessionToken, session)
    this.saveSessions()
    return session
  }

  async getSessionAndUser(sessionToken: string) {
    const session = this.sessions.get(sessionToken)
    if (!session) return null

    if (session.expires < Date.now()) {
      this.sessions.delete(sessionToken)
      this.saveSessions()
      return null
    }

    const user = this.users.get(session.userId)
    if (!user) return null

    return {
      session: {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: new Date(session.expires),
      },
      user,
    }
  }

  async updateSession(data: { sessionToken: string; expires?: Date }) {
    const session = this.sessions.get(data.sessionToken)
    if (!session) return null

    if (data.expires) {
      session.expires = data.expires.getTime()
    }

    this.sessions.set(data.sessionToken, session)
    this.saveSessions()
    return session
  }

  async deleteSession(sessionToken: string) {
    this.sessions.delete(sessionToken)
    this.saveSessions()
  }
}

