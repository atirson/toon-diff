'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ToonInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ToonInput({ label, value, onChange, placeholder }: ToonInputProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e?.target?.result;

      if (file.size > 1024 * 1024) {
        alert('File too large. Maximum allowed is 1MB.');
        return;
      }

      if (typeof content === 'string') {
        onChange(content);
      }
    };
    reader.readAsText(file);
  }, [onChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleChange = (value: string) => {
    const lines = value.split('\n');
    if (lines.length > 1000) {
      alert('Maximum of 1000 lines allowed.');
      return;
    }
    onChange(value);
  };

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
        <label>
          <input
            type="file"
            accept=".toon,.txt,.yaml,.yml"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button size="sm" variant="outline" className="cursor-pointer" asChild>
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </span>
          </Button>
        </label>
      </div>
      
      <div
        className={`relative flex ${
          isDragging ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          ref={gutterRef}
          aria-hidden
          className="select-none text-right pr-5 pt-[9px] pb-[9px] bg-gray-100 dark:bg-gray-800 text-xs text-gray-400 font-mono border-l border-t border-b border-gray-200 dark:border-gray-700 rounded-l-md"
          style={{
            minWidth: "2.5rem",
            maxHeight: "400px",
            overflow: "hidden",
            userSelect: "none",
            marginRight: "-10px",
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} style={{ height: "20px", lineHeight: "35px" }}>{i + 1}</div>
          ))}
        </div>
        <Textarea
          ref={textareaRef}
          onScroll={handleScroll}
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder ?? 'Paste or upload TOON content...'}
          className="w-full h-full min-h-[400px] p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          spellCheck={false}
        />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-950/90 rounded-lg pointer-events-none">
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              Drop file here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
