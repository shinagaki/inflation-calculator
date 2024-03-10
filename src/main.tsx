import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'

polyfillCountryFlagEmojis()

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
