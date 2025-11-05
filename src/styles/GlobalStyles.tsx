import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg: #000000;
    --panel: #000000;
    --muted: #a3a7b3;
    --text: #f4f6fb;
    --brand: #6aa6ff;
    --brand-2: #7cf5ff;
    --border: #1a1a1a;
    --shadow: 0 10px 30px rgba(0,0,0,.25);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  html, body {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
    color: var(--text);
    background: var(--bg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-head {
    text-align: center;
    margin: 56px 0 32px;
  }

  .section-head h2 {
    margin: 0 0 12px;
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .section-head p {
    margin: 0;
    color: var(--muted);
    font-size: 18px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }
`

