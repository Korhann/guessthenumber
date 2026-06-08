import { Server } from 'socket.io';


let io;
let queueList = [];
let waitingRoomList = [];
let player1Username = '';
let player2Username = '';
let player1Secret = '';
let player2Secret = '';


export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      cors: true,
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('waiting_room', (data) => {
      // console.log(`${data.username} is in the waiting room`);
      waitingRoomList.push({socketId: socket.id, username: data.username});
      console.log('Waiting room:', waitingRoomList);

      if (waitingRoomList.length === 2) {
        const player1 = waitingRoomList.shift();
        const player2 = waitingRoomList.shift();
        // attach the username to use it in the game_finished alert
        player1Username = player1.username;
        player2Username = player2.username;
        addToQueue(io.sockets.sockets.get(player1.socketId), player1.username);
        addToQueue(io.sockets.sockets.get(player2.socketId), player2.username);
      }
    });

    socket.on('secret_submitted', (data) => {
      console.log(`Player ${data.playerRole} submitted their secret ${data.secret} in room ${data.roomId}`);
      if (data.playerRole === 1) {
        player1Secret = data.secret;
      } else {
        player2Secret = data.secret;
      }
      socket.to(data.roomId).emit('opponent_secret_submitted', {
        playerRole: data.playerRole,
        secret: data.secret
      });
    });

    socket.on('change_player_turn', (data) => {
      console.log('this worked', data.activePlayer);
      io.to(data.roomId).emit('changed_turns', {
        activePlayer: data.activePlayer
      });
    });

    socket.on('game_finished', (data) => {
      const winner = data.username;
      console.log('winner is ',winner);
      // Emit to both players with both secrets so each can see their own
      io.to(data.roomId).emit('game_over', {
        winner,
        player1Username,
        player2Username,
        player1Secret,
        player2Secret,
      });
    });

    socket.on('end_game', (data) => {
      console.log('A user disconnected');
      socket.disconnect();
    });
  });

  return io;
}

function addToQueue(socket,username) {
  // push the players to the queueList
  queueList.push({socketId: socket.id, username});

  if (queueList.length !== 2) {
    console.log('There is one player here');
  } else {
    if (queueList.length >= 2) {
    const player1 = queueList.shift();
    const player2 = queueList.shift();
    const roomId = `game_${Date.now()}`;
    // Get the socket and join the room
    const socket1 = io.sockets.sockets.get(player1.socketId);
    const socket2 = io.sockets.sockets.get(player2.socketId);

    if (socket1) socket1.join(roomId);
    if (socket2) socket2.join(roomId);
    // Notify both players
    io.to(player1.socketId).emit('game_start', { 
      roomId, 
      opponent: player2.username,
      playerRole: 1
    });
    io.to(player2.socketId).emit('game_start', { 
      roomId, 
      opponent: player1.username ,
      playerRole: 2
    });
    console.log(`Game started: ${player1.username} vs ${player2.username}`);
  }
  }
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized! Call initSocket first.');
  }
  return io;
}