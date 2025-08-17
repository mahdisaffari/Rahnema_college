import z from 'zod'

export const registerInputSchema = z.object({
    username: z.string().min(5,"username must be longer than 5"),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/),
    email: z.email()
  })