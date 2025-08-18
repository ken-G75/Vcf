-- Insert some sample data for testing
INSERT INTO contacts (nom, numero_complet, code_pays, numero) VALUES
  ('Jean Dupont (RXP)', '+509 1234 5678', '+509', '1234 5678'),
  ('Marie Claire (RXP)', '+1 555 0123', '+1', '555 0123'),
  ('Pierre Martin (RXP)', '+33 6 12 34 56 78', '+33', '6 12 34 56 78')
ON CONFLICT (numero_complet) DO NOTHING;

INSERT INTO messages (nom, email, telephone, sujet, message) VALUES
  ('Test User', 'test@example.com', '+509 1234 5678', 'Test Message', 'Ceci est un message de test pour vérifier le système.'),
  ('Demo Contact', 'demo@example.com', NULL, 'Support', 'Question concernant le fonctionnement de la plateforme.')
ON CONFLICT DO NOTHING;
