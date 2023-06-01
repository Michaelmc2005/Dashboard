const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

dotenv.config();

const app = express();
const port = 4105;

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

run();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Retrieve classes from the database
app.get('/api/classes', async (req, res) => {
  try {
    const db = client.db('Socratique');
    const collection = db.collection('Classes');
    const classes = await collection.find().toArray();
    res.json({ classes });
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes from the server.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/openai-key', (req, res) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  if (!openAIKey) {
    res.status(500).json({ error: 'OpenAI API key not found.' });
    return;
  }
  res.json({ apiKey: openAIKey });
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Clean up function to close server and MongoDB client
function cleanup() {
  console.log('Closing server...');
  server.close(() => {
    console.log('Server closed');

    console.log('Closing MongoDB client...');
    client.close(false, () => {
      console.log('MongoDB client closed');
      process.exit(0);
    });
  });
}

// Listen for interrupt and terminate signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
