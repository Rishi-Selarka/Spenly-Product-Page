import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

function App(): JSX.Element {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}

export default App

