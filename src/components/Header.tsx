import React from 'react'
import { motion } from 'framer-motion'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <motion.div 
          className="brand"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-text">SPENLY</div>
        </motion.div>
      </div>
    </header>
  )
}

export default Header

