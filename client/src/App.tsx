import { Route, Routes } from 'react-router-dom'

import { AccountCard } from './components/AccountCard'
import { BalanceCard } from './components/BalanceCard'
import { ChainCard } from './components/ChainCard'
import { Layout } from './components/Layout'
import { TokenCard } from './components/TokenCard'
import { Home } from './screens/Home'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<BalanceCard />} />
        <Route path="/chains" element={<ChainCard />} />
        <Route path="/accounts" element={<AccountCard />} />
        <Route path="/tokens" element={<TokenCard />} />
      </Routes>
    </Layout>
  )
}

export default App
