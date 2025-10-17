import { Document } from 'mongoose'

/**
 * User interface for TypeScript type definitions.
 * 
 * Represents a user in the database with all properties and methods.
 */
export interface IUser extends Document {
  /** User's first name */
  firstName: string
  
  /** User's last name */
  lastName: string
  
  /** User's age */
  age: number
  
  /** User's email address */
  email: string
  
  /** Hashed password */
  password: string
  
  /** Failed login attempts count */
  loginAttempts?: number
  
  /** Date until the user account is locked */
  lockUntil?: Date
  
  /** Account creation date */
  createdAt: Date
  
  /** Account last update date */
  updatedAt: Date
  
  // Instance methods
  /** Checks if the user account is currently locked */
  isLocked(): boolean
  
  /** Increments the failed login attempts counter */
  incLoginAttempts(): Promise<any>
  
  /** Resets the failed login attempts counter */
  resetLoginAttempts(): Promise<any>
}

/**
 * User creation data interface.
 * Used for creating new users without including auto-generated fields.
 */
export interface IUserCreateData {
  firstName: string
  lastName: string
  age: number
  email: string
  password: string
}

/**
 * User update data interface.
 * All fields are optional for partial updates.
 */
export interface IUserUpdateData {
  firstName?: string
  lastName?: string
  age?: number
  email?: string
  password?: string
}

/**
 * User response interface.
 * Used for API responses, excludes sensitive data like password.
 */
export interface IUserResponse {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
  createdAt: Date
  updatedAt?: Date
}

/**
 * User login credentials interface.
 */
export interface IUserLogin {
  email: string
  password: string
}

/**
 * User password change interface.
 */
export interface IUserPasswordChange {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}
