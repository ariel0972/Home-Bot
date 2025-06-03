const express = require('express');
const cors = require('cors');
const { SessionsClient } = require('@google-cloud/dialogflow');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dialogflow = new SessionsClient({
  keyFilename: './dialogflow-key.json'
});
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

app.post('/message', async (req, res) => {
  const message = req.body.message;
  const sessionId = req.body.sessionId;

  const sessionPath = dialogflow.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'pt-BR',
      },
    },
  };

  try {
    const responses = await dialogflow.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).send('Erro ao acessar Dialogflow');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
