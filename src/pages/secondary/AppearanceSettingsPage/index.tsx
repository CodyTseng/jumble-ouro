import { Label } from '@/components/ui/label'
import {
  CONTENT_FONT_SIZE,
  PRIMARY_COLORS,
  PROFILE_PICTURE_AUTO_LOAD_POLICY,
  TIMESTAMP_FORMAT,
  TPrimaryColor
} from '@/constants'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { cn } from '@/lib/utils'
import { useContentPolicy } from '@/providers/ContentPolicyProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useUserPreferences } from '@/providers/UserPreferencesProvider'
import { TContentFontSize, TProfilePictureAutoLoadPolicy, TTimestampFormat } from '@/types'
import { CalendarClock, Clock, Columns2, LayoutList, List, Monitor, Moon, PanelLeft, Sun } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

const THEMES = [
  { key: 'system', label: 'System', icon: <Monitor className="size-5" /> },
  { key: 'light', label: 'Light', icon: <Sun className="size-5" /> },
  { key: 'dark', label: 'Dark', icon: <Moon className="size-5" /> },
  { key: 'pure-black', label: 'Pure Black', icon: <Moon className="size-5 fill-current" /> }
] as const

const LAYOUTS = [
  { key: false, label: 'Two-column', icon: <Columns2 className="size-5" /> },
  { key: true, label: 'Single-column', icon: <PanelLeft className="size-5" /> }
] as const

const NOTIFICATION_STYLES = [
  { key: 'detailed', label: 'Detailed', icon: <LayoutList className="size-5" /> },
  { key: 'compact', label: 'Compact', icon: <List className="size-5" /> }
] as const

const TIMESTAMP_FORMATS = [
  { key: TIMESTAMP_FORMAT.RELATIVE, label: 'Relative', icon: <Clock className="size-5" /> },
  {
    key: TIMESTAMP_FORMAT.ABSOLUTE,
    label: 'Absolute',
    icon: <CalendarClock className="size-5" />
  }
] as const

const FONT_SIZES = [
  { key: CONTENT_FONT_SIZE.SMALL, label: 'Small', size: '0.875rem' },
  { key: CONTENT_FONT_SIZE.DEFAULT, label: 'Default', size: '1rem' },
  { key: CONTENT_FONT_SIZE.LARGE, label: 'Large', size: '1.125rem' },
  { key: CONTENT_FONT_SIZE.XL, label: 'Extra Large', size: '1.25rem' }
] as const

