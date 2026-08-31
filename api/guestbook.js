import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'POST') {
    const { name, message } = req.body || {};

    if (!name || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await sql`
        INSERT INTO guestbook (guest_name, wish)
        VALUES (${name}, ${message})
      `;
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Guestbook insert failed:', err);
      return res.status(500).json({ error: 'Something went wrong saving your wish.' });
    }
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT guest_name AS name, wish AS message, created_at
        FROM guestbook
        ORDER BY created_at DESC
        LIMIT 30
      `;
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Guestbook fetch failed:', err);
      return res.status(500).json({ error: 'Could not load guestbook.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
