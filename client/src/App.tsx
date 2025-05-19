import { AccountCard } from './components/AccountCard'
import { ChainCard } from './components/ChainCard'

function App() {
  return (
    <div className="flex min-h-svh w-full flex-col gap-4 bg-neutral-50 p-4">
      <div className="grid w-full grid-cols-2 gap-4">
        <ChainCard />
        <AccountCard />
      </div>
    </div>
  )
}

export default App
