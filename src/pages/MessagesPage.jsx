import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  List,
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
import moment from 'moment';

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

  useEffect(() => {
    if (selectedUserId === null && users.length > 0 && !isMobile) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId, isMobile]);

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    if (isMobile) {
      // In mobile, we might want to automatically scroll to chat view
      // This is handled by conditional rendering of Grid items
    }
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
      return moment(b.lastMessage.createdAt).diff(moment(a.lastMessage.createdAt));
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const conversationList = (
    <Box sx={{ overflowY: 'auto', height: '100%', bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: 'bold' }}>Conversaciones</Typography>
      <Divider />
      <List sx={{ p: 1 }}>
        {getConversations().map(({ user, lastMessage }) => (
          <ListItemButton
            key={user.id}
            selected={selectedUserId === user.id}
            onClick={() => handleSelectUser(user.id)}
            sx={{
              borderRadius: theme.shape.borderRadius,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
              '&.Mui-selected .MuiListItemText-secondary': {
                color: theme.palette.primary.contrastText,
                opacity: 0.8,
              },
              '&.Mui-selected .MuiListItemIcon-root': {
                color: theme.palette.primary.contrastText,
              },
            }}
          >
            <ListItemAvatar>
              <Avatar src={user.avatarUrl} sx={{ bgcolor: selectedUserId === user.id ? 'white' : 'primary.light', color: selectedUserId === user.id ? 'primary.main' : 'white' }}>
                {user.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={user.name}
              secondary={lastMessage?.text || 'No hay mensajes aún.'}
              primaryTypographyProps={{ fontWeight: selectedUserId === user.id ? 'bold' : 'medium' }}
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
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {isMobile && (
          <IconButton onClick={() => setSelectedUserId(null)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar src={selectedUser?.avatarUrl}>{selectedUser?.name?.[0]}</Avatar>
        <Typography variant="h6" fontWeight="bold">{selectedUser?.name}</Typography>
      </Paper>
      
      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: theme.palette.grey[100] }}>
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
                  elevation={1}
                  sx={{
                    p: '10px 14px',
                    borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    bgcolor: isMe ? theme.palette.primary.main : theme.palette.background.paper,
                    color: isMe ? 'white' : theme.palette.text.primary,
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mx: 1 }}>
                  {moment(msg.createdAt).format('hh:mm A')}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            />
          </Grid>
          <Grid item>
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              sx={{ p: 1.5 }}
            >
              <SendIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Typography variant="h4" sx={{ p: 2, pb: 0, fontWeight: 'bold' }}>
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
          borderRadius: theme.shape.borderRadius,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
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
