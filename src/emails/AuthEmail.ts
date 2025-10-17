import { transport } from '../config/nodemailer'

/**
 * User information interface for email sending.
 */
interface EmailUser {
    name: string
    email: string
    id: string
}

/**
 * Class for handling authentication-related emails.
 */
export class AuthEmail {
    /**
     * Sends a confirmation email to reset the user's password.
     *
     * @async
     * @function sendConfirmationEmail
     * @memberof AuthEmail
     * @static
     * @param {Object} user - User information.
     * @param {string} user.name - User's name.
     * @param {string} user.email - User's email address.
     * @param {string} user.id - Unique ID to reset the password.
     * @returns {Promise<void>} - Does not return anything, only sends the email.
     */
    static sendConfirmationEmail = async (user: EmailUser): Promise<void> => {
        const email = await transport.sendMail({
            from: 'Task App - Project Manager <admin@filmhub.com>',
            to: user.email,
            subject: 'Reset your password on FilmHub',
            html: `
                <p>Hello ${user.name}, you have requested to reset your password on FilmHub.</p>
                <p>Click the following link to generate a new one: 
                <a href="${process.env.FRONTEND_URL}/resetPassword?id=${user.id}">Reset Password</a></p>
                <p>If you did not request this change, you can ignore this message.</p>
            `
        })
        console.log('message sent', email.messageId)
    }
}