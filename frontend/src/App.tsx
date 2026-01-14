import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { usePollState } from "./hooks/usePollState";
import { usePollTimer } from "./hooks/usePollTimer";
import { useSession } from "./hooks/useSession";
import { Landing } from "./pages/Landing";
import { StudentView } from "./pages/StudentView";
import { TeacherView } from "./pages/TeacherView";
import { KickedView } from "./pages/KickedView";
import { Chat } from "./components/Chat";

const App = () => {
  const location = useLocation();
  const { sessionId, name, setName } = useSession();
  const pollState = usePollState(sessionId, name);
  const remaining = usePollTimer(pollState.activePoll, pollState.serverTime);

  useEffect(() => {
    if (remaining === 0 && pollState.activePoll) {
      pollState.fetchHistory();
    }
  }, [remaining]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/student"
          element={
            <StudentView
              pollState={pollState}
              sessionId={sessionId}
              name={name}
              setName={setName}
              remaining={remaining}
            />
          }
        />
        <Route
          path="/teacher"
          element={<TeacherView pollState={pollState} remaining={remaining} />}
        />
        <Route path="/kicked" element={<KickedView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {(location.pathname !== '/' && (name || location.pathname === '/teacher')) && (
        <Chat 
           name={name || 'Teacher'} 
           role={location.pathname === '/teacher' ? 'teacher' : 'student'} 
        />
      )}
    </>
  );
};

export default App;