const AppearanceSettingsPage = forwardRef(({ index }: { index?: number }, ref) => {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()
  const { themeSetting, setThemeSetting, primaryColor, setPrimaryColor } = useTheme()
  const { profilePictureAutoLoadPolicy, setProfilePictureAutoLoadPolicy } = useContentPolicy()
  const {
    enableSingleColumnLayout,
    updateEnableSingleColumnLayout,
    notificationListStyle,
    updateNotificationListStyle,
    contentFontSize,
    updateContentFontSize,
    timestampFormat,
    updateTimestampFormat
  } = useUserPreferences()

  return (
    <SecondaryPageLayout ref={ref} index={index} title={t('Appearance')}>
      <div className="my-3 space-y-4">
        <div className="flex flex-col gap-2 px-4">
          <Label className="text-base">{t('Theme')}</Label>
          <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
            {THEMES.map(({ key, label, icon }) => (
              <OptionButton
                key={key}
                isSelected={themeSetting === key}
                icon={icon}
                label={t(label)}
                onClick={() => setThemeSetting(key)}
              />
            ))}
          </div>
        </div>
        {!isSmallScreen && (
          <div className="flex flex-col gap-2 px-4">
            <Label className="text-base">{t('Layout')}</Label>
            <div className="grid w-full grid-cols-2 gap-4">
              {LAYOUTS.map(({ key, label, icon }) => (
                <OptionButton
                  key={key.toString()}
                  isSelected={enableSingleColumnLayout === key}
                  icon={icon}
                  label={t(label)}
                  onClick={() => updateEnableSingleColumnLayout(key)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 px-4">
          <Label className="text-base">{t('Notification list style')}</Label>
          <div className="grid w-full grid-cols-2 gap-4">
            {NOTIFICATION_STYLES.map(({ key, label, icon }) => (
              <OptionButton
                key={key}
                isSelected={notificationListStyle === key}
                icon={icon}
                label={t(label)}
                onClick={() => updateNotificationListStyle(key)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <Label className="text-base">{t('Show avatars')}</Label>
          <div className="grid w-full grid-cols-2 gap-4">
            <AvatarPolicyCard
              showAvatar
              label={t('Show')}
              isSelected={
                profilePictureAutoLoadPolicy !== PROFILE_PICTURE_AUTO_LOAD_POLICY.NEVER
              }
              onClick={() =>
                setProfilePictureAutoLoadPolicy(
                  PROFILE_PICTURE_AUTO_LOAD_POLICY.ALWAYS as TProfilePictureAutoLoadPolicy
                )
              }
            />
            <AvatarPolicyCard
              label={t('Hide')}
              isSelected={
                profilePictureAutoLoadPolicy === PROFILE_PICTURE_AUTO_LOAD_POLICY.NEVER
              }
              onClick={() =>
                setProfilePictureAutoLoadPolicy(
                  PROFILE_PICTURE_AUTO_LOAD_POLICY.NEVER as TProfilePictureAutoLoadPolicy
                )
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <Label className="text-base">{t('Primary color')}</Label>
          <div className="grid w-full grid-cols-4 gap-4">
            {Object.entries(PRIMARY_COLORS).map(([key, config]) => (
              <OptionButton
                key={key}
                isSelected={primaryColor === key}
                icon={
                  <div
                    className="size-8 rounded-full shadow-md"
                    style={{
                      backgroundColor: `hsl(${config.light.primary})`
                    }}
                  />
                }
                label={t(config.name)}
                onClick={() => setPrimaryColor(key as TPrimaryColor)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <Label className="text-base">{t('Content font size')}</Label>
          <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
            {FONT_SIZES.map(({ key, label, size }) => (
              <FontSizeCard
                key={key}
                isSelected={contentFontSize === key}
                label={t(label)}
                size={size}
                onClick={() => updateContentFontSize(key as TContentFontSize)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4">
          <Label className="text-base">{t('Timestamp format')}</Label>
          <div className="grid w-full grid-cols-2 gap-4">
            {TIMESTAMP_FORMATS.map(({ key, label, icon }) => (
              <OptionButton
                key={key}
                isSelected={timestampFormat === key}
                icon={icon}
                label={t(label)}
                onClick={() => updateTimestampFormat(key as TTimestampFormat)}
              />
            ))}
          </div>
        </div>
      </div>
    </SecondaryPageLayout>
  )
})
AppearanceSettingsPage.displayName = 'AppearanceSettingsPage'
export default AppearanceSettingsPage

const NoteSkeletonLine = ({ className }: { className?: string }) => (
  <div className={cn('h-1.5 rounded-full bg-muted-foreground/20', className)} />
)

const AvatarPolicyCard = ({
  showAvatar,
  label,
  isSelected,
  onClick
}: {
  showAvatar?: boolean
  label?: string
  isSelected: boolean
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-lg border-2 px-3 py-4 transition-all',
        isSelected ? 'border-primary' : 'border-border hover:border-muted-foreground/40'
      )}
    >
      <div className="flex w-full items-center gap-1.5">
        {showAvatar && (
          <div className="size-5 shrink-0 rounded-full bg-muted-foreground/20" />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <NoteSkeletonLine className="w-8" />
          <NoteSkeletonLine className="w-5" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <NoteSkeletonLine className="w-full" />
        <NoteSkeletonLine className="w-2/3" />
      </div>
      {label && <span className="mt-1 self-center text-xs font-medium">{label}</span>}
    </button>
  )
}

const OptionButton = ({
  isSelected,
  onClick,
  icon,
  label
}: {
  isSelected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border-2 py-4 transition-all',
        isSelected ? 'border-primary' : 'border-border hover:border-muted-foreground/40'
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

const FontSizeCard = ({
  isSelected,
  onClick,
  label,
  size
}: {
  isSelected: boolean
  onClick: () => void
  label: string
  size: string
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-lg border-2 px-3 py-4 transition-all',
        isSelected ? 'border-primary' : 'border-border hover:border-muted-foreground/40'
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <NoteSkeletonLine className="w-8" />
        <div style={{ fontSize: size }} className="truncate text-muted-foreground">
          Aa
        </div>
      </div>
      <span className="self-center text-xs font-medium">{label}</span>
    </button>
  )
}
