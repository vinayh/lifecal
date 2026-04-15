import { z } from "zod"

export const LoginFormEntryZ = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const TagZ = z.object({
    id: z.number(),
    created: z.string().datetime(),
    name: z.string(),
    color: z.string(),
})
export type Tag = z.infer<typeof TagZ>

export const ISODateZ = z.string().refine(i => /^\d{4}-\d{2}-\d{2}$/.test(i))

export const EntryZ = z.object({
    created: z.string().datetime(),
    start: ISODateZ,
    note: z.string(),
    tags: z.array(z.string()),
})
export const NewEntryZ = EntryZ.partial({ created: true })
export type Entry = z.infer<typeof EntryZ>

export const UserProfileZ = z.object({
    uid: z.string(),
    created: z.string().datetime(),
    name: z.string(),
    birth: ISODateZ,
    expYears: z.number().refine(i => i > 0),
    email: z.string().email(),
})
export type UserProfile = z.infer<typeof UserProfileZ>

export const InitialUserZ = UserProfileZ.partial({
    name: true,
    birth: true,
    expYears: true,
    email: true,
})

export type ProfileFormData = {
    name: string
    birth: string | Date
    expYears: string
}

export type EntryFormData = {
    start: string
    note: string
    tags: string[]
}
