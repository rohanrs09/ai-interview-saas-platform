const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set in environment variables');
  process.exit(1);
}

try {
  console.log('Pushing database schema...');
  const result = execSync(`npx drizzle-kit@0.20.6 push:pg --url="${DATABASE_URL}" --schema=./lib/schema.ts`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Error pushing database schema:', error.message);
  process.exit(1);
}
