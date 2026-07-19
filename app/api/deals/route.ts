import { NextResponse } from 'next/server';
import deals from '../../../data/deals.json';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(deals); }
