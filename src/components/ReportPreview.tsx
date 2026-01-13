import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, Download, FileText, Image, FileWarning } from 'lucide-react';

interface ReportPreviewProps {
  reportUrl: string;
}

function decodeBase64Url(base64: string): string {
  try {
    return atob(base64);
  } catch {
    return base64;
  }
}

function getFileType(url: string): 'pdf' | 'image' | 'unknown' {
  const lower = url.toLowerCase();
  if (lower.includes('.pdf')) return 'pdf';
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
  return 'unknown';
}

export function ReportPreview({ reportUrl }: ReportPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!reportUrl) {
    return (
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        <FileWarning className="h-4 w-4" />
        No report
      </span>
    );
  }

  const decodedUrl = decodeBase64Url(reportUrl);
  const fileType = getFileType(decodedUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = decodedUrl;
    link.download = 'report';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Eye className="h-3 w-3" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {fileType === 'pdf' && <FileText className="h-5 w-5" />}
              {fileType === 'image' && <Image className="h-5 w-5" />}
              Report Preview
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {fileType === 'pdf' && (
              <iframe
                src={decodedUrl}
                className="h-[70vh] w-full rounded-lg border"
                title="PDF Report Preview"
              />
            )}
            {fileType === 'image' && (
              <img
                src={decodedUrl}
                alt="Report"
                className="max-h-[70vh] w-full rounded-lg object-contain"
              />
            )}
            {fileType === 'unknown' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileWarning className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1">
        <Download className="h-3 w-3" />
      </Button>
    </div>
  );
}
