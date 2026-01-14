import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useSocket } from "./useSocket";
import { Poll } from "../types";

type CreatePayload = { question: string; options: string[]; duration: number };

export const usePollState = (sessionId: string, name: string) => {
  const socket = useSocket();
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [studentVote, setStudentVote] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<number>(Date.now());
  const [history, setHistory] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollId = useMemo(() => activePoll?.id || null, [activePoll]);

  const normalizePoll = (payload: any): Poll => ({
    id: payload.id || payload._id,
    question: payload.question,
    options: payload.options,
    duration: payload.duration,
    startTime: payload.startTime,
    status: payload.status,
  });

  const fetchActive = async () => {
    if (!sessionId) return;
    const res = await client.get("/polls/active", { params: { studentId: sessionId } });
    const { poll, remaining, studentVote: vote, serverTime: srv } = res.data;
    setServerTime(srv || Date.now());
    if (poll) {
      setActivePoll(normalizePoll(poll));
      setStudentVote(vote?.optionId || null);
    } else {
      setActivePoll(null);
      setStudentVote(null);
    }
    return remaining;
  };

  const fetchHistory = async () => 
    client.get("/polls/history").then((res) => setHistory(res.data.polls.map(normalizePoll)));

  useEffect(() => {
    if (!sessionId) return;
    fetchActive();
    fetchHistory();
  }, [sessionId]);

  useEffect(() => {
    const onStarted = (payload: any) => {
      setActivePoll(normalizePoll(payload.poll));
      setStudentVote(null);
      setServerTime(payload.serverTime || Date.now());
    };
    const onUpdated = (payload: any) => {
      if (!payload.poll) return;
      setActivePoll(normalizePoll(payload.poll));
      setServerTime(payload.serverTime || Date.now());
    };
    const onActive = (payload: any) => {
      if (payload.poll) {
        setActivePoll(normalizePoll(payload.poll));
        setStudentVote(payload.studentVote?.optionId || null);
      } else {
        setActivePoll(null);
        setStudentVote(null);
      }
      setServerTime(payload.serverTime || Date.now());
    };
    const onEnded = (payload: any) => {
      setActivePoll(null);
      setStudentVote(null);
      setServerTime(payload?.serverTime || Date.now());
      fetchHistory();
    };
    const onError = (payload: any) => {
      setError(payload?.message || "Action failed");
    };
    socket.on("poll:started", onStarted);
    socket.on("poll:updated", onUpdated);
    socket.on("poll:active", onActive);
    socket.on("poll:ended", onEnded);
    socket.on("error:poll", onError);
    return () => {
      socket.off("poll:started", onStarted);
      socket.off("poll:updated", onUpdated);
      socket.off("poll:active", onActive);
      socket.off("poll:ended", onEnded);
      socket.off("error:poll", onError);
    };
  }, [socket]);

  useEffect(() => {
    const handleConnect = () => {
      requestActive();
    };
    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket]);

  const requestActive = () => {
    socket.emit("poll:requestActive", { studentId: sessionId });
  };

  const createPoll = async (payload: CreatePayload) => {
    setLoading(true);
    setError(null);
    try {
      if (socket.connected) {
        socket.emit("poll:create", payload);
        requestActive();
      } else {
        const res = await client.post("/polls", payload);
        const poll = normalizePoll(res.data.poll);
        setActivePoll(poll);
        setStudentVote(null);
        setServerTime(Date.now());
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to create poll");
    } finally {
      setLoading(false);
    }
  };

  const vote = (optionId: string) => {
    if (!pollId) return;
    setError(null);
    setStudentVote(optionId);
    socket.emit("poll:vote", { pollId, studentId: sessionId, studentName: name || "Anonymous", optionId });
  };

  const endPoll = async () => {
    setError(null);
    setLoading(true);
    try {
      if (socket.connected) {
        socket.emit("poll:end");
        requestActive();
      } else {
        await client.post("/polls/end");
        await fetchActive();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to end poll");
    } finally {
      setLoading(false);
    }
  };
  
  const resetPoll = () => {
     setActivePoll(null);
     setStudentVote(null);
  };


  return {
    activePoll,
    studentVote,
    serverTime,
    history,
    loading,
    error,
    createPoll,
    vote,
    endPoll,
    fetchActive,
    fetchHistory,
    requestActive,
    resetPoll,
    setError,
  };
};