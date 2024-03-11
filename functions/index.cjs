const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require('axios');
require("dotenv").config();
admin.initializeApp();

exports.saveMedia = functions.https.onRequest(async (req, res) => {

  for (const event of req.body.events) {
    if (event.type === 'message') {
      const messageType = event.message.type;
      const messageId = event.message.id;

      if (messageType === 'image' || messageType === 'video') {
        const contentUrl = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

        const response = await axios.get(contentUrl, {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}` },
        });

        const ref = admin.storage().bucket().file(`${messageId}`);
        await ref.save(Buffer.from(response.data, 'binary'), {
          metadata: {
            contentType: response.headers['content-type'],
          },
        });
      }
    }
  }
  
  res.status(200).send();
});