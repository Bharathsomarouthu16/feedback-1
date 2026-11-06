// Local development entry point. On Vercel, api/index.js is used instead.
import 'dotenv/config';

const { default: app } = await import('./app.js'); // import after dotenv so env vars are set
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
