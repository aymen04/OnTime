import { z } from 'zod';

export const respondSwapRequestSchema = z.object({
  requestId: z.string().uuid({ message: "L'ID de la demande est invalide." }),
  accept: z.boolean({ required_error: "La décision (accepter/refuser) est requise." }),
});

export type RespondSwapRequestSchema = z.infer<typeof respondSwapRequestSchema>;