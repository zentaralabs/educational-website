import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i), l.slice(i+1)];}));
const sql = fs.readFileSync(process.argv[2], 'utf8');
const client = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  console.log('OK: migration applied');
} catch (e) {
  console.error('ERR', e.message);
  process.exit(1);
} finally {
  await client.end();
}
