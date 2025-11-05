import React from 'react'
import { motion } from 'framer-motion'
import './Features.css'

interface Feature {
  title: string
  description: string
}

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
    <section className="features" id="features">
      <div className="container">
        <div className="section-head">
          <h2>Why Spenly?</h2>
          <p>Transform your financial life with features designed for modern personal finance.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <motion.article
              key={index}
              className="card"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ 
                opacity: 1, 
                x: 0
              }}
              whileTap={{ scale: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.9,
                easing: [0.17, 0.55, 0.55, 1],
                delay: index * 0.1,
                scale: {
                  type: "spring",
                  stiffness: 1000
                }
              }}
            >
              <h3>{feature.title}</h3>
              <p className="card-description">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

