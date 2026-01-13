import { FormEvent, useState } from 'react';
import './App.css';

// n8n webhook endpoint for collecting user requests.
const WEBHOOK_URL =
  'https://current-coat-hybrid-welding.trycloudflare.com/webhook-test/b18de4c2-6425-44ab-bb3d-ae3e809b4184';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [solution, setSolution] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const canSubmit =
    subject.trim().length > 0 && description.trim().length > 0 && !isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const payload = {
      subject: subject.trim(),
      description: description.trim()
    };

    setStatus('loading');
    setMessage('Envoi en cours...');
    setSolution(null);

    try {
      // Send the payload to the n8n webhook for processing.
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      let resolvedSolution = '';

      if (contentType.includes('application/json')) {
        const data = (await response.json()) as unknown;

        if (typeof data === 'string') {
          resolvedSolution = data;
        } else if (Array.isArray(data) && data.length > 0) {
          const first = data[0] as Record<string, unknown>;
          const candidate = first?.output;
          resolvedSolution = typeof candidate === 'string' ? candidate : '';
        } else if (data && typeof data === 'object') {
          const record = data as Record<string, unknown>;
          const candidate = record.output;
          resolvedSolution = typeof candidate === 'string' ? candidate : '';
        }
      } else {
        resolvedSolution = await response.text();
      }

      if (!resolvedSolution.trim()) {
        resolvedSolution = 'Réponse reçue, mais sans output.';
      }

      setStatus('success');
      setMessage('Réponse reçue.');
      setSolution(resolvedSolution);
      setSubject('');
      setDescription('');
    } catch (error) {
      setStatus('error');
      setMessage(
        "Impossible d'envoyer la demande. Vérifie ta connexion et réessaie."
      );
    }
  };

  return (
    <div className="app">
      <main className="card">
        <header className="header">
          <h1>Aide-moi</h1>
          <p className="subtitle">
            Explique ton problème et reçois une aide personnalisée
          </p>
        </header>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="subject">Sujet du problème</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Ex. Bug sur la page de paiement"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="description">Décris ton problème</label>
            <textarea
              id="description"
              name="description"
              placeholder="Donne le maximum de contexte, étapes déjà tentées, etc."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              required
            />
          </div>

          <button className="primary" type="submit" disabled={!canSubmit}>
            {isLoading && <span className="spinner" aria-hidden="true" />}
            {isLoading ? 'Envoi en cours...' : "Demander de l'aide"}
          </button>

          {status !== 'idle' && (
            <p
              className={`status-message ${status}`}
              role={status === 'error' ? 'alert' : 'status'}
            >
              {message}
            </p>
          )}

          {solution && (
            <div className="field solution">
              <label htmlFor="solution">
                Voici la solution à votre problème
              </label>
              <textarea id="solution" value={solution} readOnly rows={6} />
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
