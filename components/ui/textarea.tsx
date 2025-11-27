import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // Handler para Tab customizado
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        // Insere dois espaços no cursor
        textarea.value = value.substring(0, start) + '  ' + value.substring(end);
        // Move o cursor após os dois espaços
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        // Força atualização do valor se controlado
        if (props.onChange) {
          const event = Object.assign({}, e, { target: textarea });
          props.onChange(event as any);
        }
      }
      if (props.onKeyDown) props.onKeyDown(e);
    };
    

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        style={{
          lineHeight: '20px',
          paddingBottom: '8px',
        }}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };