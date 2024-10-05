import { NextResponse } from 'next/server';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';

const client = new PineconeClient({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
});

export async function GET(request: Request) {
  try {
    const indexes = await client.listIndexes();
    return NextResponse.json({ indexes });
  } catch (error: any) {
    console.error('Error fetching indexes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
