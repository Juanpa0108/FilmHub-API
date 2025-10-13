import { Router } from "express"
import { body } from "express-validator"
import { 
    createAccount, 
    loginUser, 
    logoutUser, 
    getCurrentUser,
    verifyAuth,
    forgotPassword,
    resetPassword,
    getUserById,
    updateUser,
    deleteUserAccount
} from "./handlers/index.js"
import { handleInputErrors } from "./middleware/validation.js"
import { requireAuth, requireGuest } from "./middleware/auth.js"

const router = Router()

/**
 * @module Router
 * @description Main authentication and system access routes.
 */

/**
 * User registration.
 * @name POST /api/users/register
 * @function
 * @memberof module:Router
 * @param {string} firstName - User's first name (minimum 2, maximum 50 characters).
 * @param {string} lastName - User's last name (minimum 2, maximum 50 characters).
 * @param {string} email - Valid email address.
 * @param {number} age - User's age (between 12 and 120).
 * @param {string} password - Password with at least 8 characters, including uppercase, lowercase, and number.
 */
router.post(
    "/api/users/register",
    requireGuest,
    body("firstName")
        .notEmpty().withMessage("El nombre es obligatorio")
        .trim().isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),
    body("lastName")
        .notEmpty().withMessage("El apellido es obligatorio")
        .trim().isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres"),
    body("email")
        .isEmail().withMessage("El email no es válido")
        .normalizeEmail(),
    body("age")
        .isInt({ min: 12, max: 120 }).withMessage("La edad debe estar entre 12 y 120 años")
        .toInt(),
    body("password")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener mínimo 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("La contraseña debe contener al menos: una mayúscula, una minúscula y un número"),
    handleInputErrors,
    createAccount
)

/**
 * User login.
 * @name POST /api/auth/login
 * @function
 * @memberof module:Router
 * @param {string} email - Valid email address.
 * @param {string} password - Password with at least 8 characters.
 */
router.post(
    "/api/auth/login",
    body("email").isEmail().withMessage("El email no es válido").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("La contraseña debe tener mínimo 8 caracteres"),
    handleInputErrors,
    loginUser
)

/**
 * Logout user.
 * @name POST /api/auth/logout
 * @function
 * @memberof module:Router
 */
router.post(
    "/api/auth/logout",
    requireAuth,
    logoutUser
)

/**
 *  Get the currently authenticated user.
 * @name GET /api/auth/user
 * @function
 * @memberof module:Router
 */
router.get(
    "/api/auth/user",
    requireAuth,
    getCurrentUser
)

/**
 * Verify if the token is valid.
 * @name GET /api/auth/verify
 * @function
 * @memberof module:Router
 */
router.get(
    "/api/auth/verify",
    requireAuth,
    verifyAuth
)



export default router
