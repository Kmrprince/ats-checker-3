import { Buffer } from 'buffer';

// Polyfill for Buffer in the Next.js context
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

import '../styles/globals.css'; // Import global styles

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}