import { Mic, TvMinimalPlay, Mail, Users } from 'lucide-react'

import { Placeholder } from '@/components/placeholder'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

// Temporary primitives preview — replace with the homepage.

const sessions = [
  {
    value: 'general',
    icon: Mic,
    title: '一般議程',
    meta: '40 分鐘 / 10 分鐘深度分享',
    corners: 'rounded-tl-xl',
  },
  {
    value: 'open',
    icon: Users,
    title: '開放式議程',
    meta: '40 分鐘 / 90 分鐘互動',
    corners: '',
  },
  {
    value: 'demo',
    icon: TvMinimalPlay,
    title: 'Demo 展',
    meta: '現場展示你的作品',
    corners: 'rounded-bl-xl',
  },
]

const answers = [
  ['A', '用不長的時間，分享一個最近很想讓大家知道的新資訊、idea 或經驗'],
  ['B', '好好把一個主題從頭到尾講清楚，讓大家完整理解'],
  ['C', '做一件平常不一定做得到的事，沒有一定要得到什麼標準答案'],
  ['D', '顧著自己的攤位，讓大家走過來看看、問問題、互動或實際體驗作品'],
]

function App() {
  return (
    <main className="flex flex-col gap-20 pb-20">
      <div className="px-2.5 pt-7.5">
        <nav className="mx-auto flex max-w-content items-center justify-between rounded-full bg-black/35 px-10 py-5 backdrop-blur-lg">
          <span className="text-subheading font-bold">SITCON</span>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>徵稿說明</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#">一般議程</NavigationMenuLink>
                  <NavigationMenuLink href="#">開放式議程</NavigationMenuLink>
                  <NavigationMenuLink href="#">Demo 展</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink topLevel href="#">
                  贊助 SITCON
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink topLevel href="#">
                  關於 SITCON
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>

      <section className="mx-auto flex w-full max-w-content flex-col gap-5 px-2.5">
        <p className="text-eyebrow font-extrabold">SITCON 2027</p>
        <h1 className="text-display font-extrabold">Call For Papers</h1>
        <div className="flex flex-wrap gap-6">
          <Button variant="red">我要參加</Button>
          <Button variant="blue">我要投稿</Button>
          <Button variant="green">我要贊助</Button>
          <Button variant="cream">了解 SITCON</Button>
          <Button variant="muted" size="lg">
            加入行事曆
          </Button>
          <a href="#" className={buttonVariants({ variant: 'cream' })}>
            連結按鈕
          </a>
          <Button variant="cream" disabled>
            停用
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-content grid-cols-[383fr_573fr] gap-2.5 px-2.5">
        <Card className="rounded-l-xl px-10 py-7.5">
          <p className="text-h3 font-bold">投稿截止</p>
          <p className="font-numeric text-paragraph font-medium">
            2027 / ?? / ??
          </p>
        </Card>
        <Card className="flex items-center justify-between rounded-r-xl py-7.5 pr-10 pl-10">
          <div>
            <p className="text-h3 font-bold">倒數</p>
            <p className="font-numeric text-paragraph font-medium">
              XX D XX h XX min
            </p>
          </div>
          <Button variant="muted" size="lg">
            加入行事曆
          </Button>
        </Card>
      </section>

      <Placeholder
        label="Nathan 詠唱"
        className="mx-auto w-full max-w-content"
      />

      <section className="mx-auto flex w-full max-w-content flex-col gap-5 px-2.5">
        <h2 className="text-center text-h2 font-bold">
          想要成為舞臺上的講者？
        </h2>
        <Tabs orientation="vertical" defaultValue="general">
          <TabsList className="flex-1">
            {sessions.map(({ value, icon: Icon, title, meta, corners }) => (
              <TabsTab key={value} value={value} className={corners}>
                <Icon className="mx-2.5 size-10 shrink-0" strokeWidth={1.5} />
                <span className="flex flex-col px-2.5 py-2.5">
                  <span className="text-h3 font-bold">{title}</span>
                  <span className="text-paragraph text-gray">{meta}</span>
                </span>
              </TabsTab>
            ))}
          </TabsList>
          {sessions.map(({ value, title }) => (
            <TabsPanel key={value} value={value}>
              <Card tone="gray" className="h-full rounded-r-xl px-10 py-6">
                <p className="text-h3 font-bold">{title}</p>
                <p className="text-paragraph">議程介紹文字。</p>
              </Card>
            </TabsPanel>
          ))}
        </Tabs>
      </section>

      <section className="mx-auto w-full max-w-content px-2.5">
        <Card className="flex flex-col gap-5 rounded-xl px-7.5 py-4">
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-h3 font-bold">不知道你適合哪一種議程？</p>
            <Button variant="dark">幫我找議程類型 →</Button>
          </div>
          <Separator />
          <RadioGroup aria-label="如果明天就是 SITCON，你最希望自己的議程現場長什麼樣子？">
            {answers.map(([letter, text]) => (
              <RadioGroupItem key={letter} value={letter}>
                <span>
                  <span className="font-bold">{letter}</span> {text}
                </span>
              </RadioGroupItem>
            ))}
          </RadioGroup>
          <Placeholder label="佔位" className="min-h-0" />
        </Card>
      </section>

      <section className="bg-foreground py-20 text-background">
        <div className="mx-auto flex max-w-content flex-col gap-5 px-2.5">
          <h2 className="text-h1 font-extrabold">我要贊助</h2>
          <Separator />
          <div className="flex gap-5">
            <Card tone="light" className="p-5">
              light
            </Card>
            <Card tone="gray" className="p-5">
              gray
            </Card>
            <Card tone="ink" className="p-5">
              ink
            </Card>
            <Button variant="outline" size="icon" aria-label="Email">
              <Mail />
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
