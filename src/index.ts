import colors from 'colors'
import app from './server.js'

/**
 * Server port configuration.
 * 
 * Determines the port on which the Express application will listen for incoming requests.
 * The port is read from the `PORT` environment variable if available,
 * otherwise defaults to port 4000 for local development.
 * 
 * **Environment Variables:**
 * - `PORT`: The port number for the server (optional, default: 4000)
 * 
 * @constant
 * @type {string | number}
 * 
 * @example
 * // Using environment variable
 * PORT=3000 npm start
 * 
 * @example
 * // Using default port
 * npm start  // Server will run on port 4000
 */
const port: string | number = process.env.PORT || 4000

/**
 * Starts the Express HTTP server.
 * 
 * Initializes and starts the Express application server on the configured port.
 * Once started, the server begins listening for incoming HTTP requests.
 * A success message is logged to the console when the server is ready.
 * 
 * **Server Lifecycle:**
 * 1. Database connection is established (in server.js)
 * 2. Middleware and routes are configured (in server.js)
 * 3. Server starts listening on the specified port
 * 4. Ready to accept incoming requests
 * 
 * @function
 * @returns {void}
 * 
 * @example
 * // Console output on successful start
 * // "Server listening on port 4000"
 */
app.listen(port, (): void => {
    console.log(colors.blue.bold(`Server listening on port ${port}`))
})