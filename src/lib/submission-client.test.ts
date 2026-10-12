import { describe, expect, it } from 'vitest'

import { getSubmissionFields } from '@/lib/submission'
import {
  createSubmissionStore,
  type DraftStorage,
  type StoredDrafts,
} from '@/lib/submission-client'

const validText: Record<string, string> = {
  email: 'speaker@example.com',
  tel: '0912-345-678',
  url: 'https://example.com/answer',
}

/** Keeps drafts in memory, as localStorage would between page loads. */
function memoryStorage(initial: StoredDrafts | null = null) {
  const storage: DraftStorage & { drafts: StoredDrafts | null } = {
    drafts: initial,
    load: () => (storage.drafts ? structuredClone(storage.drafts) : null),
    save: (drafts) => {
      storage.drafts = structuredClone(drafts)
    },
    clear: () => {
      storage.drafts = null
    },
  }
  return storage
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

  it('keeps 基本資料 in step across types, but not the proposal', () => {
    const store = createSubmissionStore()
    store.setValue('general', 'name', 'Ada')
    store.setValue('general', 'title', 'A talk')
    const { open, demo } = store.getSnapshot()
    expect(open.values.name).toBe('Ada')
    expect(demo.values.name).toBe('Ada')
    expect(open.values.title).toBe('')
  })

  it('restores saved drafts and drops answers that no longer fit', () => {
    const storage = memoryStorage()
    const first = createSubmissionStore({ storage })
    first.setValue('open', 'name', 'Ada')
    first.setValue('open', 'title', 'Open talk')

    const second = createSubmissionStore({
      storage: memoryStorage({
        ...storage.drafts!,
        types: {
          ...storage.drafts!.types,
          open: { ...storage.drafts!.types.open, duration: 'not an option' },
        },
      }),
    })
    const { general, open } = second.getSnapshot()
    expect(general.values.name).toBe('Ada')
    expect(open.values.title).toBe('Open talk')
    expect(open.values.duration).toBe('')
  })

  it('forgets a sent draft but keeps 基本資料 for the next type', async () => {
    const storage = memoryStorage()
    const store = createSubmissionStore({ storage })
    fill(store)
    await store.submit('general', null)
    expect(storage.drafts?.types.general).toBeUndefined()

    const next = createSubmissionStore({ storage })
    const { general, demo } = next.getSnapshot()
    expect(general.values.title).toBe('')
    expect(general.values.name).toBe('answer')
    expect(demo.values.name).toBe('answer')
  })

  it('clears every draft and the saved copy', () => {
    const storage = memoryStorage()
    const store = createSubmissionStore({ storage })
    store.setValue('general', 'name', 'Ada')
    store.setValue('demo', 'title', 'A demo')
    store.clearDrafts()
    expect(storage.drafts).toBeNull()
    expect(store.getSnapshot().general.values.name).toBe('')
    expect(store.getSnapshot().demo.values.title).toBe('')
  })
})
