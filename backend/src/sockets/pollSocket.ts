import { Server, Socket } from "socket.io";
import { PollService } from "../services/pollService";

const emitError = (socket: Socket, message: string) => {
  socket.emit("error:poll", { message });
};

export const registerPollSocket = (io: Server, pollService: PollService) => {
  io.on("connection", (socket) => {
    socket.on("poll:create", async (payload) => {
      try {
        const poll = await pollService.createPoll(payload.question, payload.options, payload.duration || 60);
        io.emit("poll:started", { poll, remaining: poll.duration, serverTime: Date.now() });
      } catch (err: any) {
        emitError(socket, err?.message || "Unable to create poll");
      }
    });

    socket.on("poll:vote", async (payload) => {
      try {
        const updated = await pollService.submitVote(payload.pollId, payload.studentId, payload.studentName, payload.optionId);
        io.emit("poll:updated", { poll: updated, serverTime: Date.now() });
      } catch (err: any) {
        emitError(socket, err?.message || "Unable to submit vote");
      }
    });

    socket.on("poll:end", async () => {
      try {
        const closed = await pollService.endActivePoll();
        io.emit("poll:ended", { poll: closed, serverTime: Date.now() });
      } catch (err: any) {
        emitError(socket, err?.message || "Unable to end poll");
      }
    });

    socket.on("poll:requestActive", async (payload) => {
      try {
        const result = await pollService.getActivePoll(payload?.studentId);
        socket.emit("poll:active", {
          poll: result?.poll || null,
          remaining: result?.remaining || 0,
          studentVote: result?.studentVote || null,
          serverTime: Date.now(),
        });
      } catch (err: any) {
        emitError(socket, err?.message || "Unable to fetch active poll");
      }
    });

    // Chat Handler
    socket.on("chat:send", (payload) => {
      io.emit("chat:receive", { ...payload, timestamp: Date.now() });
    });

    const broadcastParticipants = () => {
       const participants = Array.from(io.sockets.sockets.values())
         .filter((s) => s.data.role === 'student' && s.data.name)
         .map((s) => ({ id: s.id, name: s.data.name }));
       io.emit("participants:update", participants);
    };

    socket.on("student:join", (payload) => {
      socket.data.role = 'student';
      socket.data.name = payload.name;
      socket.data.studentId = payload.id;
      broadcastParticipants();
    });

    socket.on("disconnect", () => {
      broadcastParticipants();
    });

    socket.on("student:kick", (socketId) => {
       const target = io.sockets.sockets.get(socketId);
       if (target) {
          target.emit("student:kicked");
          target.disconnect(true);
          broadcastParticipants();
       }
    });
  });
};