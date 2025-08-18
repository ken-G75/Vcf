-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  numero_complet TEXT NOT NULL UNIQUE,
  code_pays TEXT NOT NULL,
  numero TEXT NOT NULL,
  email TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  sujet TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_timestamp ON contacts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_numero_complet ON contacts(numero_complet);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (contacts)
CREATE POLICY "Allow public read access to recent contacts" ON contacts
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Create policies for admin access (messages)
CREATE POLICY "Allow public insert to messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Note: Admin policies will be handled by service role key in the application
