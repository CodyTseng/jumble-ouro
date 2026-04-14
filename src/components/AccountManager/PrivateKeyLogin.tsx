import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNostr } from '@/providers/NostrProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PrivateKeyLogin({
  back,
  onLoginSuccess
}: {
  back: () => void
  onLoginSuccess: () => void
}) {
  return (
    <Tabs defaultValue="nsec">
      <TabsList>
        <TabsTrigger value="nsec">nsec</TabsTrigger>
        <TabsTrigger value="ncryptsec">ncryptsec</TabsTrigger>
      </TabsList>
      <TabsContent value="nsec">
        <NsecLogin back={back} onLoginSuccess={onLoginSuccess} />
      </TabsContent>
      <TabsContent value="ncryptsec">
        <NcryptsecLogin back={back} onLoginSuccess={onLoginSuccess} />
      </TabsContent>
    </Tabs>
  )
}

function NsecLogin({ back, onLoginSuccess }: { back: () => void; onLoginSuccess: () => void }) {
  const { t } = useTranslation()
  const { nsecLogin } = useNostr()
  const [nsecOrHex, setNsecOrHex] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsecOrHex(e.target.value)
    setErrMsg(null)
  }

  const handleLogin = () => {
    if (nsecOrHex === '') return

    nsecLogin(nsecOrHex, password)
      .then(() => onLoginSuccess())
      .catch((err) => {
        setErrMsg(err.message)
      })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        handleLogin()
      }}
    >
      <div className="text-orange-400">
        {t(
          'Using private key login is insecure. It is recommended to use a browser extension for login, such as alby, nostr-keyx or nos2x. If you must use a private key, please set a password for encryption at minimum.'
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nsec-input">nsec or hex</Label>
        <Input
          id="nsec-input"
          type="password"
          placeholder="nsec1.. or hex"
          value={nsecOrHex}
          onChange={handleInputChange}
          className={errMsg ? 'border-destructive' : ''}
        />
        {errMsg && <div className="text-xs text-destructive">{errMsg}</div>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-input">{t('password')}</Label>
        <Input
          id="password-input"
          type="password"
          placeholder={t('optional: encrypt nsec')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button className="w-fit px-8" variant="secondary" type="button" onClick={back}>
          {t('Back')}
        </Button>
        <Button className="flex-1" type="submit">
          {t('Login')}
        </Button>
      </div>
    </form>
  )
}

function NcryptsecLogin({
  back,
  onLoginSuccess
}: {
  back: () => void
  onLoginSuccess: () => void
}) {
  const { t } = useTranslation()
  const { ncryptsecLogin } = useNostr()
  const [ncryptsec, setNcryptsec] = useState('')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNcryptsec(e.target.value)
    setErrMsg(null)
  }

  const handleLogin = () => {
    if (ncryptsec === '') return

    ncryptsecLogin(ncryptsec)
      .then(() => onLoginSuccess())
      .catch((err) => {
        setErrMsg(err.message)
      })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        handleLogin()
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="ncryptsec-input">ncryptsec</Label>
        <Input
          id="ncryptsec-input"
          type="password"
          placeholder="ncryptsec1.."
          value={ncryptsec}
          onChange={handleInputChange}
          className={errMsg ? 'border-destructive' : ''}
        />
        {errMsg && <div className="text-xs text-destructive">{errMsg}</div>}
      </div>
      <div className="flex gap-2">
        <Button className="w-fit px-8" variant="secondary" type="button" onClick={back}>
          {t('Back')}
        </Button>
        <Button className="flex-1" type="submit">
          {t('Login')}
        </Button>
      </div>
    </form>
  )
}
