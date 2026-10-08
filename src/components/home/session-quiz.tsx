import { Search } from 'lucide-react'
import { useId, useState } from 'react'

import content from '@/content.json'
import quizMascot from '@/assets/quiz-mascot.svg'
import { Placeholder } from '@/components/placeholder'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Only the first of the three questions is designed so far.
const question = content.session_quiz.question

/**
 * "Which session type suits you?" card. The quiz itself opens in a dialog
 * (a bottom sheet on mobile) so the answers can't be tapped while scrolling.
 */
export function SessionQuiz() {
  const promptId = useId()
  const [answer, setAnswer] = useState<string | null>(null)

  return (
    <Card className="rounded-xl py-4 pr-7.5 pl-5">
      <div className="flex flex-wrap items-center gap-2.5 pl-1.25">
        <Search className="mx-2.5 size-12 shrink-0" />
        <div className="grow basis-60 p-2.5">
          <h3 className="text-h3 font-bold">{content.session_quiz.title}</h3>
          <p className="text-paragraph text-gray">
            {content.session_quiz.description}
          </p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button variant="dark" />}>
            {content.session_quiz.findSession}
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-2.5">
              <DialogTitle>{content.session_quiz.title}</DialogTitle>
              <DialogClose aria-label={content.session_quiz.close} />
            </div>
            <div className="flex items-center gap-5">
              <p
                id={promptId}
                className="flex-1 rounded-lg rounded-bl-sm bg-light px-8.25 pt-5.5 pb-5 text-paragraph font-bold"
              >
                {question.prompt}
              </p>
              <img src={quizMascot} alt="" className="shrink-0 rotate-6" />
            </div>
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
            <Placeholder
              label={content.session_quiz.placeholder}
              className="min-h-0 rounded-lg rounded-tl-sm"
            />
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
