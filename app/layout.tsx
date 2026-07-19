import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: '四腳機票雷達', description: '人工輸入票價，找出四腳 / 兩組來回接近同價的機票異常。' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="zh-Hant-TW"><body>{children}</body></html>; }
