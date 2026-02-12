import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import FuturePrivacyPolicy from './pages/FuturePrivacyPolicy'
import FutureTermsOfService from './pages/FutureTermsOfService'
import TechnicalDocumentation from './pages/TechnicalDocumentation'
import ProductBrief from './pages/ProductBrief'
import ScrollToTop from './components/ScrollToTop'

function App(): JSX.Element {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/futureprivacypolicy" element={<FuturePrivacyPolicy />} />
        <Route path="/futuretermsofservice" element={<FutureTermsOfService />} />
        <Route path="/technicaldocumentation" element={<TechnicalDocumentation />} />
        <Route path="/productbrief" element={<ProductBrief />} />
      </Routes>
    </Router>
  )
}

export default App

