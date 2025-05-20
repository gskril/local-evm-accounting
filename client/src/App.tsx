import { Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { Home } from './screens/Home'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts" element={<></>} />
        <Route path="/chains" element={<></>} />
        <Route path="/tokens" element={<></>} />
      </Routes>
    </Layout>
  )
}

export default App
