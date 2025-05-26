import { useCurrency } from '@/hooks/useCurrency'
import { useFiat } from '@/hooks/useHono'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export function CurrencySelector() {
  const currencies = useFiat()
  const { currency, setCurrency } = useCurrency()

  return (
    <Select
      defaultValue={currency}
      onValueChange={(value) => setCurrency(value)}
    >
      <SelectTrigger>
        <span className="text-muted-foreground">Currency:</span>
        <SelectValue defaultValue="usd" />
      </SelectTrigger>
      <SelectContent side="top">
        {currencies.data?.array.map((currency) => (
          <SelectItem key={currency.label} value={currency.label}>
            {currency.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
