import React from 'react'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {currentYear} SPENLY. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer

