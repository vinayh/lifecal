import { describe, test, expect } from "bun:test"
import {
    ISODateZ,
    EntryZ,
    NewEntryZ,
    UserProfileZ,
    InitialUserZ,
    LoginFormEntryZ,
    TagZ,
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
        expect(ISODateZ.safeParse("2024-01-15 12:00").success).toBe(false)
    })
})

describe("EntryZ", () => {
    const validEntry = {
        created: "2024-01-15T10:30:00Z",
        start: "2024-01-15",
        note: "Test note",
        tags: ["tag1", "tag2"],
    }

    test("accepts a valid entry", () => {
        const result = EntryZ.safeParse(validEntry)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.start).toBe("2024-01-15")
            expect(result.data.note).toBe("Test note")
            expect(result.data.tags).toEqual(["tag1", "tag2"])
        }
    })

    test("accepts entry with empty tags", () => {
        const result = EntryZ.safeParse({ ...validEntry, tags: [] })
        expect(result.success).toBe(true)
    })

    test("rejects entry without created", () => {
        const { created, ...noCreated } = validEntry
        expect(EntryZ.safeParse(noCreated).success).toBe(false)
    })

    test("rejects entry with invalid start date", () => {
        expect(
            EntryZ.safeParse({ ...validEntry, start: "not-a-date" }).success
        ).toBe(false)
    })

    test("rejects entry without note", () => {
        const { note, ...noNote } = validEntry
        expect(EntryZ.safeParse(noNote).success).toBe(false)
    })

    test("rejects entry with non-string tags", () => {
        expect(
            EntryZ.safeParse({ ...validEntry, tags: [1, 2] }).success
        ).toBe(false)
    })
})

describe("NewEntryZ", () => {
    test("accepts entry without created (partial)", () => {
        const result = NewEntryZ.safeParse({
            start: "2024-01-15",
            note: "New entry",
            tags: [],
        })
        expect(result.success).toBe(true)
    })

    test("accepts entry with created", () => {
        const result = NewEntryZ.safeParse({
            created: "2024-01-15T10:30:00Z",
            start: "2024-01-15",
            note: "New entry",
            tags: ["tag1"],
        })
        expect(result.success).toBe(true)
    })

    test("still requires start, note, and tags", () => {
        expect(NewEntryZ.safeParse({ note: "test", tags: [] }).success).toBe(
            false
        )
        expect(
            NewEntryZ.safeParse({ start: "2024-01-15", tags: [] }).success
        ).toBe(false)
        expect(
            NewEntryZ.safeParse({ start: "2024-01-15", note: "test" }).success
        ).toBe(false)
    })
})

describe("UserProfileZ", () => {
    const validProfile = {
        uid: "abc123",
        created: "2024-01-15T10:30:00Z",
        name: "Test User",
        birth: "1990-05-20",
        expYears: 80,
        email: "test@example.com",
    }

    test("accepts a valid profile", () => {
        const result = UserProfileZ.safeParse(validProfile)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.uid).toBe("abc123")
            expect(result.data.name).toBe("Test User")
            expect(result.data.expYears).toBe(80)
        }
    })

    test("rejects profile with expYears <= 0", () => {
        expect(
            UserProfileZ.safeParse({ ...validProfile, expYears: 0 }).success
        ).toBe(false)
        expect(
            UserProfileZ.safeParse({ ...validProfile, expYears: -5 }).success
        ).toBe(false)
    })

    test("rejects profile with invalid email", () => {
        expect(
            UserProfileZ.safeParse({ ...validProfile, email: "not-email" })
                .success
        ).toBe(false)
    })

    test("rejects profile with invalid birth date format", () => {
        expect(
            UserProfileZ.safeParse({ ...validProfile, birth: "1990/05/20" })
                .success
        ).toBe(false)
    })

    test("rejects profile with missing required fields", () => {
        const { uid, ...noUid } = validProfile
        expect(UserProfileZ.safeParse(noUid).success).toBe(false)

        const { name, ...noName } = validProfile
        expect(UserProfileZ.safeParse(noName).success).toBe(false)

        const { birth, ...noBirth } = validProfile
        expect(UserProfileZ.safeParse(noBirth).success).toBe(false)
    })
})

describe("InitialUserZ", () => {
    test("accepts profile without optional fields", () => {
        const result = InitialUserZ.safeParse({
            uid: "abc123",
            created: "2024-01-15T10:30:00Z",
        })
        expect(result.success).toBe(true)
    })

    test("accepts full profile", () => {
        const result = InitialUserZ.safeParse({
            uid: "abc123",
            created: "2024-01-15T10:30:00Z",
            name: "Test User",
            birth: "1990-05-20",
            expYears: 80,
            email: "test@example.com",
        })
        expect(result.success).toBe(true)
    })

    test("still requires uid and created", () => {
        expect(
            InitialUserZ.safeParse({
                name: "Test",
                birth: "1990-05-20",
                expYears: 80,
            }).success
        ).toBe(false)
    })
})

describe("LoginFormEntryZ", () => {
    test("accepts valid credentials", () => {
        const result = LoginFormEntryZ.safeParse({
            email: "user@example.com",
            password: "securepass",
        })
        expect(result.success).toBe(true)
    })

    test("rejects invalid email", () => {
        expect(
            LoginFormEntryZ.safeParse({
                email: "not-an-email",
                password: "pass",
            }).success
        ).toBe(false)
    })

    test("rejects missing fields", () => {
        expect(
            LoginFormEntryZ.safeParse({ email: "a@b.com" }).success
        ).toBe(false)
        expect(
            LoginFormEntryZ.safeParse({ password: "pass" }).success
        ).toBe(false)
    })
})

describe("TagZ", () => {
    const validTag = {
        id: 1,
        created: "2024-01-15T10:30:00Z",
        name: "Important",
        color: "#ff0000",
    }

    test("accepts a valid tag", () => {
        const result = TagZ.safeParse(validTag)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.name).toBe("Important")
        }
    })

    test("rejects tag with non-numeric id", () => {
        expect(TagZ.safeParse({ ...validTag, id: "one" }).success).toBe(false)
    })

    test("rejects tag with missing name", () => {
        const { name, ...noName } = validTag
        expect(TagZ.safeParse(noName).success).toBe(false)
    })
})
