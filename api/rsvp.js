import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, guests, attendance, message } = req.body || {};

  if (!name || !email || !phone || !guests || !attendance) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Map the form's radio values to the DB's simple enum
  const attending = attendance === 'joyfully-accept' ? 'accepted' : 'declined';

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO rsvps (full_name, email, contact_number, number_of_guests, attending, message)
      VALUES (${name}, ${email}, ${phone}, ${Number(guests)}, ${attending}, ${message || ''})
    `;
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('RSVP insert failed:', err);
    return res.status(500).json({ error: 'Something went wrong saving your RSVP.' });
  }
}
