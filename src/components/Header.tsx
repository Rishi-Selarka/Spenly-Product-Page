import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  backdrop-filter: saturate(180%) blur(20px);
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
  transition: all 0.3s ease;
`

const HeaderInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const Brand = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`

const LogoText = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`

const Header: React.FC = () => {
  return (
    <StyledHeader>
      <HeaderInner>
        <Brand
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LogoText>SPENLY</LogoText>
        </Brand>
      </HeaderInner>
    </StyledHeader>
  )
}

export default Header
