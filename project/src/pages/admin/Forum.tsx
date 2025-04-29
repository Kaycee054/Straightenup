import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Pin, 
  Lock,
  Unlock,
  MessageSquare,
  User,
  Clock,
  Filter,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
}

interface ForumTopic {
  id: string;
  category_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  created_at: string;
  user: {
    full_name: string;
  };
  replies: ForumReply[];
}

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  is_solution: boolean;
  user: {
    full_name: string;
  };
}

const AdminForum = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    order_index: 0
  });
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCategories();
    fetchTopics();
    subscribeToUpdates();
  }, []);

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
          replies:forum_replies (
            id,
            content,
            created_at,
            is_solution,
            user:profiles!forum_replies_user_id_fkey (
              full_name
            )
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const categoriesSubscription = supabase
      .channel('forum-categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_categories' },
        () => fetchCategories()
      )
      .subscribe();

    const topicsSubscription = supabase
      .channel('forum-topics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_topics' },
        () => fetchTopics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesSubscription);
      supabase.removeChannel(topicsSubscription);
    };
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('forum_categories')
          .update({
            name: newCategory.name,
            description: newCategory.description,
            order_index: newCategory.order_index
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forum_categories')
          .insert([newCategory]);

        if (error) throw error;
      }

      setEditingCategory(null);
      setNewCategory({ name: '', description: '', order_index: 0 });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All topics will be deleted.')) return;

    try {
      const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleTogglePin = async (topicId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_pinned: !isPinned })
        .eq('id', topicId);

      if (error) throw error;
      fetchTopics();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleLock = async (topicId: string, isLocked: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_topics')
        .update({ is_locked: !isLocked })
        .eq('id', topicId);

      if (error) throw error;
      fetchTopics();
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;
      fetchTopics();
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user || !['admin', 'manager'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Categories Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Forum Categories</h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', description: '', order_index: categories.length });
            }}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>

        {(editingCategory || newCategory.name) && (
          <form onSubmit={handleSaveCategory} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Index
                </label>
                <input
                  type="number"
                  value={newCategory.order_index}
                  onChange={(e) => setNewCategory({ ...newCategory, order_index: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '', order_index: 0 });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setNewCategory({
                      name: category.name,
                      description: category.description || '',
                      order_index: category.order_index
                    });
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Forum Topics</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic) => (
              <motion.div
                key={topic.id}
                layout
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{topic.title}</h3>
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
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
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
                        {topic.replies.length} replies
                      </div>
                    </div>
                  </div>
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
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete topic"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminForum;