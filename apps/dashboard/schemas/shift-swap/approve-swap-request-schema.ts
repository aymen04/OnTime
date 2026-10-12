import { z } from 'zod';

export const approveSwapRequestSchema = z.object({
  requestId: z.string().uuid({ message: "L'ID de la demande est invalide." }),
});