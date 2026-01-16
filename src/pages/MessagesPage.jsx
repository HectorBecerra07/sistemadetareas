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
    <List sx={{ p: 0 }}>
      {getConversations().map(({ user, lastMessage }) => (
        <ListItemButton
          key={user.id}
          selected={selectedUserId === user.id}
          onClick={() => handleSelectUser(user.id)}
        >
          <ListItemAvatar>
            <Avatar>{user.name[0]}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={user.name}
            secondary={lastMessage?.text || 'No hay mensajes aún.'}
            secondaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      ))}
    </List>
  );

  const selectedUser = users.find(u => u.id === selectedUserId);
  const filteredMessages = messages.filter(
    msg => (msg.from_user_id === currentUser.id && msg.to_user_id === selectedUserId) ||
           (msg.from_user_id === selectedUserId && msg.to_user_id === currentUser.id)
  );

  const chatWindow = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      {/* Chat Header */}
      <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        {isMobile && (
          <IconButton onClick={() => setSelectedUserId(null)}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar>{selectedUser?.name?.[0]}</Avatar>
        <Typography variant="h6">{selectedUser?.name}</Typography>
      </Paper>
      
      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {filteredMessages.map((msg, index) => {
          const isMe = msg.from_user_id === currentUser.id;
          return (
            <Box key={index} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', mb: 1.5 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  borderRadius: isMe ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  bgcolor: isMe ? 'primary.main' : 'background.paper',
                  color: isMe ? 'primary.contrastText' : 'text.primary',
                  maxWidth: '70%',
                }}
              >
                <Typography variant="body1">{msg.text}</Typography>
                 <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.5 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage} disabled={!messageText.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
       <Typography variant="h5" gutterBottom>
        Mensajería
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ height: 'calc(100vh - 64px - 48px - 48px)', display: 'flex', borderRadius: 2, overflow: 'hidden' }}>
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
              display: isMobile && selectedUserId ? 'none' : 'block',
              overflowY: 'auto'
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
