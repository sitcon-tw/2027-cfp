import { createFileRoute } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import content from '@/content.json'
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
import { sessionTypes } from '@/lib/session-types'

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

const sessions = sessionTypes.map(({ id, title }) => ({ value: id, title }))

const answers = content.session_quiz.question.answers

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
    <main className="pt-header pb-20">
      <div className="px-2.5 pt-7.5">
        <nav className="mx-auto flex max-w-content items-center justify-between rounded-full bg-black/35 px-10 py-5 backdrop-blur-lg">
          <span className="text-subheading font-bold">
            {content.playground.title}
          </span>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  {content.playground.submission}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#general">
                    {content.playground.generalSession}
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#open">
                    {content.playground.openSession}
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#demo">
                    {content.playground.demoSession}
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink topLevel href="#sponsor">
                  {content.playground.sponsor}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink topLevel href="/">
                  {content.playground.home}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>

      <Section
        title={content.playground.buttonsTitle}
        hint={content.playground.buttonsHint}
      >
        <div className="flex flex-wrap items-center gap-5">
          <Button variant="dark" onClick={() => setClicks((n) => n + 1)}>
            {content.playground.clickButton}
          </Button>
          <Button
            variant="muted"
            onClick={() => setDisabled((value) => !value)}
          >
            {disabled
              ? content.playground.enableAll
              : content.playground.disableAll}
          </Button>
          <Readout>
            {content.playground.clickReadout
              .replace('{clicks}', String(clicks))
              .replace(
                '{disabled}',
                content.playground.booleanLabels[
                  String(disabled) as 'true' | 'false'
                ],
              )}
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
                  {content.playground.variants[variant]}{' '}
                  {content.playground.sizes[size]}
                </Button>
              ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-5">
          <a href="#button" className={buttonVariants({ variant: 'cream' })}>
            {content.playground.linkExample}
          </a>
          <Button variant="dark" disabled={disabled} focusableWhenDisabled>
            {content.playground.focusableDisabled}
          </Button>
        </div>
      </Section>

      <Section title={content.playground.creamButtonsTitle} light>
        <div className="flex flex-wrap items-center gap-5">
          <Button variant="dark">{content.playground.findSession}</Button>
          <Button variant="muted">{content.playground.mutedButton}</Button>
          {[1, 2, 3].map((n) => (
            <Button
              key={n}
              variant="outline"
              size="icon"
              aria-label={content.playground.iconButton.replace(
                '{number}',
                String(n),
              )}
              disabled={disabled}
            >
              <Mail />
            </Button>
          ))}
        </div>
      </Section>

      <Section
        title={content.playground.tabsTitle}
        hint={content.playground.tabsHint}
      >
        <Readout>
          {content.playground.tabValue.replace(
            '{value}',
            content.playground.sessionValues[
              tab as 'general' | 'open' | 'demo'
            ],
          )}
        </Readout>
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
                <p className="text-paragraph">
                  {content.playground.sessionIntro.replace('{title}', title)}
                </p>
              </Card>
            </TabsPanel>
          ))}
        </Tabs>
        <Readout>{content.playground.verticalReadout}</Readout>
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
        title={content.playground.radioTitle}
        hint={content.playground.radioHint}
      >
        <Readout>
          {content.playground.answerValue.replace(
            '{value}',
            answer ?? content.playground.noAnswer,
          )}
        </Readout>
        <Card className="flex flex-col gap-5 rounded-xl px-7.5 py-4">
          <p
            id="quiz-question"
            className="rounded-lg rounded-bl-sm bg-light px-8 pt-5.5 pb-5 text-paragraph font-bold"
          >
            {content.playground.question}
          </p>
          <RadioGroup
            aria-labelledby="quiz-question"
            value={answer}
            onValueChange={(value) => setAnswer(value as string)}
            disabled={disabled}
          >
            {answers.map(({ value: letter, text }) => (
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
            {content.playground.reset}
          </Button>
        </Card>
      </Section>

      <Section
        title={content.playground.cardsTitle}
        hint={content.playground.cardsHint}
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
              <p className="text-h3 font-bold">
                {content.playground.tones[tone]}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title={content.playground.separatorTitle} light>
        <Separator />
        <div className="flex h-12.5 items-center gap-5">
          <span>{content.playground.left}</span>
          <Separator orientation="vertical" />
          <span>{content.playground.right}</span>
        </div>
      </Section>

      <Section title={content.playground.placeholderTitle}>
        <Placeholder label={content.playground.placeholder} />
      </Section>

      <Section
        title={content.playground.typographyTitle}
        hint={content.playground.typographyHint}
      >
        <div className="flex flex-col gap-2.5">
          <p className="text-display font-extrabold">
            {content.playground.displayExample}
          </p>
          <p className="text-h1 font-extrabold">
            {content.playground.h1Example}
          </p>
          <p className="text-eyebrow font-extrabold">
            {content.playground.eyebrowExample}
          </p>
          <p className="text-h2 font-bold">{content.playground.h2Example}</p>
          <p className="text-h3 font-bold">{content.playground.h3Example}</p>
          <p className="text-lead font-extrabold">
            {content.playground.leadExample}
          </p>
          <p className="text-paragraph">
            {content.playground.paragraphExample}
          </p>
          <p className="text-subheading font-bold">
            {content.playground.subheadingExample}
          </p>
          <p className="text-body">{content.playground.bodyExample}</p>
          <p className="text-caption">{content.playground.captionExample}</p>
          <p className="font-numeric text-paragraph font-medium">
            {content.playground.numericExample}
          </p>
        </div>
      </Section>
    </main>
  )
}
