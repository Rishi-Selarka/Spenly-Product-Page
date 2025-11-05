import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const StyledFooter = styled.footer`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 32px 0;
  color: var(--muted);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
`

const FooterInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`

const LegalLinks = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
  }
`

const LegalLink = styled(Link)`
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 640px) {
    font-size: 13px;
  }
`

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear()

  return (
    <StyledFooter>
      <FooterInner>
        <span>© {currentYear} SPENLY. All rights reserved.</span>
        <LegalLinks>
          <LegalLink to="/privacy">
            Privacy Policy
          </LegalLink>
          <LegalLink to="/terms">
            Terms of Service
          </LegalLink>
        </LegalLinks>
      </FooterInner>
    </StyledFooter>
  )
}

export default Footer
