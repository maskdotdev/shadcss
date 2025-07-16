'use client'

import { useState, useEffect } from 'react'
import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'
import { Button } from '@/components/shadcss-ui/button'
import { Check, Copy, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export interface CodeBlockProps {
  code: string
  language: BundledLanguage
  title?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
  copyable?: boolean
  downloadable?: boolean
  filename?: string
  className?: string
  onCopy?: (code: string) => void
}

export function CodeBlock({
  code,
  language,
  title,
  showLineNumbers = true,
  highlightLines = [],
  copyable = true,
  downloadable = false,
  filename,
  className = '',
  onCopy
}: CodeBlockProps) {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null)
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initHighlighter = async () => {
      try {
        const hl = await createHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: ['typescript', 'tsx', 'css', 'javascript', 'jsx', 'json', 'bash']
        })
        
        if (mounted) {
          setHighlighter(hl)
        }
      } catch (error) {
        console.error('Failed to initialize highlighter:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initHighlighter()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!highlighter || !code) {
      setIsLoading(false)
      return
    }

    try {
      const highlighted = highlighter.codeToHtml(code, {
        lang: language,
        theme: 'github-dark',
        transformers: [
          {
            name: 'line-numbers',
            line(node, line) {
              if (showLineNumbers) {
                node.properties['data-line'] = line
              }
              if (highlightLines.includes(line)) {
                node.properties.class = (node.properties.class || '') + ' highlighted-line'
              }
            }
          }
        ]
      })
      
      setHighlightedCode(highlighted)
    } catch (error) {
      console.error('Failed to highlight code:', error)
    } finally {
      setIsLoading(false)
    }
  }, [highlighter, code, language, showLineNumbers, highlightLines])

  const handleCopy = async () => {
    if (!copyable) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      
      // Call onCopy callback if provided
      onCopy?.(code)
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          toast.success('Code copied to clipboard!')
          onCopy?.(code)
          setTimeout(() => setCopied(false), 2000)
        } else {
          toast.error('Failed to copy code')
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        toast.error('Failed to copy code')
      }
    }
  }

  const handleDownload = () => {
    if (!downloadable) return

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `code.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded ${a.download}`)
  }

  const getFileExtension = (lang: BundledLanguage): string => {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      tsx: 'tsx',
      javascript: 'js',
      jsx: 'jsx',
      css: 'css',
      json: 'json',
      bash: 'sh',
      shell: 'sh'
    }
    return extensions[lang] || 'txt'
  }

  if (isLoading) {
    return (
      <div className={`relative rounded-lg border bg-muted/50 ${className}`}>
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
        )}
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!highlighter || !highlightedCode) {
    return (
      <div className={`relative rounded-lg border bg-muted/50 ${className}`}>
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            {copyable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm">{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg border bg-background ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="flex items-center gap-1" role="toolbar" aria-label="Code actions">
            {downloadable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                aria-label={`Download ${filename || `code.${getFileExtension(language)}`}`}
                title="Download code"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {copyable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0"
                aria-label={copied ? "Code copied!" : "Copy code to clipboard"}
                title={copied ? "Code copied!" : "Copy code"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
      
      {!title && copyable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
          aria-label={copied ? "Code copied!" : "Copy code to clipboard"}
          title={copied ? "Code copied!" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}

      <div 
        className="code-block overflow-x-auto [&_pre]:p-4 [&_pre]:m-0 [&_code]:text-sm"
        role="region"
        aria-label={`${language} code${title ? ` for ${title}` : ''}`}
        tabIndex={0}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </div>
  )
}