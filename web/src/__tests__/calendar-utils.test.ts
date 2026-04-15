import { describe, test, expect } from "bun:test"
import { generateEntries } from "../calendar-utils"
import { UserProfile, Entry } from "../schemas"

const makeProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    uid: "test-uid",
    created: "2024-01-01T00:00:00Z",
    name: "Test User",
    birth: "1990-01-01", // Monday
    expYears: 80,
    email: "test@example.com",
    ...overrides,
})

const makeEntry = (start: string, note = "test"): Entry => ({
    created: "2024-01-01T00:00:00Z",
    start,
    note,
    tags: [],
})

describe("generateEntries", () => {
    test("generates correct number of weeks for life expectancy", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 1 })
        const entries = generateEntries(profile, {})
        // 1990-01-01 is a Monday, 1 year ≈ 52.14 weeks → ceil = 53
        expect(entries.length).toBe(53)
    })

    test("generates ~4160 weeks for 80-year expectancy", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 80 })
        const entries = generateEntries(profile, {})
        // 80 years ≈ 4174 weeks (accounts for leap years)
        expect(entries.length).toBeGreaterThanOrEqual(4170)
        expect(entries.length).toBeLessThanOrEqual(4180)
    })

    test("first entry starts on birth date when it is a Monday", () => {
        // 1990-01-01 is a Monday
        const profile = makeProfile({ birth: "1990-01-01" })
        const entries = generateEntries(profile, {})
        expect(entries[0].date).toBe("1990-01-01")
    })

    test("first entry snaps to previous Monday when birth is not Monday", () => {
        // 1990-01-03 is a Wednesday
        const profile = makeProfile({ birth: "1990-01-03" })
        const entries = generateEntries(profile, {})
        expect(entries[0].date).toBe("1990-01-01") // previous Monday
    })

    test("entries are spaced exactly one week apart", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 1 })
        const entries = generateEntries(profile, {})
        for (let i = 1; i < entries.length; i++) {
            const prev = new Date(entries[i - 1].date)
            const curr = new Date(entries[i].date)
            const diffDays =
                (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
            expect(diffDays).toBe(7)
        }
    })

    test("entry is null when no matching entry exists", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 1 })
        const entries = generateEntries(profile, {})
        expect(entries[0].entry).toBeNull()
        expect(entries[10].entry).toBeNull()
    })

    test("matches entries by date", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 1 })
        const entry = makeEntry("1990-01-01", "birth week")
        const result = generateEntries(profile, { "1990-01-01": entry })
        expect(result[0].entry).toEqual(entry)
        expect(result[0].entry!.note).toBe("birth week")
    })

    test("matches multiple entries at correct positions", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 1 })
        const entries: Record<string, Entry> = {
            "1990-01-01": makeEntry("1990-01-01", "week 0"),
            "1990-01-08": makeEntry("1990-01-08", "week 1"),
            "1990-03-05": makeEntry("1990-03-05", "week 9"),
        }
        const result = generateEntries(profile, entries)
        expect(result[0].entry!.note).toBe("week 0")
        expect(result[1].entry!.note).toBe("week 1")
        expect(result[9].entry!.note).toBe("week 9")
        expect(result[2].entry).toBeNull()
    })

    test("unmatched entries (wrong dates) are not included", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 1 })
        const entries: Record<string, Entry> = {
            "1990-01-02": makeEntry("1990-01-02", "wrong day"),
        }
        const result = generateEntries(profile, entries)
        const matched = result.filter(e => e.entry !== null)
        expect(matched.length).toBe(0)
    })

    test("all dates are valid ISO date format", () => {
        const profile = makeProfile({ birth: "1990-01-01", expYears: 2 })
        const entries = generateEntries(profile, {})
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
        for (const entry of entries) {
            expect(entry.date).toMatch(isoDateRegex)
        }
    })
})
