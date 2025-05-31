import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwaps } from '../../hooks/useSwaps';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../../components/auth/ErrorMessage';
import { Button } from '../../components/common';
import { Bar } from 'react-chartjs-2'; // Import Bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SwapHistoryPage() {
  const navigate = useNavigate();
  const { getSwaps, getAnalytics, swaps, analytics, isLoading, error } = useSwaps();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getSwaps('completed');
      getAnalytics();
    }
  }, [isAuthenticated, navigate, getSwaps, getAnalytics]);

  const chartData = {
    labels: analytics?.swaps_by_month?.map((m) => m.month) || [],
    datasets: [
      {
        label: 'Swaps per Month',
        data: analytics?.swaps_by_month?.map((m) => m.count) || [],
        backgroundColor: '#FF6F61',
        borderColor: '#e65a50',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Swaps per Month' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Swaps' } },
      x: { title: { display: true, text: 'Month' } },
    },
  };

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Swap History
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          View your completed book swaps and analytics.
        </motion.p>

        {/* Swap Analytics */}
        <motion.div
          className="bookish-shadow p-4 bg-white rounded-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-xl font-['Playfair_Display'] text-[#FF6F61] mb-4">
            Swap Analytics
          </h3>
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-2 bg-[#F5E8C7] rounded">
                  <p className="text-sm text-[#333] font-['Poppins']">Total Swaps</p>
                  <p className="text-lg font-semibold text-[#FF6F61]">{analytics.total_swaps || 0}</p>
                </div>
                <div className="p-2 bg-[#F5E8C7] rounded">
                  <p className="text-sm text-[#333] font-['Poppins']">Completed Swaps</p>
                  <p className="text-lg font-semibold text-[#FF6F61]">{analytics.completed_swaps || 0}</p>
                </div>
                <div className="p-2 bg-[#F5E8C7] rounded">
                  <p className="text-sm text-[#333] font-['Poppins']">Success Rate</p>
                  <p className="text-lg font-semibold text-[#FF6F61]">{(analytics.success_rate || 0).toFixed(1)}%</p>
                </div>
              </div>
              {analytics.swaps_by_month?.length ? (
                <div className="mt-4">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <p className="text-[#333] font-['Poppins'] text-center">
                  No monthly swap data available.
                </p>
              )}
            </div>
          ) : (
            <p className="text-[#333] font-['Poppins'] text-center">
              No analytics data available.
            </p>
          )}
        </motion.div>

        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            to="/swaps"
            className="px-4 py-2 font-['Poppins'] text-sm rounded-full bg-[#FF6F61] text-white hover:bg-[#e65a50]"
          >
            Back to Active Swaps
          </Link>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorMessage message={error} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {isLoading ? (
            <div className="text-center">
              <div className="bookish-spinner mx-auto"></div>
              <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
            </div>
          ) : swaps?.length ? (
            <ul className="space-y-6">
              <AnimatePresence>
                {swaps.map((swap, index) => (
                  <motion.li
                    key={swap.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center bookish-shadow p-4 bg-white rounded-lg">
                      <div>
                        <p className="text-lg font-semibold text-[#333] font-['Poppins']">
                          Swap #{swap.id} - {swap.book_title}
                        </p>
                        <p className="text-sm text-gray-600">
                          With: {swap.initiator?.id === user?.id ? swap.recipient?.username : swap.initiator?.username}
                        </p>
                        <p className="text-sm text-gray-600">Status: Completed</p>
                      </div>
                      <Link to={`/swaps/${swap.id}`}>
                        <Button className="bookish-button-enhanced">View Details</Button>
                      </Link>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <p className="text-center text-[#333] font-['Poppins']">
              No completed swaps found.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SwapHistoryPage;