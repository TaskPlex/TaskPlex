import React, { useState, useEffect, useCallback } from 'react';
import { Regex, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../services/api';
import type { RegexResponse } from '../services/api';

export const RegexScreen: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [flags, setFlags] = useState<string[]>(['g']); // Default Global
  const [result, setResult] = useState<RegexResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.testRegex(pattern, text, flags.join(''));
      if (res.success) {
        setResult(res);
      } else {
        setResult(null);
        setError(res.error || 'Invalid regex pattern');
      }
    } catch (err) {
      setResult(null);
      setError('Failed to test regex. Check backend connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pattern, text, flags]);

  // Debounce pattern testing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pattern && text) {
        handleTest();
      } else {
        setResult(null);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pattern, text, handleTest]);

  const toggleFlag = (flag: string) => {
    setFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    );
  };

  const availableFlags = [
    { id: 'g', label: 'Global', desc: "Don't return after first match" },
    { id: 'i', label: 'Insensitive', desc: 'Case insensitive match' },
    { id: 'm', label: 'Multiline', desc: '^ and $ match start/end of line' },
    { id: 's', label: 'Dotall', desc: 'Dot matches newline' },
  ];

  const renderHighlightedText = () => {
    if (!result || !result.matches || result.matches.length === 0) {
      return <div className="text-gray-500 italic p-4">No matches found</div>;
    }

    // Create segments of text (matched vs unmatched)
    // Since matches can overlap or be complex, we'll keep it simple:
    // Sort matches by start index
    const sortedMatches = [...result.matches].sort((a, b) => a.start - b.start);
    
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    sortedMatches.forEach((match, i) => {
      // Text before match
      if (match.start > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>{text.substring(lastIndex, match.start)}</span>
        );
      }

      // The match itself
      elements.push(
        <span key={`match-${i}`} className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-medium relative group cursor-help border-b-2 border-yellow-400">
          {text.substring(match.start, match.end)}
          {/* Tooltip for groups */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap shadow-lg">
            Match #{i + 1}
            {match.groups.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-700">
                {match.groups.map((g, gi) => (
                  <div key={gi}>Group {gi + 1}: {g}</div>
                ))}
              </div>
            )}
          </div>
        </span>
      );

      lastIndex = match.end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{elements}</div>;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Regex className="text-yellow-600" size={32} />
          Regex Tester
        </h1>
        <p className="text-gray-600">Test and debug your regular expressions in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Pattern Input */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Regular Expression</label>
            <div className={`flex items-center bg-gray-50 border rounded-lg overflow-hidden ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'}`}>
              <span className="pl-3 text-gray-400 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. [a-z]+"
                className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 px-1 font-mono text-gray-900 placeholder-gray-400"
              />
              <span className="pr-3 text-gray-400 font-mono">/</span>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600 flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">Flags</label>
            <div className="space-y-3">
              {availableFlags.map(flag => (
                <label key={flag.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={flags.includes(flag.id)}
                      onChange={() => toggleFlag(flag.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                    />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                      {flag.id} - {flag.label}
                    </div>
                    <div className="text-xs text-gray-500">{flag.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Test String & Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Test String */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">Test String</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here to test the regex..."
              className="flex-1 w-full h-40 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
            />
          </div>

          {/* Results */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[200px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Match Results</label>
              {loading && <span className="text-xs text-purple-600 font-medium animate-pulse">Testing...</span>}
              {result && !loading && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 size={12} />
                  {result.count} matches found
                </span>
              )}
            </div>
            
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-[400px]">
              {pattern && text ? (
                renderHighlightedText()
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Enter a regex pattern and test text to see results.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

