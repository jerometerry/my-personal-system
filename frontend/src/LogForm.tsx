import React, { useState } from 'react';
import { useCreateLogMutation } from './state/generatedApi';

// Define the props, including the callback
interface LogFormProps {
  onSuccess: () => void;
}

export function LogForm({ onSuccess }: LogFormProps) {
  const [content, setContent] = useState('');
  const [createLog, { isLoading }] = useCreateLogMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createLog({ logEntry: { content, mood: 4 } }).unwrap();
      setContent('');
      onSuccess(); // Call the callback on success
    } catch (error) {
      console.error('Failed to create log:', error);
    }
  };

  // ... rest of the component's return statement is the same
  return (
    <form onSubmit={handleSubmit}>
      <h3>Add a New Log Entry</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="What's on your mind?"
        style={{ width: '100%', fontSize: '1em', padding: '8px' }}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Log'}
      </button>
    </form>
  );
}