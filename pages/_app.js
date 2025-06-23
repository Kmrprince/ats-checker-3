import { Buffer } from 'buffer';
import '../styles/globals.css';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}