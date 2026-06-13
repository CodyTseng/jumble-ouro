import Relay from '@/components/Relay'
import RelayName from '@/components/RelayName'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { normalizeUrl } from '@/lib/url'
import { TPageRef } from '@/types'
import { Server } from 'lucide-react'
import { forwardRef, useMemo } from 'react'

const RelayPage = forwardRef<TPageRef>(({ url }: { url?: string }, ref) => {
  const normalizedUrl = useMemo(() => (url ? normalizeUrl(url) : undefined), [url])

  return (
    <PrimaryPageLayout
      pageName="relay"
      icon={<Server />}
      title={<RelayName url={normalizedUrl} />}
      displayScrollToTopButton
      ref={ref}
    >
      <Relay url={normalizedUrl} />
    </PrimaryPageLayout>
  )
})
RelayPage.displayName = 'RelayPage'
export default RelayPage
