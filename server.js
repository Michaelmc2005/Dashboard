const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

dotenv.config();

const app = express();
const port = 3035;

// MongoDB connection details
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

run();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Retrieve classes from the MongoDB database
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


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
