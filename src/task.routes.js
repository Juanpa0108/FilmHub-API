// task.routes.js
import express from "express";
import { body } from "express-validator";
import Task from "./models/Tasks.js";
import { requireAuth } from "./middleware/auth.js";
import { handleInputErrors } from "./middleware/validation.js";

const router = express.Router();

/**
 * Get all tasks of the AUTHENTICATED USER.
 * @name GET /api/tasks
 */
router.get(
    "/api/tasks",
    requireAuth,
    async (req, res) => {
        try {
            console.log("📋 Obteniendo tareas del usuario:", req.user._id);
            
            // Filtrar por el usuario autenticado
            const tasks = await Task.find({ user: req.user._id }).populate("user", "firstName lastName email");
            
            console.log(`✅ Se encontraron ${tasks.length} tareas para el usuario ${req.user.firstName}`);
            res.json(tasks);
        } catch (err) {
            console.error("❌ Error obteniendo tareas:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

/**
 * Create a new task (always associated with the authenticated user).
 * @name POST /api/tasks
 */
router.post(
    "/api/tasks",
    requireAuth,
    body("title").notEmpty().withMessage("El título es obligatorio").trim(),
    body("description").optional().trim(),
    body("priority").optional().isIn(['low', 'medium', 'high']).withMessage("La prioridad debe ser: low, medium o high"),
    body("status").optional().isIn(['todo', 'inProgress', 'done']).withMessage("El estado debe ser: todo, inProgress o done"),
    body("start").optional().isISO8601().withMessage("La fecha de inicio debe ser válida"),
    body("end").isISO8601().withMessage("La fecha de finalización es obligatoria"),
    handleInputErrors,
    async (req, res) => {
        try {
            console.log("📝 Creando nueva tarea para usuario:", req.user._id);
            
            const { title, description, priority, status, start, end } = req.body;

            const newTask = new Task({
                title,
                description,
                priority: priority || "low",
                status: status || "todo",
                start: start || new Date(),
                end,
                user: req.user._id, // Asociar automáticamente al usuario autenticado
            });

            await newTask.save();
            const populatedTask = await Task.findById(newTask._id).populate("user", "firstName lastName email");
            
            console.log("✅ Tarea creada exitosamente:", populatedTask);
            res.status(201).json(populatedTask);
        } catch (err) {
            console.error("❌ Error creando tarea:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

/**
 * Update a task (only if it belongs to the authenticated user).
 * @name PUT /api/tasks/:id
 */
router.put(
    "/api/tasks/:id",
    requireAuth,
    body("title").optional().notEmpty().withMessage("El título no puede estar vacío").trim(),
    body("description").optional().trim(),
    body("priority").optional().isIn(['low', 'medium', 'high']).withMessage("La prioridad debe ser: low, medium o high"),
    body("status").optional().isIn(['todo', 'inProgress', 'done']).withMessage("El estado debe ser: todo, inProgress o done"),
    body("start").optional().isISO8601().withMessage("La fecha de inicio debe ser válida"),
    body("end").optional().isISO8601().withMessage("La fecha de finalización debe ser válida"),
    handleInputErrors,
    async (req, res) => {
        try {
            console.log("✏️ Actualizando tarea con ID:", req.params.id);
            console.log("Usuario autenticado:", req.user._id);
            
            const { title, description, priority, status, start, end } = req.body;
            
            // Find and update only tasks of the authenticated user
            const updatedTask = await Task.findOneAndUpdate(
                { 
                    _id: req.params.id, 
                    user: req.user._id // ← // Verify that the task belongs to the user
                },
                {
                    ...(title && { title }),
                    ...(description !== undefined && { description }),
                    ...(priority && { priority }),
                    ...(status && { status }),
                    ...(start && { start }),
                    ...(end && { end }),
                },
                { 
                    new: true,
                    runValidators: true
                }
            ).populate("user", "firstName lastName email");

            if (!updatedTask) {
                return res.status(404).json({ error: "Tarea no encontrada o no tienes permisos para editarla" });
            }

            console.log("✅ Tarea actualizada exitosamente:", updatedTask);
            res.json(updatedTask);
        } catch (err) {
            console.error("❌ Error actualizando tarea:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

/**
 * Delete a task (only if it belongs to the authenticated user).
 * @name DELETE /api/tasks/:id
 */
router.delete(
    "/api/tasks/:id",
    requireAuth,
    async (req, res) => {
        try {
            console.log("🗑️ Eliminando tarea con ID:", req.params.id);
            console.log("Usuario autenticado:", req.user._id);
            
            // Find and delete only tasks of the authenticated user
            const deletedTask = await Task.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id // ← Verify that the task belongs to the user
            });
            
            if (!deletedTask) {
                return res.status(404).json({ error: "Tarea no encontrada o no tienes permisos para eliminarla" });
            }

            console.log("✅ Tarea eliminada exitosamente:", deletedTask);
            res.json({ message: "Tarea eliminada exitosamente", task: deletedTask });
        } catch (err) {
            console.error("❌ Error eliminando tarea:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

export default router;