import { Button } from '@/components/ui/button'
import { createRelayListDraftEvent } from '@/lib/draft-event'
import { formatError } from '@/lib/error'
import { useNostr } from '@/providers/NostrProvider'
import { TMailboxRelay } from '@/types'
import { CloudUpload, Loader } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export default function SaveButton({
  mailboxRelays,
  hasChange,
  setHasChange
}: {
  mailboxRelays: TMailboxRelay[]
  hasChange: boolean
  setHasChange: (hasChange: boolean) => void
}) {
  const { t } = useTranslation()
  const { pubkey, publish, updateRelayListEvent } = useNostr()
  const [pushing, setPushing] = useState(false)

  const save = async () => {
    if (!pubkey) return

    setPushing(true)
    const event = createRelayListDraftEvent(mailboxRelays)
    try {
      const relayListEvent = await publish(event)
      await updateRelayListEvent(relayListEvent)
      toast.success('Successfully saved mailbox relays')
      setHasChange(false)
      setPushing(false)
    } catch (error) {
      const errors = formatError(error)
      errors.forEach((err) => {
        toast.error(`${t('Failed to save mailbox relays')}: ${err}`, { duration: 10_000 })
      })
    }
  }

  return (
    <Button className="w-full" disabled={!pubkey || pushing || !hasChange} onClick={save}>
      {pushing ? <Loader className="animate-spin" /> : <CloudUpload />}
      {t('Save')}
    </Button>
  )
}
