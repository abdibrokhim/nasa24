import { NextResponse } from 'next/server';
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { queryDoc } from '../utils/query';

const client = new PineconeClient({
  apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
});

export async function POST(request: Request) {
  console.log('POST /api/queryIndex');
  try {
    const { indexName, question } = await request.json();
    console.log('indexName:', indexName);
    console.log('question:', question);

    const answer = await queryDoc(client, indexName, question);

    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
