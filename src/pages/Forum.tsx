import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  User,
  Plus,
  Search,
  Filter,
  Pin,
  Lock,
  Unlock,
  MoreVertical,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  moderated_at: string | null;
  moderation_reason: string | null;
  user: {
    full_name: string;
  };
  replies: ForumReply[];
  category: {
    name: string;
  };
}

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  is_solution: boolean;
  moderated_at: string | null;
  moderation_reason: string | null;
  user: {
    full_name: string;
  };
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
}

const Forum = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category_id: ''
  });
  const [newReply, setNewReply] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [moderationReason, setModerationReason] = useState('');
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [itemToModerate, setItemToModerate] = useState<{
    id: string;
    type: 'topic' | 'reply';
  } | null>(null);
  const { user } = useAuthStore();
  const isModerator = user && ['admin', 'manager'].includes(user.role);

  useEffect(() => {
    fetchTopics();
    fetchCategories();
    subscribeToUpdates();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          user:profiles!forum_topics_user_id_fkey (
            full_name
          ),
          category:forum_categories (
            name
          ),
          replies:forum_replies!forum_replies_topic_id_fkey (
            id,
            content,
            created_at,
            is_solution,
            moderated_at,
            moderation_reason,
            user:profiles!forum_replies_user_id_fkey (
              full_name
            )
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const subscribeToUpdates = () => {
    const topicsSubscription = supabase
      .channel('forum-topics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_topics' },
        () => fetchTopics()
      )
      .subscribe();

    const repliesSubscription = supabase
      .channel('forum-replies')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_replies' },
        () => fetchTopics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(topicsSubscription);
      supabase.removeChannel(repliesSubscription);
    };
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.content.trim() || !newTopic.category_id) return;

    try {
      const { error } = await supabase
        .from('forum_topics')
        .insert({
          title: newTopic.title.trim(),
          content: newTopic.content.trim(),
          category_id: newTopic.category_id,
          user_id: user!.id
        });

      if (error) throw error;

      setNewTopic({ title: '', content: '', category_id: '' });
      setIsCreatingTopic(false);
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedTopic) return;

    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          content: newReply.trim(),
          topic_id: selectedTopic,
          user_id: user!.id
        });

      if (error) throw error;

      setNewReply('');
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleTogglePin = async (topicId: string, isPinned: boolean) => {
    if (!isModerator) return;
    
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !isPinned })
        .eq('id', topicId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleLock = async (topicId: string, isLocked: boolean) => {
    if (!isModerator) return;
    
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: !isLocked })
        .eq('id', topicId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleModerate = async () => {
    if (!itemToModerate || !moderationReason.trim() || !isModerator) return;

    try {
      if (itemToModerate.type === 'topic') {
        const { error } = await supabase.rpc('moderate_topic', {
          topic_id: itemToModerate.id,
          reason: moderationReason.trim()
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('moderate_reply', {
          reply_id: itemToModerate.id,
          reason: moderationReason.trim()
        });
        if (error) throw error;
      }

      setShowModerationDialog(false);
      setItemToModerate(null);
      setModerationReason('');
      fetchTopics(); // Refresh the topics list
    } catch (error) {
      console.error('Error moderating content:', error);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      topic.category.name === categoryFilter;

    return matchesSearch && matchesCategory && !topic.moderated_at;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
          {user && (
            <button
              onClick={() => setIsCreatingTopic(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Start Discussion
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No discussions found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start a new discussion to get the conversation going'}
              </p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <motion.div
                key={topic.id}
                layout
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {topic.is_pinned && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Pinned
                          </span>
                        )}
                        {topic.is_locked && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Locked
                          </span>
                        )}
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {topic.category.name}
                        </span>
                      </div>
                      <h3 
                        className="text-xl font-semibold text-gray-900 dark:text-white mt-2 cursor-pointer hover:text-purple-600"
                        onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                      >
                        {topic.title}
                      </h3>
                      <div className="mt-2 text-gray-600 dark:text-gray-300">
                        {selectedTopic === topic.id ? topic.content : topic.content.slice(0, 200) + '...'}
                      </div>
                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {topic.user.full_name}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(topic.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {topic.replies.filter(r => !r.moderated_at).length} replies
                        </div>
                      </div>
                    </div>
                    {isModerator && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTogglePin(topic.id, topic.is_pinned)}
                          className={`p-2 rounded-md ${
                            topic.is_pinned
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={topic.is_pinned ? 'Unpin topic' : 'Pin topic'}
                        >
                          <Pin className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleLock(topic.id, topic.is_locked)}
                          className={`p-2 rounded-md ${
                            topic.is_locked
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={topic.is_locked ? 'Unlock topic' : 'Lock topic'}
                        >
                          {topic.is_locked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <Unlock className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setItemToModerate({ id: topic.id, type: 'topic' });
                            setShowModerationDialog(true);
                          }}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-md"
                          title="Moderate topic"
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  {selectedTopic === topic.id && (
                    <div className="mt-6 space-y-4">
                      {topic.replies
                        .filter(reply => !reply.moderated_at)
                        .map((reply) => (
                          <div key={reply.id} className="pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {reply.user.full_name}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                  {reply.is_solution && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Solution
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">{reply.content}</p>
                              </div>
                              {isModerator && (
                                <button
                                  onClick={() => {
                                    setItemToModerate({ id: reply.id, type: 'reply' });
                                    setShowModerationDialog(true);
                                  }}
                                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-md"
                                  title="Moderate reply"
                                >
                                  <AlertTriangle className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                      {/* Reply Form */}
                      {user && !topic.is_locked && (
                        <form onSubmit={handleCreateReply} className="mt-4">
                          <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            rows={3}
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              type="submit"
                              disabled={!newReply.trim()}
                              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Post Reply
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Topic Modal */}
        {isCreatingTopic && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full m-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Start New Discussion</h2>
                  <button
                    onClick={() => setIsCreatingTopic(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newTopic.category_id}
                      onChange={(e) => setNewTopic({ ...newTopic, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      rows={6}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTopic(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Create Topic
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Dialog */}
        {showModerationDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full m-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Moderate {itemToModerate?.type === 'topic' ? 'Topic' : 'Reply'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModerationDialog(false);
                      setItemToModerate(null);
                      setModerationReason('');
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reason for Moderation
                    </label>
                    <textarea
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowModerationDialog(false);
                        setItemToModerate(null);
                        setModerationReason('');
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleModerate}
                      disabled={!moderationReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Moderate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;