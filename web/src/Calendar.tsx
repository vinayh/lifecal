import { Fragment, ReactElement, useState } from "react"
import { Navigate } from "react-router-dom"
import { Box, Group, Modal, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { isPast } from "date-fns"

import { useUserStore, ProfileStatus } from "./user"
import { EntryForm } from "./EntryForm"
import { generateEntries, EntryInfo } from "./calendar-utils"
import "/styles/calendar.css"

export function Calendar() {
    const { userAuth, userProfile, entries, profileStatus } = useUserStore()
    const [selectedEntry, setSelectedEntry] = useState<EntryInfo | null>(null)
    const [opened, { open, close }] = useDisclosure(false)

    const renderCalEntry = (entryInfo: EntryInfo): ReactElement => {
        const { date, entry } = entryInfo
        const divClass = isPast(date)
            ? entry !== null
                ? "entry filled"
                : "entry past"
            : "entry future"
        const onClick = isPast(date)
            ? () => {
                  setSelectedEntry(entryInfo)
                  open()
              }
            : undefined
        return <div key={date} className={divClass} onClick={onClick}></div>
    }

    if (
        userProfile &&
        userAuth &&
        entries &&
        profileStatus === ProfileStatus.CompleteProfile
    ) {
        const allEntries = generateEntries(userProfile, entries)
        console.log(`Rendering calendar with ${allEntries.length} entries`)
        return (
            <>
                <Box maw={700} pt={50} mx="auto">
                    <Title order={2} mb={20}>
                        Your life calendar
                    </Title>
                    <Fragment>
                        <Group gap="xs">{allEntries.map(renderCalEntry)}</Group>
                    </Fragment>
                </Box>
                <Modal
                    opened={opened}
                    onClose={() => {
                        close()
                        setSelectedEntry(null)
                    }}
                    title="Add or edit entry"
                >
                    {selectedEntry ? (
                        <EntryForm entryInfo={selectedEntry} />
                    ) : null}
                </Modal>
            </>
        )
    } else {
        console.log(userProfile, userAuth)
        return <Navigate to="/profile" />
    }
}
