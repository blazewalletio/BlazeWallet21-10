const fs = require('fs');

// Read SQL file
const sql = fs.readFileSync('./supabase-schema.sql', 'utf8');

const SUPABASE_URL = 'https://ldehmephukevxumwdbwt.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZWhtZXBodWtldnh1bXdkYnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIwMDg2MSwiZXhwIjoyMDc2Nzc2ODYxfQ.nhpYh_LREwR-qO12LCzfO9K3zHz_49aO_fle4j_gw7c';

async function executeSQLDirect() {
  try {
    // Split SQL into CREATE TABLE statements
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      // Extract table name for logging
      const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
      const tableName = tableMatch ? tableMatch[1] : `statement ${i + 1}`;
      
      console.log(`⏳ Creating: ${tableName}...`);
      
      // For Supabase, we need to use the pg_query extension or REST API
      // The simplest way is actually to use the Supabase client library
      // But since we can't execute DDL via REST API easily, let's output instructions
    }
    
    console.log('\n⚠️  Unfortunately, the Supabase REST API does not support DDL (CREATE TABLE) statements.');
    console.log('📋 Please execute the schema manually:\n');
    console.log('1. Open: https://supabase.com/dashboard/project/ldehmephukevxumwdbwt/sql/new');
    console.log('2. Copy the content from: supabase-schema.sql');
    console.log('3. Paste it into the SQL Editor');
    console.log('4. Click "RUN" (or press Cmd/Ctrl + Enter)\n');
    console.log('✅ This will create all tables in ~1 second!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

executeSQLDirect();

