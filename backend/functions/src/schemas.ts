import { z } from "zod"

export const ISODateZ = z.string().refine(i => /^\d{4}-\d{2}-\d{2}$/.test(i))

export const EntryZ = z.object({
    created: z.date(),
    start: ISODateZ,
    note: z.string(),
    tags: z.array(z.string()),
})
export type Entry = z.infer<typeof EntryZ>

export const UserZ = z.object({
    uid: z.string(),
    created: z.coerce.date(),
    name: z.string(),
    birth: z.coerce.date(),
    expYears: z.number().refine(i => i > 0),
    email: z.string().email(),
    entries: z.record(ISODateZ, EntryZ).optional(),
})

export const InitialUserZ = UserZ.partial({
    name: true,
    birth: true,
    expYears: true,
})
export type User = z.infer<typeof UserZ>

export const ProfileUpdateZ = UserZ.partial({
    uid: true,
    created: true,
    entries: true,
    email: true,
})
