'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { faArrowUp, faRotateRight, faShower } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'hey' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [indexName, setIndexName] = useState("nasa");
  // const [indexName, setIndexName] = useState("f77961ee-af74-4c9e-9b37-05ef43c0ca71");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listIndexes();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    setLoading(true);
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');

    try {
      if (!indexName) {
        throw new Error('No index available. Please upload a file first.');
      }

      const response = await fetch(`/api/queryIndex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ indexName: indexName, question: input }),
      });

      console.log('response:', response);

      if (!response.ok) {
        throw new Error('Error querying index');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (error: any) {
      console.error('Error querying index:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const listIndexes = async () => {
    try {
      const response = await fetch(`/api/listIndexes`);
      if (!response.ok) {
        throw new Error('Error listing indexes');
      }

      const data = await response.json();
      console.log('data:', data);
    } catch (error: any) {
      console.error('Error listing indexes:', error);
    }
  }

  const startOver = () => {
    console.log('Starting over...');
    console.log('initializing...');
    setMessages([{ sender: 'bot', text: 'Hello! How can I assist you today?' }]);
    setInput('');
    setLoading(false);
    setFileName('');
    setIndexName('');
  }

  const cleanChat = () => {
    console.log('Cleaning chat...');
    setMessages([{ sender: 'bot', text: 'Hello! How can I assist you today?' }]);
    setInput('');
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInput = (e: any) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const loader = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <circle cx={4} cy={12} r={3} fill="currentColor">
        <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3" />
      </circle>
      <circle cx={12} cy={12} r={3} fill="currentColor">
        <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3" />
      </circle>
      <circle cx={20} cy={12} r={3} fill="currentColor">
        <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3" />
      </circle>
    </svg>
  );

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div className='flex flex-col gap-4 fixed top-4 left-4'>
        <button
          onClick={startOver}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#eeeeee] text-black shadow cursor-pointer "
          >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
        <button
          onClick={cleanChat}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#eeeeee] text-black shadow cursor-pointer "
          >
          <FontAwesomeIcon icon={faShower} />
        </button>
      </div>
      <div className="w-full lg:max-w-5xl px-16 lg:px-0 mx-auto">
        <div className="mb-32 w-full lg:text-left overflow-auto">
          <div className="overflow-y-auto flex-1 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 mb-2 rounded-lg ${
                  message.sender === 'bot' ? 'bg-[#1e1e1e]' : 'bg-[#2e2e2e]'
                } text-white max-w-full`}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-[80%] lg:max-w-5xl mx-auto flex items-center p-2 mb-8 fixed bottom-0 left-0 right-0 shadow-lg gap-4 bg-[#2e2e2e] rounded-full">
        <textarea
          tabIndex={0}
          ref={textareaRef}
          className="flex-1 resize-none border-none focus:ring-0 outline-none bg-transparent text-white pl-6 pt-2"
          placeholder="Type your message..."
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          style={{ minHeight: '24px', maxHeight: '128px' }}
        />
        <button
          disabled={loading || input === ''}
          onClick={handleSendMessage}
          className={`flex items-center justify-center w-10 h-10 rounded-full shadow ${
            loading || input === '' ? 'cursor-not-allowed bg-[#4e4e4e] text-black'  : 'cursor-pointer bg-[#eeeeee] text-black'}`}
        >
          {!loading 
            ? <FontAwesomeIcon icon={faArrowUp} />
            : <span className='flex justify-center items-center text-white'>{loader()}</span>
          }
        </button>
      </div>
    </main>
  );
}