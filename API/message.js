import { SessionsClient } from '@google-cloud/dialogflow';
import { readFileSync } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido');
  }

  const { message, sessionId } = req.body;

  if (!message){
    return res.status(400)({  error: 'Mensagem nõa enviada' })
  }

  const keyPath = path.join(process.cwd(), 'dialogflow-key.json');
  const credentials =  JSON.parse(readFileSync(keyPath, 'utf8'));

  const projectId = credentials.project_id

  const client = new SessionsClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });

  const session = sessionID || uuid()
  const sessionPath = client.projectAgentSessionPath(
    process.env.DIALOGFLOW_PROJECT_ID,
    sessionId
  );

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
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
    });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).send('Erro no Dialogflow');
  }
}
