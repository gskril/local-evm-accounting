import { useLocalStorage } from 'usehooks-ts'

export function useCurrency() {
  const [currency, setCurrency] = useLocalStorage<string | undefined>(
    'currency',
    undefined
  )

  return {
    currency,
    setCurrency,
  }
}
