import { z } from 'zod';

export const createSwapRequestSchema = z.object({
  shiftId: z.string().uuid({ message: "L'ID du shift est invalide." }),
  targetEmployeeId: z.string().uuid({ message: "L'ID du collègue est invalide." }),
  message: z.string().max(1000, { message: "Le message ne peut pas dépasser 1000 caractères." }).optional(),
});