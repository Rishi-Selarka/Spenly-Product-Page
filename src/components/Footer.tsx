import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {currentYear} SPENLY. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer

