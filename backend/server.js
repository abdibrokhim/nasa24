const fs = require('fs');
const csv = require('csv-parser');
const { OpenAI } = require('openai');
const { PineconeClient } = require('@pinecone-database/pinecone');

const openai = new OpenAI({apiKey: "", allowedNodeEnvironmentFlags: true});

const client = new PineconeClient({
    apiKey: "",
});

(async () => {
  await pinecone.init({
    apiKey: "",
  });

  const indexName = 'nasa-data-index';

  // Check if the index exists
  const existingIndexes = await pinecone.listIndexes();

  if (!existingIndexes.includes(indexName)) {
    // Create the index if it doesn't exist
    await pinecone.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536, // For text-embedding-ada-002
        metric: 'cosine', // 'cosine', 'euclidean', or 'dotproduct'
      },
    });
    console.log(`Index "${indexName}" created.`);
  } else {
    console.log(`Index "${indexName}" already exists.`);
  }

  // Wait for the index to be ready
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const index = pinecone.Index(indexName);

  // Read and process the CSV data
  let data = [];

  fs.createReadStream('grid.csv')
    .pipe(csv())
    .on('data', (row) => {
      data.push({
        id: row.id || generateUniqueId(), // Ensure each item has a unique ID
        text: row.description, // Adjust field names based on your CSV
        metadata: {
          title: row.title,
          date: row.date,
          // Add other metadata fields as needed
        },
      });
    })
    .on('end', async () => {
      console.log('CSV file successfully processed.');
      await processEmbeddings(data, index);
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
    });
})();

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
    });
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.response?.data || error.message);
    return null;
  }
}

async function processEmbeddings(data, index) {
  let pineconeData = [];

  for (let i = 0; i < data.length; i++) {
    const { id, text, metadata } = data[i];

    // Generate embedding for the text
    const embedding = await getEmbedding(text);

    if (!embedding) {
      console.error(`Failed to generate embedding for ID ${id}`);
      continue; // Skip this record and proceed
    }

    pineconeData.push({
      id: id.toString(),
      values: embedding,
      metadata: metadata,
    });

    // Upsert data in batches of 100
    if (pineconeData.length === 100 || i === data.length - 1) {
      try {
        await index.upsert({
          upsertRequest: {
            vectors: pineconeData,
          },
        });
        console.log(`Upserted batch ending with item ${i + 1}`);
        pineconeData = []; // Reset batch
      } catch (error) {
        console.error('Error upserting to Pinecone:', error);
      }
    }
  }

  console.log('All data upserted to Pinecone.');
}