import { useAccounts } from './hooks/useHono'

function App() {
  const res = useAccounts()
  console.log(res)

  return <div>Hello World</div>
}

export default App
