import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FireIcon, ArrowUpIcon, ChatBubbleLeftIcon, TrophyIcon } from '@heroicons/react/24/outline';

const TopPostsSidebar = ({ topPosts }) => {
  return (
    <motion.div
      className="bookish-glass rounded-2xl p-6 border border-white/20 sticky top-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center space-x-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
          <TrophyIcon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-lora font-bold text-primary">Top Posts</h3>
          <p className="text-xs text-primary/70">Most popular discussions</p>
        </div>
      </motion.div>

      {/* Posts List */}
      <div className="space-y-4">
        {topPosts && topPosts.length > 0 ? (
          topPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
            >
              <Link to={`/discussions/post/${post.id}`}>
                <motion.div
                  className="p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-accent/30 transition-all duration-300 group-hover:shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Post Rank */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-lora font-bold text-primary group-hover:text-accent transition-colors duration-300 line-clamp-2 mb-2">
                        {post.title}
                      </h4>

                      {/* Post Stats */}
                      <div className="flex items-center space-x-4 text-xs text-primary/60">
                        <div className="flex items-center space-x-1">
                          <ArrowUpIcon className="w-3 h-3 text-green-600" />
                          <span>{post.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChatBubbleLeftIcon className="w-3 h-3 text-blue-600" />
                          <span>{post.note_count || 0}</span>
                        </div>
                        {index < 3 && (
                          <div className="flex items-center space-x-1">
                            <FireIcon className="w-3 h-3 text-orange-500" />
                            <span>Hot</span>
                          </div>
                        )}
                      </div>

                      {/* Post Type Badge */}
                      {post.type && (
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            post.type === 'Article' ? 'bg-blue-100 text-blue-800' :
                            post.type === 'Synopsis' ? 'bg-green-100 text-green-800' :
                            post.type === 'Query' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.type === 'Article' ? '📝' : post.type === 'Synopsis' ? '📖' : '❓'} {post.type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm text-primary/70">No top posts yet</p>
            <p className="text-xs text-primary/50 mt-1">Start engaging with posts!</p>
          </motion.div>
        )}
      </div>

      {/* View All Link */}
      {topPosts && topPosts.length > 0 && (
        <motion.div
          className="mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Link
            to="/discussions"
            className="text-sm text-accent hover:text-accent/80 transition-colors duration-200 font-medium flex items-center justify-center space-x-1"
          >
            <span>View All Posts</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TopPostsSidebar;