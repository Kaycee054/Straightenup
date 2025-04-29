import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  User,
  Clock,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  UserCheck,
  Send,
  AlertCircle,
  RefreshCw,
  Tag,
  BarChart2,
  Users,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'assigned' | 'closed';
  created_at: string;
  unread_count: number;
  user: {
    full_name: string;
  };
  assigned_to?: {
    full_name: string;
  };
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;
  message: string;
  created_at: string;
  is_staff_reply: boolean;
  viewed_at: string | null;
  user: {
    full_name: string;
  };
}

interface TicketStats {
  total: number;
  open: number;
  assigned: number;
  closed: number;
  avgResponseTime: number;
  satisfactionRate: number;
}

const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    assigned: 0,
    closed: 0,
    avgResponseTime: 0,
    satisfactionRate: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTickets();
    calculateStats();
    subscribeToUpdates();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      markMessagesAsViewed(selectedTicket);
      scrollToBottom();
    }
  }, [selectedTicket, tickets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id,
          title,
          status,
          created_at,
          unread_count,
          user:profiles!support_tickets_user_id_fkey (
            full_name
          ),
          assigned_to:profiles!support_tickets_assigned_to_fkey (
            full_name
          ),
          messages:support_messages (
            id,
            message,
            created_at,
            is_staff_reply,
            viewed_at,
            user:profiles (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const assigned = tickets.filter(t => t.status === 'assigned').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    // Calculate average response time (in hours)
    const responseTimes = tickets.flatMap(ticket => {
      const userMessages = ticket.messages.filter(m => !m.is_staff_reply);
      const staffMessages = ticket.messages.filter(m => m.is_staff_reply);
      
      return userMessages.map(userMsg => {
        const nextStaffMsg = staffMessages.find(staffMsg => 
          new Date(staffMsg.created_at) > new Date(userMsg.created_at)
        );
        
        if (nextStaffMsg) {
          return (new Date(nextStaffMsg.created_at).getTime() - new Date(userMsg.created_at).getTime()) / (1000 * 60 * 60);
        }
        return null;
      }).filter(time => time !== null) as number[];
    });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate satisfaction rate (placeholder - would need actual feedback data)
    const satisfactionRate = 0.85; // 85% satisfaction rate

    setStats({
      total,
      open,
      assigned,
      closed,
      avgResponseTime,
      satisfactionRate
    });
  };

  const markMessagesAsViewed = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({ viewed_at: new Date().toISOString() })
        .eq('ticket_id', ticketId)
        .is('viewed_at', null)
        .eq('is_staff_reply', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as viewed:', error);
    }
  };

  const subscribeToUpdates = () => {
    const ticketsSubscription = supabase
      .channel('tickets-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => {
          fetchTickets();
          calculateStats();
        }
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages'
        },
        () => {
          fetchTickets();
          calculateStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket,
          message: newMessage.trim(),
          user_id: user!.id,
          is_staff_reply: true,
          viewed_at: new Date().toISOString()
        });

      if (error) throw error;
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAssignTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: user!.id,
          status: 'assigned'
        })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'closed'
        })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'open'
        })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (error) {
      console.error('Error reopening ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Tag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                <div className="ml-2 flex items-baseline text-sm font-semibold">
                  <span className="text-green-600">Active: {stats.open + stats.assigned}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.avgResponseTime.toFixed(1)}h
                </p>
                <p className="ml-2 text-sm text-gray-500">average</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Satisfaction Rate</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {(stats.satisfactionRate * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="text-sm">
                <p><span className="font-semibold text-yellow-600">{stats.open}</span> Open</p>
                <p><span className="font-semibold text-blue-600">{stats.assigned}</span> Assigned</p>
                <p><span className="font-semibold text-green-600">{stats.closed}</span> Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Tickets List */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No tickets found</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${
                      selectedTicket === ticket.id
                        ? 'bg-purple-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">{ticket.title}</h3>
                          {ticket.unread_count > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {ticket.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{ticket.user.full_name}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow h-[calc(100vh-13rem)] flex flex-col">
              {(() => {
                const ticket = tickets.find(t => t.id === selectedTicket);
                if (!ticket) return null;

                return (
                  <>
                    {/* Ticket Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">{ticket.title}</h2>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{ticket.user.full_name}</span>
                            </div>
                            {ticket.assigned_to && (
                              <div className="flex items-center space-x-1">
                                <UserCheck className="h-4 w-4" />
                                <span>Assigned to {ticket.assigned_to.full_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {ticket.status !== 'closed' && !ticket.assigned_to && (
                            <button
                              onClick={() => handleAssignTicket(ticket.id)}
                              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                              Assign to Me
                            </button>
                          )}
                          {ticket.status === 'closed' ? (
                            <button
                              onClick={() => handleReopenTicket(ticket.id)}
                              className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md"
                            >
                              Reopen
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {ticket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_staff_reply ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-4 ${
                              message.is_staff_reply
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              <span className="font-medium">{message.user.full_name}</span>
                              <span className="ml-2 text-xs opacity-75">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={ticket.status === 'closed'}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || ticket.status === 'closed' || isSending}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </form>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow h-[calc(100vh-13rem)] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Select a ticket to view the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;