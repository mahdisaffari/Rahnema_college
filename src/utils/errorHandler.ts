import { Response } from 'express';
import { z } from 'zod';

export function handleError<T, R>(
  error: unknown,
  res: Response<R>,
  defaultMessage: string,
  statusCode: number = 500,
  defaultData?: T
): Response<R> {
  console.error(error);
  const message = error instanceof z.ZodError 
    ? error.issues[0].message 
    : (error instanceof Error ? error.message || defaultMessage : defaultMessage);

  // base response with success and message
  const response: { success: boolean; message: string; data?: T } = {
    success: false,
    message,
  };

  // agar response type niaze be data ejbari dashte bashe va defaultData nadashte bashim
  if (defaultData === undefined && 'data' in (res as any).req.body) {
    response.data = [] as T; // default baraye array ha
  } else if (defaultData !== undefined) {
    response.data = defaultData; // estefade az defaultData agar vojood dasht
  }

  return res.status(error instanceof z.ZodError ? 400 : statusCode).json(response as R);
}
