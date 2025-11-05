import React from 'react'
import { motion } from 'framer-motion'
import mockImage from '../assets/mock111.jpg'
import './Preview.css'

const Preview: React.FC = () => {
  return (
    <section className="preview" id="preview">
      <div className="container">
        <div className="section-head">
          <h2>Live preview</h2>
          <p>Interact with your mock directly in the page, or open in a new tab.</p>
        </div>
        <motion.div 
          className="preview-frame"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src={mockImage} 
            alt="Budget app mockup showing two smartphones displaying home and budget screens" 
            className="mock-image preview-image"
          />
        </motion.div>
      </div>
    </section>
  )
}

export default Preview

