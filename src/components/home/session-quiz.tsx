import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

import content from '@/content.json'
import quizMascot from '@/assets/quiz-mascot.svg'
import { ActionCard } from '@/components/action-card'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { quizQuestions, resultSessionType, scoreQuiz } from '@/lib/session-quiz'

const text = content.session_quiz
const noAnswers = quizQuestions.map(() => null)

/**
 * "Which session type suits you?" card. The quiz itself opens in a dialog
 * (a bottom sheet on mobile) so the answers can't be tapped while scrolling.
 * Answers survive closing the dialog; 重新測驗 starts over. The footer and
 * result screen are not in Figma yet — this layout is a proposal.
 */
export function SessionQuiz() {
  const promptId = useId()
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(noAnswers)

  const question = quizQuestions[step]
  const answer = answers[step]
  const result =
    step === quizQuestions.length ? scoreQuiz(answers as string[]) : null

  const choose = (value: string) =>
    setAnswers((prev) => prev.map((a, i) => (i === step ? value : a)))

  const restart = () => {
    setAnswers(noAnswers)
    setStep(0)
    bubbleRef.current?.focus()
  }

  // The 看結果 button unmounts on the result step, so move focus to the
  // bubble that now announces the result.
  const next = () => {
    setStep(step + 1)
    if (step === quizQuestions.length - 1) bubbleRef.current?.focus()
  }

  return (
    <ActionCard
      icon={Search}
      title={text.title}
      description={text.description}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="dark" />}>
            {text.findSession}
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-2.5">
              <DialogTitle>{text.title}</DialogTitle>
              <DialogClose aria-label={text.close} />
            </div>
            <div className="flex items-center gap-5">
              <div
                ref={bubbleRef}
                tabIndex={-1}
                aria-live="polite"
                className="flex-1 rounded-lg rounded-bl-sm bg-light px-8.25 pt-5.5 pb-5 outline-none"
              >
                {result ? (
                  <>
                    <p className="text-paragraph font-bold text-gray">
                      {text.resultLead}
                    </p>
                    <h3 className="text-h2 font-bold">
                      {text.results[result].title}
                    </h3>
                  </>
                ) : (
                  <p id={promptId} className="text-paragraph font-bold">
                    {question.prompt}
                  </p>
                )}
              </div>
              <img src={quizMascot} alt="" className="shrink-0 rotate-6" />
            </div>
            {result ? (
              <>
                <p className="px-8.25 text-paragraph">
                  {text.results[result].description}
                </p>
                <QuizFooter>
                  <Button variant="muted" onClick={restart}>
                    {text.restart}
                  </Button>
                  <Link
                    to="/sessions/$type"
                    params={{ type: resultSessionType[result] }}
                    onClick={() => setOpen(false)}
                    className={buttonVariants({ variant: 'dark' })}
                  >
                    {text.results[result].learnMore}
                  </Link>
                </QuizFooter>
              </>
            ) : (
              <>
                <RadioGroup
                  key={step}
                  aria-labelledby={promptId}
                  className="px-6"
                  value={answer}
                  onValueChange={(value) => choose(value as string)}
                >
                  {question.answers.map(({ value, text: answerText }) => (
                    <RadioGroupItem key={value} value={value}>
                      <span>
                        <span className="font-bold">{value}</span> {answerText}
                      </span>
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
                <QuizFooter>
                  <p className="grow px-8.25 text-paragraph text-gray">
                    {text.progress
                      .replace('{current}', String(step + 1))
                      .replace('{total}', String(quizQuestions.length))}
                  </p>
                  <Button
                    variant="muted"
                    disabled={step === 0}
                    focusableWhenDisabled
                    onClick={() => setStep(step - 1)}
                  >
                    {text.back}
                  </Button>
                  <Button
                    variant="dark"
                    disabled={answer === null}
                    focusableWhenDisabled
                    onClick={next}
                  >
                    {step === quizQuestions.length - 1
                      ? text.showResult
                      : text.next}
                  </Button>
                </QuizFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      }
    />
  )
}

/** Progress and buttons under the answers; wraps on narrow screens. */
function QuizFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      {children}
    </div>
  )
}
