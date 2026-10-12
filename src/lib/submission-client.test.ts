import { describe, expect, it } from 'vitest'

import { getSubmissionFields } from '@/lib/submission'
import {
  createSubmissionStore,
  type DraftStorage,
  type StoredDrafts,
  upgradeDrafts,
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
  for (const field of getSubmissionFields('normal')) {
    const option = field.options?.[0]
    store.setValue(
      'normal',
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
    store.setValue('normal', 'contactEmail', 'speaker@')
    store.validateField('normal', 'contactEmail')
    expect(store.getSnapshot().normal.errors).toEqual({
      contactEmail: expect.any(String),
    })

    store.setValue('normal', 'contactEmail', 'speaker@example.com')
    store.validateField('normal', 'contactEmail')
    expect(store.getSnapshot().normal.errors).toEqual({})
  })

  it('shows every error on submit without sending', async () => {
    const store = createSubmissionStore()
    store.setValue('normal', 'contactEmail', 'speaker@')
    store.validateField('normal', 'contactEmail')

    await store.submit('normal', null)
    const state = store.getSnapshot().normal
    expect(state.isSubmitting).toBe(false)
    expect(state.result?.status).toBe('field-error')
    expect(Object.keys(state.errors)).toContain('contactEmail')
    expect(Object.keys(state.errors)).toContain('title')
  })

  it('keeps errors unchanged while sending, then replaces them', async () => {
    const store = createSubmissionStore()
    fill(store)
    const before = store.getSnapshot().normal.errors

    const sending = store.submit('normal', null)
    expect(store.getSnapshot().normal.isSubmitting).toBe(true)
    expect(store.getSnapshot().normal.errors).toBe(before)

    await sending
    const state = store.getSnapshot().normal
    expect(state.result?.status).toBe('success')
    expect(state.errors).not.toBe(before)
  })

  it('keeps 基本資料 in step across types, but not the proposal', () => {
    const store = createSubmissionStore()
    store.setValue('normal', 'name', 'Ada')
    store.setValue('normal', 'title', 'A talk')
    const { undefined: open, demo } = store.getSnapshot()
    expect(open.values.name).toBe('Ada')
    expect(demo.values.name).toBe('Ada')
    expect(open.values.title).toBe('')
  })

  it('restores saved drafts and drops answers that no longer fit', () => {
    const storage = memoryStorage()
    const first = createSubmissionStore({ storage })
    first.setValue('undefined', 'name', 'Ada')
    first.setValue('undefined', 'title', 'Open talk')

    const second = createSubmissionStore({
      storage: memoryStorage({
        ...storage.drafts!,
        types: {
          ...storage.drafts!.types,
          undefined: {
            ...storage.drafts!.types.undefined,
            duration: 'not an option',
          },
        },
      }),
    })
    const { normal, undefined: open } = second.getSnapshot()
    expect(normal.values.name).toBe('Ada')
    expect(open.values.title).toBe('Open talk')
    expect(open.values.duration).toBe('')
  })

  it('moves drafts saved under the previous ids', () => {
    const drafts = {
      shared: { name: 'Ada' },
      types: { general: { title: 'A talk' }, open: { title: 'Open talk' } },
    } as unknown as StoredDrafts
    expect(upgradeDrafts(drafts).types).toEqual({
      normal: { title: 'A talk' },
      undefined: { title: 'Open talk' },
    })
  })

  it('forgets a sent draft but keeps 基本資料 for the next type', async () => {
    const storage = memoryStorage()
    const store = createSubmissionStore({ storage })
    fill(store)
    await store.submit('normal', null)
    expect(storage.drafts?.types.normal).toBeUndefined()

    const next = createSubmissionStore({ storage })
    const { normal, demo } = next.getSnapshot()
    expect(normal.values.title).toBe('')
    expect(normal.values.name).toBe('answer')
    expect(demo.values.name).toBe('answer')
  })

  it('clears every draft and the saved copy', () => {
    const storage = memoryStorage()
    const store = createSubmissionStore({ storage })
    store.setValue('normal', 'name', 'Ada')
    store.setValue('demo', 'title', 'A demo')
    store.clearDrafts()
    expect(storage.drafts).toBeNull()
    expect(store.getSnapshot().normal.values.name).toBe('')
    expect(store.getSnapshot().demo.values.title).toBe('')
  })
})
