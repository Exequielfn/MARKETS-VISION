# Google Cloud Setup for Markets Vision

To enable the Text-to-Speech service, follow these steps:

### 1. Enable Text-to-Speech API
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select or create a project.
3.  Go to **APIs & Services > Library**.
4.  Search for **"Text-to-Speech API"** and click **Enable**.

### 2. Configure API Key
1.  Go to **APIs & Services > Credentials**.
2.  Click **Create Credentials > API Key**.
3.  Copy the generated API Key.
4.  (Optional but recommended) Click **Restrict Key** to only allow the "Cloud Text-to-Speech API".

### 3. Update the Project
The API key provided (`AIzaSyDW71ZnfRG_5kfpX_ghpiDq8fowvYuylW8`) has been integrated into `src/lib/voice.ts`. 

> [!WARNING]
> Exposing API keys in the frontend is not secure for production. For a real-world app, you should:
> 1. Use a backend proxy to keep the key hidden.
> 2. Use OAuth2/Service Account authentication if possible.
