import NotFound from '@/components/NotFound'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { forwardRef } from 'react'

const NotFoundPage = forwardRef(({ index }: { index?: number }, ref) => {
  return (
    <SecondaryPageLayout ref={ref} index={index} hideBackButton>
      <NotFound />
    </SecondaryPageLayout>
  )
})
NotFoundPage.displayName = 'NotFoundPage'
export default NotFoundPage
