const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = 4305;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});



app.get('/api/classes', async (req, res) => {
  try {
    const userId = req.user.uid;
    const classes = await db.collection('users').doc(userId).collection('classes').get();
    const classesData = [];
    classes.forEach((doc) => {
      classesData.push(doc.data());
    });
    res.json({ classes: classesData });
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
    process.exit(0);
  });
}

// Listen for interrupt and terminate signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
