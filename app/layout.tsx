import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MaternaAI | Your Personalized Maternity Assistant',
  description: 'Providing tailored support for every stage of your pregnancy journey.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
