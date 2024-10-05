import { NextResponse } from 'next/server';
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { queryDoc } from '../utils/query';

const client = new PineconeClient({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { indexName, question } = await request.json();

    const answer = await queryDoc(client, indexName, question);

    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
