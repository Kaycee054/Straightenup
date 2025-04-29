import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'assigned' | 'closed';
  created_at: string;
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
  user: {
    full_name: string;
  };
}

const Support = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchTickets();
      subscribeToUpdates();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket, tickets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching tickets for user:', user.id);
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          assigned_to:profiles!support_tickets_assigned_to_fkey (
            full_name
          ),
          messages:support_messages (
            id,
            message,
            created_at,
            is_staff_reply,
            user:profiles!support_messages_user_id_fkey (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      console.log('Fetched tickets:', data);
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return;

    const ticketsSubscription = supabase
      .channel('tickets-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchTickets()
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=in.(${tickets.map(t => t.id).join(',')})`
        },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          title: newTicketTitle.trim(),
          user_id: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setNewTicketTitle('');
      setIsCreatingTicket(false);
      setSelectedTicket(data.id);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !user) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket,
          message: newMessage.trim(),
          user_id: user.id,
          is_staff_reply: false
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl backdrop-blur-xl border border-purple-500/20 overflow-hidden">
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Support</h2>
              <button
                onClick={() => setIsCreatingTicket(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Ticket
              </button>
            </div>
          </div>

          {isCreatingTicket ? (
            <div className="p-4">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    What do you need help with?
                  </label>
                  <input
                    type="text"
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    placeholder="Describe your issue"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTicket(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
              {/* Tickets List */}
              <div className="border-r border-purple-500/20">
                <div className="p-4 space-y-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                      <p>No support tickets yet</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <motion.button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket.id)}
                        className={`w-full p-4 text-left rounded-lg transition-colors ${
                          selectedTicket === ticket.id
                            ? 'bg-purple-600/20'
                            : 'hover:bg-purple-600/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <h3 className="font-medium mb-1">{ticket.title}</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ticket.status === 'open' ? 'bg-yellow-600/20 text-yellow-400' :
                            ticket.status === 'assigned' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-green-600/20 text-green-400'
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-gray-400">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-2 flex flex-col">
                {selectedTicket ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {(() => {
                        const ticket = tickets.find(t => t.id === selectedTicket);
                        if (!ticket) return null;

                        return ticket.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.is_staff_reply ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-[70%] rounded-lg p-4 ${
                              message.is_staff_reply
                                ? 'bg-purple-900/50 text-purple-100'
                                : 'bg-blue-900/50 text-blue-100'
                            }`}>
                              <div className="flex items-center mb-2">
                                <span className="font-medium">{message.user.full_name}</span>
                                <span className="text-xs opacity-75 ml-2">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap">{message.message}</p>
                            </div>
                          </div>
                        ));
                      })()}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20">
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a ticket to view the conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;