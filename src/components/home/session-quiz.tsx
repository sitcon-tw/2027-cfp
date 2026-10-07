import { Search } from 'lucide-react'
import { useId, useState } from 'react'

import quizMascot from '@/assets/quiz-mascot.svg'
import { Placeholder } from '@/components/placeholder'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

// Only the first of the three questions is designed so far.
const question = {
  prompt: '如果明天就是 SITCON，你最希望自己的議程現場長什麼樣子？',
  answers: [
    {
      value: 'A',
      text: '用不長的時間，分享一個最近很想讓大家知道的新資訊、idea 或經驗',
    },
    { value: 'B', text: '好好把一個主題從頭到尾講清楚，讓大家完整理解' },
    {
      value: 'C',
      text: '做一件平常不一定做得到的事，沒有一定要得到什麼標準答案',
    },
    {
      value: 'D',
      text: '顧著自己的攤位，讓大家走過來看看、問問題、互動或實際體驗作品',
    },
  ],
}

/** "Which session type suits you?" quiz card. */
export function SessionQuiz() {
  const promptId = useId()
  const [answer, setAnswer] = useState<string | null>(null)

  return (
    <Card className="rounded-xl py-4 pr-7.5 pl-5">
      <div className="flex flex-wrap items-center gap-2.5 pl-1.25">
        <Search className="mx-2.5 size-12 shrink-0" />
        <div className="grow basis-60 p-2.5">
          <h3 className="text-h3 font-bold">不知道你適合哪一種議程？</h3>
          <p className="text-paragraph text-gray">
            回答 3 個小問題，一起找找適合你的分享方式。
          </p>
        </div>
        {/* TODO: behavior is not designed yet (start or reveal the quiz?). */}
        <Button variant="dark">幫我找議程類型 →</Button>
      </div>

      <div className="py-2.5 pr-2.5 pl-5">
        <Separator className="rounded-full bg-background/50 data-[orientation=horizontal]:h-0.5" />
      </div>

      <div className="pl-1.25">
        <div className="flex items-center gap-5 px-2.5 py-3.75">
          <p
            id={promptId}
            className="flex-1 rounded-lg rounded-bl-sm bg-light px-8.25 pt-5.5 pb-5 text-paragraph font-bold"
          >
            {question.prompt}
          </p>
          <img src={quizMascot} alt="" className="shrink-0 rotate-6" />
        </div>
        <div className="px-2.5 pb-3.75">
          <RadioGroup
            aria-labelledby={promptId}
            className="px-6"
            value={answer}
            onValueChange={(value) => setAnswer(value as string)}
          >
            {question.answers.map(({ value, text }) => (
              <RadioGroupItem key={value} value={value}>
                <span>
                  <span className="font-bold">{value}</span> {text}
                </span>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
        <div className="px-2.5 pb-3.75">
          <Placeholder
            label="佔位"
            className="min-h-0 rounded-lg rounded-tl-sm"
          />
        </div>
      </div>
    </Card>
  )
}
