import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import mockImage from '../assets/mock111.jpg'

const PreviewSection = styled.section`
  padding: 80px 0;
  position: relative;
`

const PreviewFrame = styled(motion.div)`
  display: flex;
  justify-content: center;
  position: relative;
`

const PreviewImage = styled.img`
  width: 100%;
  max-width: 580px;
  border-radius: 16px;
  display: block;
`

const Preview: React.FC = () => {
  return (
    <PreviewSection id="preview">
      <div className="container">
        <div className="section-head">
          <h2>Live preview</h2>
          <p>Interact with your mock directly in the page, or open in a new tab.</p>
        </div>
        <PreviewFrame
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <PreviewImage
            src={mockImage}
            alt="Budget app mockup showing two smartphones displaying home and budget screens"
          />
        </PreviewFrame>
      </div>
    </PreviewSection>
  )
}

export default Preview
