'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/chat', {
        message,
      });
      setResponse(res.data.reply);
    } catch (err) {
      console.error(err);
      setResponse('حصل خطأ 😓');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">مساعد الذكاء الاصطناعي 🤖</h2>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={4}
        placeholder="اسأل أي سؤال بخصوص التاسكات..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'بيفكر...' : 'إرسال'}
      </button>

      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>الرد:</strong>
          <p className="mt-2">{response}</p>
        </div>
      )}
    </div>
  );
}
