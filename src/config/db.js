import mongoose from "mongoose";
import colors from "colors";

/**
 * Connects the application to the MongoDB database using mongoose.
 *
 * The connection URI is obtained from the environment variable `MONGO_URI`.
 * If the connection is successful, it logs the MongoDB host and port to the console.
 * If an error occurs, it prints the message in red and terminates the process.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} A promise that resolves when the connection is successful or the process exits in case of an error.
 */
export const connectDB = async () => {
    try { 
        const { connection } = await mongoose.connect(process.env.MONGO_URI || "");
        const url = `${connection.host}:${connection.port}`;
        console.log(colors.cyan.bold(`MongoDB Conectado en ${url}`));
    } catch (error) {
        console.log(colors.bgRed.white.bold(error.message));
        process.exit(1);
    }
};
