import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";

export const Chat = ({ name, role }: { name: string; role: 'student' | 'teacher' }) => {
  const socket = useSocket();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onReceive = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      if (!open) setUnread((prev) => prev + 1);
      if (open && activeTab === 'chat') {
         setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    };
    const onParticipants = (list: any[]) => setParticipants(list);

    socket.on("chat:receive", onReceive);
    socket.on("participants:update", onParticipants);
    return () => {
      socket.off("chat:receive", onReceive);
      socket.off("participants:update", onParticipants);
    };
  }, [socket, open, activeTab]);

  useEffect(() => {
     if (open && activeTab === 'chat') {
        setUnread(0);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
     }
  }, [open, activeTab]);

  const send = () => {
    if (!input.trim()) return;
    socket.emit("chat:send", { name, text: input, role });
    setInput("");
  };

  const kick = (socketId: string) => {
    if (confirm("Remove this student from the session?")) {
      socket.emit("student:kick", socketId);
    }
  };

  if (!open) {
    return (
      <button
         className="button"
         onClick={() => setOpen(true)}
         style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 50,
            borderRadius: "50%",
            width: 56,
            height: 56,
            padding: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            background: "var(--accent)"
         }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        {unread > 0 && (
            <div style={{
                position: "absolute",
                top: -2,
                right: -2,
                background: "#ef4444",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                border: "2px solid white"
            }}>
                {unread}
            </div>
        )}
      </button>
    );
  }

  return (
    <div className="card" style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 340,
        height: 500,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        padding: 0,
        overflow: "hidden",
        border: "1px solid var(--border)"
    }}>
      <div className="header" style={{ padding: "12px 16px", background: "var(--accent)", color: "white", justifyContent: "space-between" }}>
        <div style={{fontWeight: 600}}>Classroom</div>
        <button onClick={() => setOpen(false)} style={{background: "none", border: "none", color: "white", cursor: "pointer", padding: 4}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div style={{ display: "flex", borderBottom: "1px solid #eee", background: "white" }}>
         <div 
            onClick={() => setActiveTab('chat')}
            style={{
                flex: 1, 
                textAlign: "center", 
                padding: "10px", 
                cursor: "pointer", 
                fontWeight: 500,
                fontSize: 14,
                color: activeTab === 'chat' ? "var(--accent)" : "#666",
                borderBottom: activeTab === 'chat' ? "2px solid var(--accent)" : "none"
            }}
         >
            Chat
         </div>
         <div 
            onClick={() => setActiveTab('participants')}
            style={{
                flex: 1, 
                textAlign: "center", 
                padding: "10px", 
                cursor: "pointer", 
                fontWeight: 500,
                fontSize: 14,
                color: activeTab === 'participants' ? "var(--accent)" : "#666",
                borderBottom: activeTab === 'participants' ? "2px solid var(--accent)" : "none"
            }}
         >
            People ({participants.length})
         </div>
      </div>

      {activeTab === 'chat' ? (
        <>
            <div style={{ flex: 1, padding: 12, overflowY: "auto", background: "#f9f9f9" }}>
                {messages.length === 0 && <div className="muted" style={{textAlign: "center", marginTop: 20}}>No messages yet.</div>}
                {messages.map((m, i) => (
                    <div key={i} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: m.name === name ? "flex-end" : "flex-start",
                        marginBottom: 8
                    }}>
                        <div style={{fontSize: 11, marginBottom: 2, color: "#666"}}>{m.name} {m.role === 'teacher' && '(Teacher)'}</div>
                        <div style={{
                            background: m.name === name ? "var(--accent)" : "white",
                            color: m.name === name ? "white" : "black",
                            padding: "6px 12px",
                            borderRadius: 12,
                            fontSize: 13,
                            maxWidth: "85%",
                            border: "1px solid #eee",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #eee", background: "white", display: "flex", gap: 8 }}>
                <input
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
                />
                <button className="button" style={{ padding: "0 12px", fontSize: 13 }} onClick={send}>
                    Send
                </button>
            </div>
        </>
      ) : (
        <div style={{ flex: 1, padding: 0, overflowY: "auto", background: "white" }}>
            {participants.map(p => (
                <div key={p.id} style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                        <div style={{width: 32, height: 32, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: 13, fontWeight: 600}}>
                            {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{fontSize: 14, fontWeight: 500}}>{p.name} {p.name === name && '(You)'}</div>
                    </div>
                    {role === 'teacher' && p.id !== socket.id && (
                        <button 
                            className="button secondary" 
                            style={{padding: "4px 8px", fontSize: 11, color: "#ef4444", borderColor: "#ef4444", height: "auto"}}
                            onClick={() => kick(p.id)}
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}
            {participants.length === 0 && <div className="muted" style={{padding: 20, textAlign: "center"}}>No active participants.</div>}
        </div>
      )}
    </div>
  );
};
