import React from 'react'
import { render } from 'react-dom'

import App from './components/App'

// Atomic react root
;(function bootstrap(anchorElement: HTMLElement | null): void {
  if (anchorElement) {
    render(<App />, anchorElement)
  } else {
    console.error('No anchor element provided')
  }
})(document.getElementById('anchor'))
