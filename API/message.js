import { SessionsClient } from '@google-cloud/dialogflow';
import { v4 as uuid } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem não enviada' });
  }

  const client = new SessionsClient({
    credentials: {
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
      private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
  });

  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const session = sessionId || uuid();

  const sessionPath = client.projectAgentSessionPath(projectId, session);

  const requestDialog = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'pt-BR',
      },
    },
  };

  try {
    const responses = await client.detectIntent(requestDialog);
    const result = responses[0].queryResult;

    res.status(200).json({
      reply: result.fulfillmentText,
      intent: result.intent?.displayName || null,
      confidence: result.intentDetectionConfidence || 0,
    });
  } catch (error) {
    console.error('ERROR Dialogflow:', error);
    res.status(500).json({ error: 'Erro no Dialogflow' });
  }
}