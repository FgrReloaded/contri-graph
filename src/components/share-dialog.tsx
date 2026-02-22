"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export default function ShareDialog({ open, onOpenChange, shareUrl }: ShareDialogProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyHtml = async () => {
    const htmlCode = `<img src="${shareUrl}" alt="Contribution Graph" />`;
    await navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Share your contribution graph</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Copy this link to embed your contribution graph in your GitHub README or anywhere else
          </p>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Image URL</div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  readOnly
                  value={shareUrl}
                  className="font-mono text-[10px] sm:text-xs w-full"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              <Button onClick={handleCopyUrl} variant="outline" className="shrink-0 w-full sm:w-auto">
                <span className="flex items-center gap-2">
                  {copiedUrl ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <title>Copied</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="sm:hidden">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <title>Copy</title>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="sm:hidden">Copy URL</span>
                    </>
                  )}
                </span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">HTML Code</div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <code className="text-[10px] sm:text-xs break-all flex-1 min-w-0">{`<img src="${shareUrl}" alt="Contribution Graph" />`}</code>
                <Button onClick={handleCopyHtml} variant="ghost" size="sm" className="h-6 px-2 shrink-0 -mt-1">
                  {copiedHtml ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <title>Copied</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <title>Copy</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
