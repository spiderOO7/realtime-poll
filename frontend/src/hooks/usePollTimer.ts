import { useEffect, useMemo, useState } from "react";
import { Poll } from "../types";

const computeRemaining = (poll: Poll, drift: number) => {
  const start = new Date(poll.startTime).getTime();
  const now = Date.now() + drift;
  const elapsed = Math.floor((now - start) / 1000);
  const remaining = poll.duration - elapsed;
  return remaining > 0 ? remaining : 0;
};

export const usePollTimer = (poll: Poll | null, serverTime: number) => {
  const [remaining, setRemaining] = useState<number>(0);
  const drift = useMemo(() => serverTime - Date.now(), [serverTime]);

  useEffect(() => {
    if (!poll) {
      setRemaining(0);
      return;
    }
    setRemaining(computeRemaining(poll, drift));
    const id = setInterval(() => {
      setRemaining(computeRemaining(poll, drift));
    }, 1000);
    return () => clearInterval(id);
  }, [poll, drift]);

  return remaining;
};