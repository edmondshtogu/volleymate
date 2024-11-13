'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (e.g., Sentry, LogRocket)
    console.error('An error occurred:', error);
  }, [error]);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-8 space-y-4">
        <h1 className="font-semibold text-lg md:text-2xl">
          Something went wrong
        </h1>
        <p>
          There was an error while loading the page. Please review the details
          below to troubleshoot the issue.
        </p>

        <div className="space-y-2">
          <h2 className="font-semibold text-md">Error Details</h2>
          <p>
            <strong>Message:</strong> {error.message}
          </p>
          {error.stack && (
            <div>
              <strong>Stack Trace:</strong>
              <pre className="my-4 px-3 py-4 bg-black text-white rounded-lg max-w-2xl overflow-scroll text-sm">
                <code>{error.stack}</code>
              </pre>
            </div>
          )}
          {error.digest && (
            <div>
              <strong>Request Digest:</strong>
              <p>{error.digest}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
