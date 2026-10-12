import { describe, expect, it } from 'vitest'

import type { SessionTypeId } from '@/lib/session-type-ids'
import type { SubmissionValues } from '@/lib/submission'

import type { EmailMessage } from './gmail'
import {
  createSubmission,
  HttpError,
  loadEdit,
  saveEdit,
  verify,
  type Deps,
} from './handlers'
import { MemoryStore, validValues } from './test-utils'
import { createEditToken } from './tokens'

const open = Date.parse('2026-11-01T12:00:00+08:00')
const closed = Date.parse('2027-01-16T00:00:00+08:00')

function setup(now = open) {
  const stores = new Map<SessionTypeId, MemoryStore>()
  const sent: EmailMessage[] = []
  const mailed = new Map<string, number>()
  const tokens: unknown[] = []
  const deps: Deps = {
    async store(type) {
      if (!stores.has(type)) stores.set(type, new MemoryStore())
      return stores.get(type)!
    },
    async send(message) {
      sent.push(message)
    },
    async mailQuota(address) {
      const count = (mailed.get(address) ?? 0) + 1
      if (count > 3) return 'mail-limit'
      mailed.set(address, count)
      return 'ok'
    },
    // Each test passes the check unless it swaps this out.
    async isHuman(token) {
      tokens.push(token)
      return true
    },
    secret: 'test-secret',
    siteUrl: 'https://sitcon.org/2027/cfp/',
    now,
  }
  const store = (type: SessionTypeId) => stores.get(type)!
  return { deps, sent, store, tokens }
}

const robot: Partial<Deps> = { isHuman: async () => false }

/** The token in the last email's button link. */
function lastToken(sent: EmailMessage[], param: 'token' | 'edit') {
  const link = /https:\/\/sitcon\.org\/2027\/cfp\/\S+/.exec(sent.at(-1)!.text)
  return new URL(link![0]).searchParams.get(param)!
}

async function rejects(promise: Promise<unknown>, status: number) {
  const error = await promise.then(
    () => null,
    (error: unknown) => error,
  )
  expect(error).toBeInstanceOf(HttpError)
  expect((error as HttpError).status).toBe(status)
  return error as HttpError
}

async function submitAndVerify(
  deps: Deps,
  sent: EmailMessage[],
  values: SubmissionValues = validValues('general'),
) {
  await createSubmission({ type: 'general', values }, deps)
  await verify({ token: lastToken(sent, 'token') }, deps)
  return `Bearer ${lastToken(sent, 'edit')}`
}

describe('submitting', () => {
  it('saves an unverified row and emails only a link', async () => {
    const { deps, sent, store } = setup()
    const values = validValues('general', { title: 'SECRET TITLE' })
    expect(await createSubmission({ type: 'general', values }, deps)).toEqual({
      status: 'pending',
      email: 'speaker@example.com',
    })
    expect(store('general').summary()).toEqual([[1, '未驗證']])
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe('speaker@example.com')
    expect(sent[0].text).toContain(
      'https://sitcon.org/2027/cfp/submit/verify?token=',
    )
    // The verification email never echoes what was typed into the form.
    expect(sent[0].text + sent[0].html).not.toContain('SECRET TITLE')
  })

  it('returns field errors from the shared validation', async () => {
    const { deps } = setup()
    const error = await rejects(
      createSubmission(
        { type: 'general', values: validValues('general', { title: '' }) },
        deps,
      ),
      422,
    )
    expect(Object.keys(error.body.errors!)).toEqual(['title'])
  })

  it('rejects unknown types and closes at the deadline', async () => {
    await rejects(
      createSubmission({ type: 'x', values: {} }, setup().deps),
      400,
    )
    await rejects(
      createSubmission(
        { type: 'general', values: validValues('general') },
        setup(closed).deps,
      ),
      403,
    )
  })

  it('limits verification emails per address, before saving', async () => {
    const { deps, sent, store } = setup()
    const body = { type: 'general', values: validValues('general') }
    for (let i = 0; i < 3; i++) await createSubmission(body, deps)
    const error = await rejects(createSubmission(body, deps), 429)
    expect(error.body.error).toBe('mail-limit')
    expect(store('general').rows).toHaveLength(3)
    expect(sent).toHaveLength(3)
  })

  it('needs a passed Turnstile check, before saving or mailing', async () => {
    const { deps, sent, store, tokens } = setup()
    const values = validValues('general')
    await createSubmission(
      { type: 'general', values, turnstileToken: 't' },
      deps,
    )
    expect(tokens).toEqual(['t'])

    const error = await rejects(
      createSubmission({ type: 'general', values }, { ...deps, ...robot }),
      403,
    )
    expect(error.body.error).toBe('captcha')
    expect(store('general').rows).toHaveLength(1)
    expect(sent).toHaveLength(1)
  })
})

