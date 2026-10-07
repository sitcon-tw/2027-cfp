import { createFileRoute } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Placeholder } from '@/components/placeholder'
import {
  Button,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/button'
import { Card, type CardTone } from '@/components/ui/card'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'

// Temporary page for testing the primitives by hand. Delete once the real
// pages exist.

export const Route = createFileRoute('/playground')({
  component: Playground,
})

const buttonVariantList: ButtonVariant[] = [
  'red',
  'blue',
  'green',
  'cream',
  'muted',
  'dark',
  'outline',
]

const cardTones: CardTone[] = ['cream', 'light', 'gray', 'ink']

const sessions = [
  { value: 'general', title: '一般議程' },
  { value: 'open', title: '開放式議程' },
  { value: 'demo', title: 'Demo 展' },
]

const answers = [
  ['A', '用不長的時間，分享一個最近很想讓大家知道的新資訊、idea 或經驗'],
  ['B', '好好把一個主題從頭到尾講清楚，讓大家完整理解'],
  ['C', '做一件平常不一定做得到的事，沒有一定要得到什麼標準答案'],
  ['D', '顧著自己的攤位，讓大家走過來看看、問問題、互動或實際體驗作品'],
]

function Section({
  title,
  hint,
  light = false,
  children,
}: {
  title: string
  hint?: string
  light?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={light ? 'bg-foreground py-12.5 text-background' : 'py-12.5'}
    >
      <div className="mx-auto flex max-w-content flex-col gap-5 px-2.5">
        <div>
          <h2 className="text-h2 font-bold">{title}</h2>
          {hint && <p className="text-body opacity-70">{hint}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}

function Readout({ children }: { children: ReactNode }) {
  return (
    <p className="font-numeric text-body font-medium opacity-70">{children}</p>
  )
}

function Playground() {
  const [clicks, setClicks] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [tab, setTab] = useState<string>('general')
  const [answer, setAnswer] = useState<string | null>(null)

  return (
    <main className="pb-20">
      <div className="px-2.5 pt-7.5">
        <nav className="mx-auto flex max-w-content items-center justify-between rounded-full bg-black/35 px-10 py-5 backdrop-blur-lg">
          <span className="text-subheading font-bold">Playground</span>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>徵稿說明</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#general">
                    一般議程
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#open">
                    開放式議程
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#demo">Demo 展</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink topLevel href="#sponsor">
                  贊助 SITCON
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink topLevel href="/">
                  回首頁
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>

      <Section
        title="Button"
        hint="Every variant × size. Tab through them to check the focus ring."
      >
        <div className="flex flex-wrap items-center gap-5">
          <Button variant="dark" onClick={() => setClicks((n) => n + 1)}>
            Click me
          </Button>
          <Button
            variant="muted"
            onClick={() => setDisabled((value) => !value)}
          >
            {disabled ? 'Enable all' : 'Disable all'}
          </Button>
          <Readout>
            clicks: {clicks} · disabled: {String(disabled)}
          </Readout>
        </div>
        {(['md', 'lg'] as ButtonSize[]).map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-5">
            {buttonVariantList
              .filter((variant) => variant !== 'outline')
              .map((variant) => (
                <Button
                  key={variant}
                  variant={variant}
                  size={size}
                  disabled={disabled}
                >
                  {variant} {size}
                </Button>
              ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-5">
          <a href="#button" className={buttonVariants({ variant: 'cream' })}>
            {'<a> via buttonVariants'}
          </a>
          <Button variant="dark" disabled={disabled} focusableWhenDisabled>
            focusableWhenDisabled
          </Button>
        </div>
      </Section>

      <Section title="Button on cream" light>
        <div className="flex flex-wrap items-center gap-5">
          <Button variant="dark">幫我找議程類型 →</Button>
          <Button variant="muted">muted</Button>
          {[1, 2, 3].map((n) => (
            <Button
              key={n}
              variant="outline"
              size="icon"
              aria-label={`Icon button ${n}`}
              disabled={disabled}
            >
              <Mail />
            </Button>
          ))}
        </div>
      </Section>

      <Section
        title="Tabs"
        hint="Arrow keys move focus; Enter or Space activates. 'Disable all' disables Demo 展."
      >
        <Readout>value: {tab}</Readout>
        <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
          <TabsList>
            {sessions.map(({ value, title }) => (
              <TabsTab
                key={value}
                value={value}
                disabled={disabled && value === 'demo'}
              >
                {title}
              </TabsTab>
            ))}
          </TabsList>
          {sessions.map(({ value, title }) => (
            <TabsPanel key={value} value={value}>
              <Card tone="gray" className="rounded-xl px-10 py-6">
                <p className="text-paragraph">「{title}」的介紹文字。</p>
              </Card>
            </TabsPanel>
          ))}
        </Tabs>
        <Readout>orientation=&quot;vertical&quot;</Readout>
        <Tabs
          orientation="vertical"
          value={tab}
          onValueChange={(value) => setTab(String(value))}
          className="w-1/2"
        >
          <TabsList>
            {sessions.map(({ value, title }) => (
              <TabsTab key={value} value={value}>
                {title}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </Section>

      <Section
        title="RadioGroup"
        hint="Arrow keys move and select. 'Disable all' disables the group."
      >
        <Readout>value: {answer ?? 'null'}</Readout>
        <Card className="flex flex-col gap-5 rounded-xl px-7.5 py-4">
          <p
            id="quiz-question"
            className="rounded-lg rounded-bl-sm bg-light px-8 pt-5.5 pb-5 text-paragraph font-bold"
          >
            如果明天就是 SITCON，你最希望自己的議程現場長什麼樣子？
          </p>
          <RadioGroup
            aria-labelledby="quiz-question"
            value={answer}
            onValueChange={(value) => setAnswer(value as string)}
            disabled={disabled}
          >
            {answers.map(([letter, text]) => (
              <RadioGroupItem key={letter} value={letter}>
                <span>
                  <span className="font-bold">{letter}</span> {text}
                </span>
              </RadioGroupItem>
            ))}
          </RadioGroup>
          <Button
            variant="muted"
            className="self-start"
            onClick={() => setAnswer(null)}
          >
            Reset
          </Button>
        </Card>
      </Section>

      <Section
        title="Card"
        hint="Default rounded-sm; outer corners per the corner rule."
      >
        <div className="grid grid-cols-4 gap-2.5">
          {cardTones.map((tone, index) => (
            <Card
              key={tone}
              tone={tone}
              className={
                index === 0
                  ? 'rounded-l-xl p-5'
                  : index === cardTones.length - 1
                    ? 'rounded-r-xl p-5'
                    : 'p-5'
              }
            >
              <p className="text-h3 font-bold">{tone}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Separator" light>
        <Separator />
        <div className="flex h-12.5 items-center gap-5">
          <span>left</span>
          <Separator orientation="vertical" />
          <span>right</span>
        </div>
      </Section>

      <Section title="Placeholder">
        <Placeholder label="Nathan 詠唱" />
      </Section>

      <Section title="Typography" hint="Every text-* token.">
        <div className="flex flex-col gap-2.5">
          <p className="text-display font-extrabold">display</p>
          <p className="text-h1 font-extrabold">h1 我要贊助</p>
          <p className="text-eyebrow font-extrabold">eyebrow SITCON 2027</p>
          <p className="text-h2 font-bold">h2 甚麼是 SITCON ?</p>
          <p className="text-h3 font-bold">h3 一般議程</p>
          <p className="text-lead font-extrabold">lead 加入行事曆</p>
          <p className="text-paragraph">paragraph 段落文字</p>
          <p className="text-subheading font-bold">subheading 連結</p>
          <p className="text-body">body 首頁</p>
          <p className="text-caption">caption 學生計算機年會</p>
          <p className="font-numeric text-paragraph font-medium">
            numeric 2027 / 03 / 13
          </p>
        </div>
      </Section>
    </main>
  )
}
