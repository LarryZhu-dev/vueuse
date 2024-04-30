import type { MaybeRefOrGetter } from '@vueuse/shared'
import { toValue } from '@vueuse/shared'
import { useSupported } from '../useSupported'
import type { ConfigurableNavigator } from '../_configurable'
import { defaultNavigator } from '../_configurable'

export interface UseShareOptions {
  title?: string
  files?: File[]
  text?: string
  url?: string
}

interface NavigatorWithShare {
  share?: (data: UseShareOptions) => Promise<void>
  canShare?: (data: UseShareOptions) => boolean
}

/**
 * 响应式 Web Share API.
 * 浏览器提供了可以分享文本或文件内容的功能。
 *
 * @see https://vueuse.org/useShare
 * @param shareOptions
 * @param options
 */
export function useShare(shareOptions: MaybeRefOrGetter<UseShareOptions> = {}, options: ConfigurableNavigator = {}) {
  const { navigator = defaultNavigator } = options

  const _navigator = navigator as NavigatorWithShare
  const isSupported = useSupported(() => _navigator && 'canShare' in _navigator)

  const share = async (overrideOptions: MaybeRefOrGetter<UseShareOptions> = {}) => {
    if (isSupported.value) {
      const data = {
        ...toValue(shareOptions),
        ...toValue(overrideOptions),
      }
      let granted = true

      if (data.files && _navigator.canShare)
        granted = _navigator.canShare({ files: data.files })

      if (granted)
        return _navigator.share!(data)
    }
  }

  return {
    isSupported,
    share,
  }
}

export type UseShareReturn = ReturnType<typeof useShare>