describe('verifying', () => {
  it('verifies once and emails the copy with an edit link', async () => {
    const { deps, sent, store } = setup()
    const values = validValues('general', { title: 'My <talk>' })
    await createSubmission({ type: 'general', values }, deps)
    const token = lastToken(sent, 'token')

    const result = await verify({ token }, deps)
    expect(result).toMatchObject({ status: 'verified', type: 'general' })
    expect(store('general').summary()).toEqual([[1, '已驗證']])
    expect(sent).toHaveLength(2)
    expect(sent[1].subject).toContain('My <talk>')
    expect(sent[1].html).toContain('My &lt;talk&gt;')
    expect(sent[1].html).not.toContain('My <talk>')
    expect(sent[1].text).toContain(
      'https://sitcon.org/2027/cfp/submit/general?edit=',
    )

    // Opening the link again (or a mail scanner) sends nothing more.
    await verify({ token }, deps)
    expect(sent).toHaveLength(2)
  })

  it('rejects tampered and expired links', async () => {
    const { deps, sent } = setup()
    await createSubmission(
      { type: 'general', values: validValues('general') },
      deps,
    )
    const token = lastToken(sent, 'token')
    await rejects(verify({ token: `${token}x` }, deps), 400)
    await rejects(
      verify({ token }, { ...deps, now: open + 49 * 60 * 60 * 1000 }),
      410,
    )
  })

  it('still verifies after the deadline, for submissions sent before it', async () => {
    const { deps, sent } = setup(Date.parse('2027-01-15T23:00:00+08:00'))
    await createSubmission(
      { type: 'general', values: validValues('general') },
      deps,
    )
    const late = { ...deps, now: Date.parse('2027-01-16T01:00:00+08:00') }
    await expect(
      verify({ token: lastToken(sent, 'token') }, late),
    ).resolves.toMatchObject({ status: 'verified' })
  })
})

describe('editing', () => {
  it('loads the current version', async () => {
    const { deps, sent } = setup()
    const values = validValues('general', { title: 'First' })
    const auth = await submitAndVerify(deps, sent, values)
    const draft = await loadEdit(auth, deps)
    expect(draft.type).toBe('general')
    expect(draft.id).toMatch(/^G-/)
    expect(draft.values.title).toBe('First')
  })

  it('appends a verified version from the same address', async () => {
    const { deps, sent, store } = setup()
    const auth = await submitAndVerify(deps, sent)
    const result = await saveEdit(
      auth,
      {
        values: validValues('general', {
          title: 'Second',
          contactEmail: 'SPEAKER@example.com',
        }),
      },
      deps,
    )
    expect(result.status).toBe('updated')
    expect(store('general').summary()).toEqual([
      [1, '已取代'],
      [2, '已驗證'],
    ])
    expect(sent.at(-1)!.subject).toContain('Second')
    expect((await loadEdit(auth, deps)).values.title).toBe('Second')
  })

  it('verifies a new address before the version counts', async () => {
    const { deps, sent, store } = setup()
    const auth = await submitAndVerify(deps, sent)
    const values = validValues('general', {
      title: 'Moved',
      contactEmail: 'new@example.com',
    })
    expect(await saveEdit(auth, { values }, deps)).toEqual({
      status: 'pending',
      email: 'new@example.com',
    })
    expect(sent.at(-1)!.to).toBe('new@example.com')
    expect(store('general').summary()).toEqual([
      [1, '已驗證'],
      [2, '未驗證'],
    ])
    // Until then, the edit link still opens the verified version.
    expect((await loadEdit(auth, deps)).values.title).not.toBe('Moved')

    await verify({ token: lastToken(sent, 'token') }, deps)
    expect(store('general').summary()).toEqual([
      [1, '已取代'],
      [2, '已驗證'],
    ])
    expect(sent.at(-1)!.to).toBe('new@example.com')
  })

  it('keeps an older link from replacing a newer version', async () => {
    const { deps, sent, store } = setup()
    const auth = await submitAndVerify(deps, sent)
    await saveEdit(
      auth,
      { values: validValues('general', { contactEmail: 'b@example.com' }) },
      deps,
    )
    const stale = lastToken(sent, 'token')
    await saveEdit(auth, { values: validValues('general') }, deps)
    expect(store('general').summary()).toEqual([
      [1, '已取代'],
      [2, '未驗證'],
      [3, '已驗證'],
    ])
    const before = sent.length
    await verify({ token: stale }, deps)
    expect(store('general').summary()).toEqual([
      [1, '已取代'],
      [2, '已取代'],
      [3, '已驗證'],
    ])
    expect(sent).toHaveLength(before)
  })

  it('needs a passed Turnstile check to save an edit', async () => {
    const { deps, sent, store } = setup()
    const auth = await submitAndVerify(deps, sent)
    const values = validValues('general', { contactEmail: 'other@example.com' })
    const error = await rejects(
      saveEdit(auth, { values }, { ...deps, ...robot }),
      403,
    )
    expect(error.body.error).toBe('captcha')
    expect(store('general').rows).toHaveLength(1)
    // Loading the draft needs no check: it sends nothing.
    await expect(loadEdit(auth, { ...deps, ...robot })).resolves.toBeTruthy()
  })

  it('rejects bad tokens and closes at the deadline', async () => {
    const { deps, sent } = setup()
    const auth = await submitAndVerify(deps, sent)
    await rejects(loadEdit(null, deps), 401)
    await rejects(loadEdit(`${auth}x`, deps), 401)
    await rejects(loadEdit(auth, { ...deps, now: closed }), 403)
    await rejects(
      saveEdit(
        auth,
        { values: validValues('general') },
        { ...deps, now: closed },
      ),
      403,
    )
  })

  it('has nothing to open before the first verification', async () => {
    const { deps, sent, store } = setup()
    await createSubmission(
      { type: 'general', values: validValues('general') },
      deps,
    )
    const [{ id }] = await store('general').index()
    const auth = `Bearer ${await createEditToken(deps.secret, id)}`
    await rejects(loadEdit(auth, deps), 404)
    expect(sent).toHaveLength(1)
  })
})
