import { describe, test, expect } from "bun:test"
import {
    ISODateZ,
    EntryZ,
    UserZ,
    InitialUserZ,
    ProfileUpdateZ,
} from "../schemas"

describe("ISODateZ", () => {
    test("accepts valid ISO date strings", () => {
        expect(ISODateZ.safeParse("2024-01-15").success).toBe(true)
        expect(ISODateZ.safeParse("1990-12-31").success).toBe(true)
        expect(ISODateZ.safeParse("2000-02-29").success).toBe(true)
    })

    test("rejects invalid formats", () => {
        expect(ISODateZ.safeParse("2024/01/15").success).toBe(false)
        expect(ISODateZ.safeParse("01-15-2024").success).toBe(false)
        expect(ISODateZ.safeParse("2024-1-5").success).toBe(false)
        expect(ISODateZ.safeParse("not-a-date").success).toBe(false)
        expect(ISODateZ.safeParse("").success).toBe(false)
        expect(ISODateZ.safeParse(123).success).toBe(false)
    })

    test("rejects datetime strings", () => {
        expect(ISODateZ.safeParse("2024-01-15T00:00:00Z").success).toBe(false)
    })
})

describe("EntryZ", () => {
    const validEntry = {
        created: new Date("2024-01-15T10:30:00Z"),
        start: "2024-01-15",
        note: "Test note",
        tags: ["tag1", "tag2"],
    }

    test("accepts a valid entry with Date object for created", () => {
        const result = EntryZ.safeParse(validEntry)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.start).toBe("2024-01-15")
            expect(result.data.note).toBe("Test note")
            expect(result.data.tags).toEqual(["tag1", "tag2"])
            expect(result.data.created).toBeInstanceOf(Date)
        }
    })

    test("rejects entry with string for created (requires Date)", () => {
        expect(
            EntryZ.safeParse({ ...validEntry, created: "2024-01-15T10:30:00Z" })
                .success
        ).toBe(false)
    })

    test("accepts entry with empty tags", () => {
        expect(EntryZ.safeParse({ ...validEntry, tags: [] }).success).toBe(true)
    })

    test("rejects entry with invalid start date", () => {
        expect(
            EntryZ.safeParse({ ...validEntry, start: "not-a-date" }).success
        ).toBe(false)
    })

    test("rejects entry without required fields", () => {
        const { note, ...noNote } = validEntry
        expect(EntryZ.safeParse(noNote).success).toBe(false)

        const { tags, ...noTags } = validEntry
        expect(EntryZ.safeParse(noTags).success).toBe(false)
    })
})

describe("UserZ", () => {
    const validUser = {
        uid: "abc123",
        created: new Date("2024-01-15T10:30:00Z"),
        name: "Test User",
        birth: new Date("1990-05-20"),
        expYears: 80,
        email: "test@example.com",
    }

    test("accepts a valid user", () => {
        const result = UserZ.safeParse(validUser)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.uid).toBe("abc123")
            expect(result.data.name).toBe("Test User")
            expect(result.data.created).toBeInstanceOf(Date)
            expect(result.data.birth).toBeInstanceOf(Date)
        }
    })

    test("coerces string dates to Date objects", () => {
        const result = UserZ.safeParse({
            ...validUser,
            created: "2024-01-15T10:30:00Z",
            birth: "1990-05-20",
        })
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.created).toBeInstanceOf(Date)
            expect(result.data.birth).toBeInstanceOf(Date)
        }
    })

    test("accepts user with optional entries", () => {
        const result = UserZ.safeParse({
            ...validUser,
            entries: {
                "2024-01-15": {
                    created: new Date(),
                    start: "2024-01-15",
                    note: "test",
                    tags: [],
                },
            },
        })
        expect(result.success).toBe(true)
    })

    test("accepts user without entries", () => {
        const result = UserZ.safeParse(validUser)
        expect(result.success).toBe(true)
    })

    test("rejects user with expYears <= 0", () => {
        expect(
            UserZ.safeParse({ ...validUser, expYears: 0 }).success
        ).toBe(false)
        expect(
            UserZ.safeParse({ ...validUser, expYears: -1 }).success
        ).toBe(false)
    })

    test("rejects user with invalid email", () => {
        expect(
            UserZ.safeParse({ ...validUser, email: "not-email" }).success
        ).toBe(false)
    })

    test("rejects user with missing required fields", () => {
        const { uid, ...noUid } = validUser
        expect(UserZ.safeParse(noUid).success).toBe(false)

        const { name, ...noName } = validUser
        expect(UserZ.safeParse(noName).success).toBe(false)
    })
})

describe("InitialUserZ", () => {
    test("accepts user without optional profile fields", () => {
        const result = InitialUserZ.safeParse({
            uid: "abc123",
            created: new Date("2024-01-15T10:30:00Z"),
            email: "test@example.com",
        })
        expect(result.success).toBe(true)
    })

    test("accepts a complete user", () => {
        const result = InitialUserZ.safeParse({
            uid: "abc123",
            created: new Date("2024-01-15T10:30:00Z"),
            name: "Test",
            birth: new Date("1990-01-01"),
            expYears: 80,
            email: "test@example.com",
        })
        expect(result.success).toBe(true)
    })

    test("still requires uid, created, and email", () => {
        expect(
            InitialUserZ.safeParse({
                name: "Test",
                birth: new Date("1990-01-01"),
            }).success
        ).toBe(false)
    })
})

describe("ProfileUpdateZ", () => {
    test("accepts partial profile with just name and birth", () => {
        const result = ProfileUpdateZ.safeParse({
            name: "Updated Name",
            birth: new Date("1990-01-01"),
            expYears: 85,
        })
        expect(result.success).toBe(true)
    })

    test("requires name, birth, and expYears (not made optional)", () => {
        expect(ProfileUpdateZ.safeParse({}).success).toBe(false)
        expect(
            ProfileUpdateZ.safeParse({
                name: "Test",
                birth: new Date("1990-01-01"),
                expYears: 80,
            }).success
        ).toBe(true)
    })

    test("rejects invalid expYears even in partial", () => {
        expect(
            ProfileUpdateZ.safeParse({ expYears: -1 }).success
        ).toBe(false)
    })

    test("rejects invalid email even in partial", () => {
        expect(
            ProfileUpdateZ.safeParse({ email: "bad" }).success
        ).toBe(false)
    })
})
