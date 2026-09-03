import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import './theme.css';
const mono=Geist_Mono({variable:'--font-geist-mono',subsets:['latin']});
export const metadata:Metadata={title:'DA League Exchange — Find Your Next Dynasty Franchise',description:'The trusted marketplace for dynasty football league openings, commissioners, and managers.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body className={mono.variable}>{children}</body></html>}
