import { useEffect, useMemo, useRef } from 'react'
import { createProvided, useProvided } from './dependency-injection'

export type EffectResult =
  | void
  | undefined
  | (() => EffectResult)
  | Promise<void | undefined | (() => EffectResult)>

// used to capture exceptions in a controlled way during testing
export const dismissErrorResource = createProvided(
  'dismiss-error-without-handling',
  (_, c: () => (err: Error) => void) => c,
  function createRethrowAsync() {
    const syncStackError = new Error(
      `Encountered unexpected rejection in async side effect`,
    )
    return (error: Error) => {
      Promise.reject(error)
      Promise.reject(syncStackError)
    }
  },
)

const emptyDepsArray: never[] = []

async function handleEffectResult(effectResult: EffectResult): Promise<void> {
  if (effectResult instanceof Promise) {
    return handleEffectResult(await effectResult)
  } else if (typeof effectResult === 'function') {
    return handleEffectResult(effectResult())
  }
  return undefined
}

export function useAsyncEffect(effect: () => EffectResult, deps: unknown[]) {
  const createRethrowAsync = useProvided(dismissErrorResource)
  const rethrowAsync = useMemo(createRethrowAsync, emptyDepsArray)
  const { current: asyncEffectState } = useRef({
    mostRecentEffect: effect,
    asyncQueue: Promise.resolve(undefined as EffectResult),
    done: false,
  })

  asyncEffectState.mostRecentEffect = effect

  useEffect(() => {
    const newLink = handleEffectResult(asyncEffectState.asyncQueue)
      .catch(rethrowAsync)
      .then(() => {
        // we've reached the end of the queue, so it's time to trigger work
        if (!asyncEffectState.done && asyncEffectState.asyncQueue === newLink) {
          return asyncEffectState.mostRecentEffect()
        } else {
          return undefined
        }
      })
      .catch(rethrowAsync)
    asyncEffectState.asyncQueue = newLink
  }, [asyncEffectState, rethrowAsync, ...deps])

  useEffect(
    () => () => {
      asyncEffectState.done = true
      handleEffectResult(asyncEffectState.asyncQueue).catch(rethrowAsync)
    },
    [asyncEffectState, rethrowAsync],
  )
}
