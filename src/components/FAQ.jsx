import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './FAQ.css'

const faqs = [
  {
    id: 'premium',
    question: 'What is Spenly Premium?',
    answer: 'Spenly Premium is a one-time purchase (no subscriptions!) that includes Spenly AI for smart insights and chat assistance, transaction templates for instant creation, premium themes & custom fonts for a personalized look, ad-free experience, and unlocked PDF/CSV export. Lifetime access with all future updates included.'
  },
  {
    id: 'privacy',
    question: 'How does Spenly protect my financial data?',
    answer: 'Your data stays yours. Spenly uses local Core Data storage on your device with optional iCloud sync encrypted by Apple. We use Sign in with Apple for secure authentication and we never sell your personal data. Privacy and security are built into our design.'
  },
  {
    id: 'currency',
    question: 'Does Spenly support multiple currencies?',
    answer: 'Yes! Spenly supports 150+ currencies with live exchange rates, making it perfect for travelers, expats, and anyone managing finances across different countries. All conversions happen in real-time.'
  },
  {
    id: 'sync',
    question: 'Can I sync Spenly across my Apple devices?',
    answer: 'Absolutely. Spenly uses iCloud sync to keep your data up to date across all your Apple devices (iPhone, iPad, Mac). Your expenses, budgets, and receipts are always accessible wherever you are.'
  },
  {
    id: 'perfect',
    question: 'Who is Spenly perfect for?',
    answer: 'Spenly is perfect for personal expense management and budgeting, students and professionals tracking daily spending, multi-currency travelers and expats, and anyone who wants clarity and control over their money.'
  },
  {
    id: 'export',
    question: 'Can I export my financial data?',
    answer: 'Yes! Spenly allows you to generate professional PDF or CSV reports anytime. Export is available in the free version, and Premium users get enhanced export options with additional formatting and customization.'
  }
]

const FAQ = () => {
  const [selectedTab, setSelectedTab] = useState(faqs[0])

  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-head">
          <h2>Frequently asked</h2>
        </div>
        <div className="faq-container">
          <nav className="faq-nav">
            <ul className="faq-tabs-container">
              {faqs.map((faq) => (
                <motion.li
                  key={faq.id}
                  initial={false}
                  animate={{
                    backgroundColor: faq === selectedTab ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  }}
                  className="faq-tab"
                  onClick={() => setSelectedTab(faq)}
                >
                  {faq.question}
                  {faq === selectedTab ? (
                    <motion.div
                      className="faq-underline"
                      layoutId="underline"
                      id="underline"
                    />
                  ) : null}
                </motion.li>
              ))}
            </ul>
          </nav>
          <main className="faq-content-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab ? selectedTab.id : "empty"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="faq-answer"
              >
                {selectedTab ? selectedTab.answer : ""}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </section>
  )
}

export default FAQ

