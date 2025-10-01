import { Response } from 'express';
import { z } from 'zod';

interface CustomError extends Error {
  statusCode?: number;
}

export function handleError<T, R>(
  error: unknown,
  res: Response<R>,
  defaultMessage: string,
  statusCode: number = 500,
  defaultData?: T
): Response<R> {
  console.error(error);
  let message = defaultMessage;
  let finalStatus = statusCode;

  if (error instanceof z.ZodError) {
    message = error.issues[0].message;
    finalStatus = 400;
  } else if (error instanceof Error) {
    message = error.message || defaultMessage;
    finalStatus = (error as CustomError).statusCode || statusCode; // استفاده از interface به جای any
  }
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

  return res.status(finalStatus).json(response as R);
}
