import { Favicon } from '@/components/Favicon'
import ProfileList from '@/components/ProfileList'
import { ProfileListBySearch } from '@/components/ProfileListBySearch'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { fetchPubkeysFromDomain } from '@/lib/nip05'
import { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ProfileListPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState<React.ReactNode>()
  const [data, setData] = useState<{
    type: 'search' | 'domain'
    id: string
  } | null>(null)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const search = searchParams.get('s')
    if (search) {
      setTitle(`${t('Search')}: ${search}`)
      setData({ type: 'search', id: search })
      return
    }

    const domain = searchParams.get('d')
    if (domain) {
      setTitle(
        <div className="flex items-center gap-1">
          {domain}
          <Favicon domain={domain} className="h-5 w-5" />
        </div>
      )
      setData({ type: 'domain', id: domain })
      return
    }
  }, [])

  let content: React.ReactNode = null
  if (data?.type === 'search') {
    content = <ProfileListBySearch search={data.id} />
  } else if (data?.type === 'domain') {
    content = <ProfileListByDomain domain={data.id} />
  }

  return (
    <SecondaryPageLayout ref={ref} index={index} title={title} displayScrollToTopButton>
      {content}
    </SecondaryPageLayout>
  )
})
ProfileListPage.displayName = 'ProfileListPage'
export default ProfileListPage

function ProfileListByDomain({ domain }: { domain: string }) {
  const [pubkeys, setPubkeys] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      const _pubkeys = await fetchPubkeysFromDomain(domain)
      setPubkeys(_pubkeys)
    }
    init()
  }, [domain])

  return <ProfileList pubkeys={pubkeys} />
}
