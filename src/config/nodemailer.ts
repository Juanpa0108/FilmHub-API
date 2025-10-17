import nodemailer, { Transporter } from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Email configuration interface.
 */
interface EmailConfig {
    host: string
    port: number
    auth: {
        user: string
        pass: string
    }
}

/**
 * Configuration for the email transport.
 * Values are retrieved from environment variables.
 *
 * @function
 * @returns {Object} Nodemailer configuration object
 * @property {string} host - SMTP server of the email provider
 * @property {number} port - SMTP port (e.g., 465 or 587)
 * @property {Object} auth - Authentication credentials
 * @property {string} auth.user - Email account username
 * @property {string} auth.pass - Email account password or app token
 */
const config = (): EmailConfig => {
    return {
        host: process.env.EMAIL_HOST || '',
        port: +(process.env.EMAIL_PORT || 587),
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        }
    }
}

/**
 * Nodemailer transport instance configured with credentials.
 *
 * @constant {import("nodemailer").Transporter}
 */
export const transport: Transporter = nodemailer.createTransport(config())