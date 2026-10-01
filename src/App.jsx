import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Home from './views/Home'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Home />
      <Footer />
    </div>
  )
}
