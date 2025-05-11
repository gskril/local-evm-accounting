// import { z } from 'zod'

// const addressSchema = z
//   .string()
//   .refine((address) => address.startsWith('0x') && address.length == 42, {
//     message: 'Address must start with 0x',
//   }) as z.ZodType<`0x${string}`>

// const chainSchema = z.object({
//   id: z.number(),
//   name: z.string(),
//   rpcUrl: z.string(),
// })

// export type Chain = z.infer<typeof chainSchema>

// const tokenSchema = z.object({
//   address: addressSchema,
//   name: z.string(),
//   symbol: z.string(),
//   decimals: z.number(),
//   amount: z.number().optional(),
//   usdValue: z.number().optional(),
// })

// export type Token = z.infer<typeof tokenSchema>

// export const accountSchema = z.object({
//   address: addressSchema,
//   chains: z.array(chainSchema),
//   tokens: z.array(tokenSchema),
//   name: z.string().optional(),
//   usdValue: z.number().optional(),
// })

// export type Account = z.infer<typeof accountSchema>
