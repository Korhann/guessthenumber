import { Server } from 'socket.io';


let io;
let queueList = [];
let waitingRoomList = [];

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
      console.log(`${data.username} is in the waiting room`);
      console.log('im in the waiting room');
      //todo: burada listeye 2 oyuncu eklicem ve sonra join_queue çalıştırıcam
    });

    socket.on('join_queue', (data) => {
      addToQueue(socket,data.username);
    });

    socket.on('start_matchmaking', (data) => {
      
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io;
}

function addToQueue(socket,username) {
  // push the players to the queueList
  queueList.push({socketId: socket.id, username});

  console.log(queueList.length);
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
      opponent: player2.username 
    });
    io.to(player2.socketId).emit('game_start', { 
      roomId, 
      opponent: player1.username 
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