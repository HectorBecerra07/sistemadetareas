import React, { useState, useEffect, useRef } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useTheme, useMediaQuery } from '@mui/material'; // Added for responsiveness
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // For mobile back button

import { fetchMessages, createMessage } from '../services/api'; // Added createMessage
import { useUser } from '../context/UserContext';

const MessagesPage = () => {
  const { currentUser, users } = useUser();
  const [allMessages, setAllMessages] = useState([]);
  const [conversations, setConversations] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef(null); // For auto-scrolling chat

  // State to control mobile view: 'list' or 'chat'
  const [mobileView, setMobileView] = useState('list');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        // Assuming fetchMessages might need a token if it fetches user-specific messages
        const fetchedMessages = await fetchMessages(currentUser?.token); 
        setAllMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los mensajes.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) { // Only load messages if a user is logged in
      loadMessages();
    }
  }, [currentUser]);

  // Agrupar conversaciones para el usuario actual
  useEffect(() => {
    if (!currentUser) {
      setConversations({});
      setSelectedConversation(null);
      return;
    }

    const userMessages = allMessages.filter(
      (msg) => msg.from === currentUser.id || msg.to === currentUser.id
    );

    const groupedConversations = userMessages.reduce((acc, msg) => {
      const otherUserId =
        msg.from === currentUser.id ? String(msg.to) : String(msg.from);
      if (!acc[otherUserId]) {
        acc[otherUserId] = [];
      }
      acc[otherUserId].push(msg);
      return acc;
    }, {});

    setConversations(groupedConversations);
  }, [currentUser, allMessages]);

  // Elegir automáticamente un usuario por defecto si no hay selección
  useEffect(() => {
    if (!currentUser || !users || users.length === 0) return;
    if (selectedConversation) return;

    const firstOther = users.find((u) => u.id !== currentUser.id);
    if (firstOther) {
      setSelectedConversation(String(firstOther.id));
    }
  }, [currentUser, users, selectedConversation]);

  // Auto-scroll when messages update or conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, conversations]);


  const getOtherUser = (conversationId) =>
    users.find((u) => u.id === parseInt(conversationId, 10));

  const handleSelectConversation = (userId) => {
    setSelectedConversation(userId);
    if (isMobile) {
      setMobileView('chat'); // Switch to chat view on mobile
    }
    setMessageText('');
  };

  const handleSendMessage = async () => { // Made async
    if (!messageText.trim() || !currentUser || !selectedConversation) return;

    const newMessage = {
      from: currentUser.id,
      to: parseInt(selectedConversation, 10),
      text: messageText.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Call the API to create the message
      const sentMessage = await createMessage(newMessage, currentUser.token);

      // Optimistically update UI or re-fetch messages
      setAllMessages((prev) => [...prev, { ...sentMessage, id: Date.now() }]); // Add dummy ID for now
      setConversations((prev) => {
        const existing = prev[selectedConversation] || [];
        return {
          ...prev,
          [selectedConversation]: [...existing, sentMessage],
        };
      });
      setMessageText('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje.');
    }
  };

  if (loading || !currentUser) {
    return (
      <Box
        sx={{
          flexGrow: 1, // Use flexGrow to fill space in AppLayout
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh', // Fallback minHeight
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Lista compacta de usuarios
  const conversationEntries = users
    .filter((u) => u.id !== currentUser.id)
    .map((user) => {
      const msgs = conversations[user.id] || [];
      return [String(user.id), msgs];
    })
    .sort(([, aMsgs], [, bMsgs]) => {
      const lastA = aMsgs[aMsgs.length - 1];
      const lastB = bMsgs[bMsgs.length - 1];

      const dateA = lastA?.createdAt ? new Date(lastA.createdAt) : new Date(0);
      const dateB = lastB?.createdAt ? new Date(lastB.createdAt) : new Date(0);

      return dateB - dateA;
    });

  const selectedMessages =
    selectedConversation && conversations[selectedConversation]
      ? conversations[selectedConversation]
      : [];

  const desktopLayout = (
    <Grid
      container
      component={Paper}
      sx={{
        flex: 1, // Take available height
        overflow: 'hidden',
        borderRadius: 2,
        height: 'calc(100vh - 64px - 48px - 32px)', // Adjust height for AppBar/padding
        minHeight: '500px', // Min height for desktop chat
      }}
    >
      {/* Lista de usuarios (Desktop) */}
      <Grid
        item
        md={4} // 1/3 width on desktop
        lg={3} // 1/4 width on large screens
        sx={{
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          bgcolor: '#fafafa',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {conversationEntries.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              No hay otros usuarios registrados para chatear.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ flex: 1 }}>
            {conversationEntries.map(([userId, msgs]) => {
              const otherUser = getOtherUser(userId);
              if (!otherUser) return null;

              const lastMsg = msgs[msgs.length - 1];
              const date =
                lastMsg?.createdAt && !Number.isNaN(new Date(lastMsg.createdAt))
                  ? new Date(lastMsg.createdAt)
                  : null;

              const timeLabel = date
                ? date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <ListItem
                  key={userId}
                  disablePadding
                  sx={{ borderBottom: '1px solid #eee' }} // Add separator
                >
                  <ListItemButton
                    selected={selectedConversation === userId}
                    onClick={() => handleSelectConversation(userId)}
                    sx={{
                      py: 1, // slightly more height
                      '&.Mui-selected': {
                        bgcolor: 'primary.light', // Brighter selection
                        color: 'primary.contrastText',
                        '& .MuiTypography-root': { color: 'inherit' },
                      },
                      '&.Mui-selected .MuiAvatar-root': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40, fontSize: 16 }}>
                        {otherUser.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle1" noWrap>
                            {otherUser.name}
                          </Typography>
                          {timeLabel && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {timeLabel}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2" // Larger secondary text
                          color="text.secondary"
                          noWrap
                        >
                          {lastMsg?.text || 'Empieza una conversación'}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Grid>

      {/* Ventana de chat (Desktop) */}
      <Grid
        item
        md={8} // 2/3 width on desktop
        lg={9} // 3/4 width on large screens
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        {selectedConversation ? (
          <>
            {/* Cabecera del chat */}
            <Box
              sx={{
                p: 1.5,
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#f5f5f5', // Subtle header background
              }}
            >
              {(() => {
                const otherUser = getOtherUser(selectedConversation);
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {otherUser?.name ? otherUser.name[0] : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {otherUser?.name || 'Usuario'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Online
                      </Typography>
                    </Box>
                  </Stack>
                );
              })()}
            </Box>

            {/* Mensajes */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1.5,
                bgcolor: '#e0f2f7', // Light chat background
              }}
            >
              {selectedMessages.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                  >
                    Aún no hay mensajes en esta conversación. Escribe el primero
                    👋
                  </Typography>
                </Box>
              ) : (
                selectedMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent:
                        msg.from === currentUser.id ? 'flex-end' : 'flex-start',
                      mb: 1, // Increased space between bubbles
                    }}
                  >
                    <Paper
                      elevation={1} // Add subtle shadow
                      sx={{
                        px: 1.5, // More padding
                        py: 0.8, // More padding
                        maxWidth: '75%', // Slightly wider bubbles
                        bgcolor:
                          msg.from === currentUser.id
                            ? 'primary.main'
                            : 'grey.200', // Different grey for received
                        color:
                          msg.from === currentUser.id ? 'white' : 'text.primary',
                        borderRadius:
                          msg.from === currentUser.id
                            ? '18px 18px 5px 18px'
                            : '18px 18px 18px 5px', // More rounded
                        fontSize: 14, // Slightly larger font
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 10,
                          color:
                            msg.from === currentUser.id
                              ? 'rgba(255,255,255,0.7)'
                              : 'text.secondary',
                          display: 'block',
                          textAlign:
                            msg.from === currentUser.id ? 'right' : 'left',
                          mt: 0.5,
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} /> {/* Scroll target */}
            </Box>

            <Divider />

            {/* Input de nuevo mensaje */}
            <Box
              sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1, // Increased gap
                bgcolor: '#f5f5f5', // Subtle input background
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="medium" // Slightly larger input
                placeholder="Escribe un mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                size="large" // Larger button
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Selecciona una conversación para empezar a chatear.
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );

  const mobileLayout = (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {mobileView === 'list' && (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {conversationEntries.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                No hay otros usuarios registrados para chatear.
              </Typography>
            </Box>
          ) : (
            <List dense sx={{ flex: 1 }}>
              {conversationEntries.map(([userId, msgs]) => {
                const otherUser = getOtherUser(userId);
                if (!otherUser) return null;

                const lastMsg = msgs[msgs.length - 1];
                const date =
                  lastMsg?.createdAt && !Number.isNaN(new Date(lastMsg.createdAt))
                    ? new Date(lastMsg.createdAt)
                    : null;

                const timeLabel = date
                  ? date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <ListItem
                    key={userId}
                    disablePadding
                    sx={{ borderBottom: '1px solid #eee' }}
                  >
                    <ListItemButton
                      selected={selectedConversation === userId}
                      onClick={() => handleSelectConversation(userId)}
                      sx={{
                        py: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          '& .MuiTypography-root': { color: 'inherit' },
                        },
                        '&.Mui-selected .MuiAvatar-root': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 40, height: 40, fontSize: 16 }}>
                          {otherUser.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="subtitle1" noWrap>
                              {otherUser.name}
                            </Typography>
                            {timeLabel && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {timeLabel}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {lastMsg?.text || 'Empieza una conversación'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      )}

      {mobileView === 'chat' && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Cabecera del chat (Mobile) */}
              <Box
                sx={{
                  p: 1.5,
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                }}
              >
                <IconButton onClick={() => setMobileView('list')} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                {(() => {
                  const otherUser = getOtherUser(selectedConversation);
                  return (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {otherUser?.name ? otherUser.name[0] : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {otherUser?.name || 'Usuario'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Online
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })()}
              </Box>

              {/* Mensajes (Mobile) */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 1.5,
                  bgcolor: '#e0f2f7',
                }}
              >
                {selectedMessages.length === 0 ? (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      align="center"
                    >
                      Aún no hay mensajes en esta conversación. Escribe el primero
                      👋
                    </Typography>
                  </Box>
                ) : (
                  selectedMessages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        justifyContent:
                          msg.from === currentUser.id ? 'flex-end' : 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          px: 1.5,
                          py: 0.8,
                          maxWidth: '80%',
                          bgcolor:
                            msg.from === currentUser.id
                              ? 'primary.main'
                              : 'grey.200',
                          color:
                            msg.from === currentUser.id ? 'white' : 'text.primary',
                          borderRadius:
                            msg.from === currentUser.id
                              ? '18px 18px 5px 18px'
                              : '18px 18px 18px 5px',
                          fontSize: 14,
                        }}
                      >
                        <Typography variant="body2">{msg.text}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: 10,
                            color:
                              msg.from === currentUser.id
                                ? 'rgba(255,255,255,0.7)'
                                : 'text.secondary',
                            display: 'block',
                            textAlign:
                              msg.from === currentUser.id ? 'right' : 'left',
                            mt: 0.5,
                          }}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Input de nuevo mensaje (Mobile) */}
              <Box
                sx={{
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#f5f5f5',
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  size="medium"
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  size="large"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Selecciona una conversación para empezar a chatear.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Mensajería
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {isMobile ? mobileLayout : desktopLayout}
    </Box>
  );
};

export default MessagesPage;
