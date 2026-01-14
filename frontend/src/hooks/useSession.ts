import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

const SESSION_KEY = "poll-session-id";

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string>("");
  const [name, setNameState] = useState<string>("");

  useEffect(() => {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      setSessionId(existing);
    } else {
      const id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
      setSessionId(id);
    }
    // Do not persist name across sessions; new tab gets fresh name
    setNameState("");
  }, []);

  const setName = (value: string) => {
    setNameState(value);
  };

  return { sessionId, name, setName };
};