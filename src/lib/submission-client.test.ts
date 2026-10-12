import { describe, expect, it } from 'vitest'

import { getSubmissionFields } from '@/lib/submission'
import { createSubmissionStore } from '@/lib/submission-client'

const validText: Record<string, string> = {
  email: 'speaker@example.com',
  tel: '0912-345-678',
  url: 'https://example.com/answer',
}

/** Answers every 一般議程 question validly. */
function fill(store: ReturnType<typeof createSubmissionStore>) {
  for (const field of getSubmissionFields('general')) {
    const option = field.options?.[0]
    store.setValue(
      'general',
      field.key,
      field.kind === 'checkboxes'
        ? [option!]
        : (option ?? validText[field.kind] ?? 'answer'),
    )
  }
}

describe('submission store', () => {
  it('shows and clears one field error, as on blur', () => {
    const store = createSubmissionStore()
    store.setValue('general', 'contactEmail', 'speaker@')
    store.validateField('general', 'contactEmail')
    expect(store.getSnapshot().general.errors).toEqual({
      contactEmail: expect.any(String),
    })

    store.setValue('general', 'contactEmail', 'speaker@example.com')
    store.validateField('general', 'contactEmail')
    expect(store.getSnapshot().general.errors).toEqual({})
  })

  it('shows every error on submit without sending', async () => {
    const store = createSubmissionStore()
    store.setValue('general', 'contactEmail', 'speaker@')
    store.validateField('general', 'contactEmail')

    await store.submit('general', null)
    const state = store.getSnapshot().general
    expect(state.isSubmitting).toBe(false)
    expect(state.result?.status).toBe('field-error')
    expect(Object.keys(state.errors)).toContain('contactEmail')
    expect(Object.keys(state.errors)).toContain('title')
  })

  it('keeps errors unchanged while sending, then replaces them', async () => {
    const store = createSubmissionStore()
    fill(store)
    const before = store.getSnapshot().general.errors

    const sending = store.submit('general', null)
    expect(store.getSnapshot().general.isSubmitting).toBe(true)
    expect(store.getSnapshot().general.errors).toBe(before)

    await sending
    const state = store.getSnapshot().general
    expect(state.result?.status).toBe('success')
    expect(state.errors).not.toBe(before)
  })
})
