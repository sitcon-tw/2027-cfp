import content from '@/content.json'
import type { SessionTypeId } from '@/lib/session-types'

export const quizQuestions = content.session_quiz.questions

/** The quiz scores four outcomes; Espresso and Presentation are both 一般議程. */
export const quizResultIds = [
  'espresso',
  'presentation',
  'open',
  'demo',
] as const

export type QuizResultId = (typeof quizResultIds)[number]

/** The session page each result links to. */
export const resultSessionType: Record<QuizResultId, SessionTypeId> = {
  espresso: 'normal',
  presentation: 'normal',
  open: 'undefined',
  demo: 'demo',
}

type Scores = Record<QuizResultId, number>

/** The outcome an answer scores highest, i.e. the one it stands for. */
function primaryOf(scores: Scores): QuizResultId {
  return quizResultIds.reduce((best, id) =>
    scores[id] > scores[best] ? id : best,
  )
}

/**
 * Sums the chosen answers' scores (one answer `value` per question, in
 * order) and ranks every outcome, best first. On a tie for the top, the
 * outcome picked most recently as an answer's primary wins (Q3, then Q2,
 * then Q1); the rest follow by total, then in `quizResultIds` order.
 */
export function rankQuiz(answers: readonly string[]): QuizResultId[] {
  const picked = answers.map(
    (value, i) =>
      quizQuestions[i].answers.find((answer) => answer.value === value)!.scores,
  )

  const totals = Object.fromEntries(
    quizResultIds.map((id) => [
      id,
      picked.reduce((sum, scores) => sum + scores[id], 0),
    ]),
  ) as Scores
  const top = Math.max(...quizResultIds.map((id) => totals[id]))
  const tied = quizResultIds.filter((id) => totals[id] === top)

  const winner =
    picked
      .map(primaryOf)
      .reverse()
      .find((id) => tied.includes(id)) ?? tied[0]
  const rest = quizResultIds
    .filter((id) => id !== winner)
    .sort((a, b) => totals[b] - totals[a])
  return [winner, ...rest]
}
