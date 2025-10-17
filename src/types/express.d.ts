import { IUser } from '../interfaces/UserInterface'

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export {}
