import React from 'react'
import styled from 'styled-components'

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

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear()

  return (
    <StyledFooter>
      <FooterInner>
        <span>© {currentYear} SPENLY. All rights reserved.</span>
      </FooterInner>
    </StyledFooter>
  )
}

export default Footer
