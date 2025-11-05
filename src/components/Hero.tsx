import React from 'react'
import { motion } from 'framer-motion'
import mockImage from '../assets/mock111.jpg'
import './Hero.css'

const Hero: React.FC = () => {
  return (
    <section className="hero" id="get-started">
      <div className="hero-bg">
        <img src={mockImage} alt="" className="hero-bg-image" />
        <div className="hero-bg-overlay"></div>
      </div>
      <div className="container hero-inner">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            SPENLY
          </motion.h1>
          <motion.p 
            className="hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Fast, intuitive expense tracker built for modern personal finance. Track spending, stay on budget, and see exactly where your money goes.
          </motion.p>
          <motion.div 
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <a 
              href="https://apps.apple.com/in/app/spenly/id6747989825?itscg=30200&itsct=apps_box_badge&mttnsubad=6747989825" 
              target="_blank" 
              rel="noopener noreferrer"
              className="app-store-btn"
              style={{ display: 'inline-block' }}
            >
              <img 
                src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1751328000" 
                alt="Download on the App Store" 
                className="app-store-badge"
              />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero

