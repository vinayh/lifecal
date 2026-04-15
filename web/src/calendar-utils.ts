import {
    addWeeks,
    previousMonday,
    addYears,
    differenceInWeeks,
    isMonday,
    formatISO,
} from "date-fns"

import { UserProfile, Entry } from "./schemas"

export type EntryInfo = {
    date: string
    entry: Entry | null
}

export function generateEntries(
    user: UserProfile,
    entries: Record<string, Entry>
): EntryInfo[] {
    const birth = new Date(user.birth)
    const startDate = isMonday(birth) ? birth : previousMonday(birth)
    const endDate = addYears(startDate, user.expYears)
    const numWeeks = differenceInWeeks(endDate, startDate, {
        roundingMethod: "ceil",
    })
    const entryDatesArray = [...Array(numWeeks).keys()]
    return entryDatesArray.map(wk => {
        const start = formatISO(addWeeks(startDate, wk), {
            representation: "date",
        })
        return {
            date: start,
            entry: start in entries ? entries[start] : null,
        }
    })
}
