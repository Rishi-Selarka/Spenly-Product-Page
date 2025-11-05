import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import mockImage from '../assets/mock111.jpg'

const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000000;

  @media (max-width: 768px) {
    min-height: 90vh;
  }
`

const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
`

const HeroBgImage = styled.img`
  width: 95%;
  height: 95%;
  object-fit: contain;
  object-position: center center;
  filter: blur(0.5px) brightness(1);
  will-change: transform;
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const HeroBgOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(0px);
`

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const HeroContent = styled(motion.div)`
  max-width: 700px;
  text-align: center;
  margin: 0 auto;
`

const HeroTitle = styled(motion.h1)`
  font-family: 'Playfair Display', serif;
  font-size: clamp(48px, 7vw, 96px);
  line-height: 1.1;
  margin: 0 0 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
  text-shadow: 0 0 40px rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`

const HeroSub = styled(motion.p)`
  margin: 0 0 40px;
  color: var(--muted);
  font-size: clamp(18px, 2.2vw, 24px);
  line-height: 1.7;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Poppins', sans-serif;
  font-weight: 300;
  letter-spacing: 0.01em;

  @media (max-width: 768px) {
    margin-bottom: 32px;
    font-size: 16px;
  }
`

const HeroCta = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
`

const AppStoreBtn = styled.a`
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.95;

  &:hover {
    transform: scale(1.05);
    opacity: 1;
  }

  &:active {
    transform: scale(0.98);
  }
`

const AppStoreBadge = styled.img`
  width: 246px;
  height: 82px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));

  @media (max-width: 768px) {
    width: 200px;
    height: 67px;
  }
`

const Hero: React.FC = () => {
  return (
    <HeroSection id="get-started">
      <HeroBg>
        <HeroBgImage src={mockImage} alt="" />
        <HeroBgOverlay />
      </HeroBg>
      <HeroInner>
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            SPENLY
          </HeroTitle>
          <HeroSub
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            AI powered Money Manager & Budget Tracker<br />with personalised finance
          </HeroSub>
          <HeroCta
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AppStoreBtn
              href="https://apps.apple.com/in/app/spenly/id6747989825?itscg=30200&itsct=apps_box_badge&mttnsubad=6747989825"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AppStoreBadge
                src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1751328000"
                alt="Download on the App Store"
              />
            </AppStoreBtn>
          </HeroCta>
        </HeroContent>
      </HeroInner>
    </HeroSection>
  )
}

export default Hero
