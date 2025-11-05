import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'

interface Feature {
  title: string
  description: string
}

const FeaturesSection = styled.section`
  padding: 120px 0 80px;
  position: relative;
  z-index: 1;
  background: #000000;

  @media (max-width: 768px) {
    padding: 80px 0 60px;
  }
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

const Card = styled(motion.article)`
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 32px;
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 30px rgba(37, 99, 235, 0.6), 0 0 60px rgba(37, 99, 235, 0.3);
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 2px;
  }

  h3 {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
    position: relative;
    z-index: 1;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 15px;
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      title: 'Real-time Tracking',
      description: 'Add expenses/income in a tap with smart categories. Track spending in seconds and see exactly where your money goes.'
    },
    {
      title: 'Smart Budgeting',
      description: 'Set budgets and monitor progress with helpful alerts. Stay on budget effortlessly with automated tracking.'
    },
    {
      title: 'Analytics & Insights',
      description: 'Clean analytics reveal patterns, top categories, and monthly insights. Know your trends at a glance.'
    },
    {
      title: 'Multi-Currency',
      description: '150+ currencies with live exchange rates. Perfect for travelers and expats managing finances globally.'
    },
    {
      title: 'iCloud Sync',
      description: 'Always in sync across devices. Your data stays up to date wherever you access Spenly.'
    },
    {
      title: 'Receipt Organization',
      description: 'Attach receipt photos to any transaction. Keep your receipts organized and accessible.'
    },
    {
      title: 'Export Reports',
      description: 'Generate professional PDF or CSV reports anytime. Export your financial data for analysis or records.'
    },
    {
      title: 'Privacy First',
      description: 'Local Core Data storage with optional iCloud sync. Your data stays yours, encrypted by Apple.'
    },
    {
      title: 'AI-Powered Insights',
      description: 'Get smart financial insights and chat assistance with Spenly AI. Ask questions about your spending, receive personalized recommendations, and get intelligent analysis of your financial patterns.'
    }
  ]

  return (
    <FeaturesSection id="features">
      <div className="container">
        <div className="section-head">
          <h2>Why Spenly?</h2>
          <p>Transform your financial life with features designed for modern personal finance.</p>
        </div>
        <FeatureGrid>
          {features.map((feature, index) => (
            <Card key={index}>
              <h3>{feature.title}</h3>
              <p className="card-description">{feature.description}</p>
            </Card>
          ))}
        </FeatureGrid>
      </div>
    </FeaturesSection>
  )
}

export default Features
