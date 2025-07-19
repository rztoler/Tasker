// Supabase configuration for PostgreSQL database
// This replaces the MongoDB connection for Vercel deployment

const { Pool } = require('pg');

// Supabase connection configuration
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database connection wrapper
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to Supabase PostgreSQL');
    client.release();
    return pool;
  } catch (error) {
    console.error('Supabase connection error:', error);
    process.exit(1);
  }
};

// Query helper function
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Database initialization - creates tables if they don't exist
const initializeDatabase = async () => {
  try {
    // Create tables for the application
    await query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(100) NOT NULL,
        contact_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        color VARCHAR(7) NOT NULL,
        time_zone VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        description TEXT,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration DECIMAL(4,2) NOT NULL CHECK (duration >= 0.25 AND duration <= 24),
        priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 5),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'archived')),
        scheduled_start TIMESTAMP WITH TIME ZONE,
        scheduled_end TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        is_locked BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
        type VARCHAR(20) DEFAULT 'meeting' CHECK (type IN ('meeting', 'personal', 'break', 'travel', 'appointment', 'deadline')),
        location VARCHAR(200),
        is_recurring BOOLEAN DEFAULT false,
        recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
        recurrence_end TIMESTAMP WITH TIME ZONE,
        is_all_day BOOLEAN DEFAULT false,
        color VARCHAR(7),
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        google_event_id VARCHAR(255),
        outlook_event_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_events_date_range ON events(start_date_time, end_date_time);`);
    
    // Create updated_at trigger function
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    const tables = ['clients', 'projects', 'tasks', 'events'];
    for (const table of tables) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  connectDB,
  initializeDatabase
};