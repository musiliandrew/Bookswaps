import { useEffect, useState } from 'react';
import { useSwaps } from '../hooks/useSwaps';
import { QRCodeDisplay } from '../components/swaps/QRCodeDisplay';
import { QRCodeScanner } from '../components/swaps/QRCodeScanner';

const SwapFeedPage = () => {
  const { getSwaps, swaps, isLoading, error } = useSwaps();
  const [selectedSwapId, setSelectedSwapId] = useState(null);

  useEffect(() => {
    getSwaps();
  }, [getSwaps]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 bookish-gradient">
      <h1 className="text-3xl font-bold mb-4">My Swaps</h1>
      <div className="space-y-4">
        {swaps.map((swap) => (
          <div key={swap.id} className="bookish-shadow p-4 bg-white rounded-lg">
            <p>Swap #{swap.id} - Status: {swap.status}</p>
            <p>Book: {swap.book_title}</p>
            <button
              onClick={() => setSelectedSwapId(swap.id)}
              className="text-primary hover:underline"
            >
              View QR Options
            </button>
            {selectedSwapId === swap.id && (
              <div className="mt-4 space-y-4">
                <QRCodeDisplay swapId={swap.id} />
                <QRCodeScanner swapId={swap.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwapFeedPage;