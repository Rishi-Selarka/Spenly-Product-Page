import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const StyledFooter = styled.footer`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 32px 0 24px;
  color: var(--muted);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const FooterInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

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
    gap: 12px;
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

const SocialLink = styled.a`
  color: var(--muted);
  text-decoration: none;
  font-size: 20px;
  opacity: 0.5;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }
`

const SocialIcons = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear()

  return (
    <StyledFooter>
      <FooterContent>
        <FooterInner>
          <span>© {currentYear} SPENLY. All rights reserved.</span>
          <LegalLinks>
            <LegalLink to="/privacy">
              Privacy Policy
            </LegalLink>
            <LegalLink to="/terms">
              Terms of Service
            </LegalLink>
            <SocialIcons>
              <SocialLink 
                href="https://github.com/Rishi-Selarka" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </SocialLink>
              <SocialLink 
                href="https://www.linkedin.com/in/rishi-selarka/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </SocialLink>
            </SocialIcons>
          </LegalLinks>
        </FooterInner>
      </FooterContent>
    </StyledFooter>
  )
}

export default Footer
