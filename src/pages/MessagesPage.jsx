import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Paper,
  Grid,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  ListItemAvatar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { fetchMessages, createMessage, fetchUsers } from '../services/api';
import { useUser } from '../context/UserContext';

const MessagesPage = () => {
  const { currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [fetchedUsers, fetchedMessages] = await Promise.all([
          fetchUsers(),
          fetchMessages(),
        ]);
        setUsers(fetchedUsers.filter(u => u.id !== currentUser.id));
        setMessages(fetchedMessages);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos de mensajería.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  // Auto-select the first user if none is selected
  useEffect(() => {
    if (selectedUserId === null && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUserId) return;
    try {
      const newMessage = {
        text: messageText,
        to_user_id: selectedUserId,
      };
      const sentMessage = await createMessage(newMessage);
      setMessages((prev) => [...prev, sentMessage]);
      setMessageText('');
    } catch (err) {
      setError('Error al enviar el mensaje.');
    }
  };

  const getConversations = () => {
    const conversations = {};
    messages.forEach(msg => {
      const otherId = msg.from_user_id === currentUser.id ? msg.to_user_id : msg.from_user_id;
      if (!conversations[otherId]) {
        conversations[otherId] = [];
      }
      conversations[otherId].push(msg);
    });

    return users.map(user => {
      const userMessages = conversations[user.id] || [];
      const lastMessage = userMessages[userMessages.length - 1];
      return { user, lastMessage };
    }).sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  const conversationList = (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, pb: 1 }}>Conversations</Typography>
      <List sx={{ p: '0 8px' }}>
        {getConversations().map(({ user, lastMessage }) => (
          <ListItemButton
            key={user.id}
            selected={selectedUserId === user.id}
            onClick={() => handleSelectUser(user.id)}
            sx={{ 
              borderRadius: 1.5, 
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              },
               '& .MuiListItemText-secondary': {
                color: selectedUserId === user.id ? 'primary.contrastText' : 'text.secondary',
                opacity: selectedUserId === user.id ? 0.8 : 1,
              }
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: selectedUserId === user.id ? 'white' : 'primary.main', color: selectedUserId === user.id ? 'primary.main' : 'white' }}>
                {user.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={lastMessage?.text || 'No messages yet.'}
              primaryTypographyProps={{ fontWeight: 'medium' }}
              secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const selectedUser = users.find(u => u.id === selectedUserId);
  const filteredMessages = messages.filter(
    msg => (msg.from_user_id === currentUser.id && msg.to_user_id === selectedUserId) ||
           (msg.from_user_id === selectedUserId && msg.to_user_id === currentUser.id)
  );

  const chatWindow = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      {/* Chat Header */}
      <Paper 
        square 
        elevation={0} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'white'
        }}
      >
        {isMobile && (
          <IconButton onClick={() => setSelectedUserId(null)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar sx={{ bgcolor: 'primary.light' }}>{selectedUser?.name?.[0]}</Avatar>
        <Typography variant="h6" fontWeight="bold">{selectedUser?.name}</Typography>
      </Paper>
      
      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: 'grey.50' }}>
        {filteredMessages.map((msg) => {
          const isMe = msg.from_user_id === currentUser.id;
          return (
            <Box 
              key={msg.id} 
              sx={{ 
                display: 'flex', 
                justifyContent: isMe ? 'flex-end' : 'flex-start', 
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    bgcolor: isMe ? 'primary.main' : 'white',
                    color: isMe ? 'white' : 'text.primary',
                    maxWidth: '400px',
                    border: isMe ? 0 : 1,
                    borderColor: 'grey.300'
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Paper>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, px: 1 }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.100', borderRadius: 2, p: '4px' }}>
          <TextField
            fullWidth
            variant="filled"
            size="small"
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            sx={{
              '& .MuiFilledInput-root': {
                backgroundColor: 'transparent',
                '&:hover, &.Mui-focused': {
                  backgroundColor: 'transparent',
                },
              },
              '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
                display: 'none',
              },
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={!messageText.trim()}
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, mr: '4px' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Typography variant="h4" sx={{ p: 2, pb: 0 }}>
        Mensajería
      </Typography>
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      <Paper 
        elevation={0}
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          m: 2, 
          mt: 1,
          borderRadius: 2, 
          overflow: 'hidden',
          bgcolor: 'white'
        }}
      >
        <Grid container sx={{ height: '100%' }}>
          {/* Conversation List */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              height: '100%',
              borderRight: { md: 1 },
              borderColor: { md: 'divider' },
              display: isMobile && selectedUserId ? 'none' : 'flex',
              flexDirection: 'column',
            }}
          >
            {conversationList}
          </Grid>
          {/* Chat Window */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              height: '100%',
              display: isMobile && !selectedUserId ? 'none' : 'flex',
              flexDirection: 'column'
            }}
          >
            {selectedUser ? (
              chatWindow
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Selecciona una conversación para empezar a chatear.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MessagesPage;
