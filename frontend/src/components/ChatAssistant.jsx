import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "../services/api";

function ChatAssistant({ financialData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "I am your FinPilot AI assistant. Ask about your budget, goal planning, SIPs, tax-saving ideas, or spending mix.",
    },
  ]);
  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = draft.trim();
    if (!trimmedMessage || loading) {
      return;
    }

    const history = messages.slice(-6).map((message) => ({ role: message.role, content: message.content }));
    const nextMessages = [...messages, { role: "user", content: trimmedMessage }];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: trimmedMessage,
        history,
        financial_data: financialData,
      });
      setMessages((current) => [...current, { role: "assistant", content: response.reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not complete that message just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-shell">
      {isOpen ? (
        <section className="chat-panel fade-up">
          <div className="chat-header">
            <div>
              <span className="eyebrow">AI assistant</span>
              <h3>Ask FinPilot AI</h3>
            </div>
            <button className="chat-icon-button" type="button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <article className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === "assistant" ? "FinPilot AI" : "You"}</span>
                <p>{message.content}</p>
              </article>
            ))}
            {loading ? (
              <article className="chat-message assistant typing">
                <span>FinPilot AI</span>
                <p>Thinking through your financial question...</p>
              </article>
            ) : null}
            <div ref={scrollAnchorRef} />
          </div>

          <form className="chat-composer" onSubmit={handleSubmit}>
            <textarea
              className="chat-textarea"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about savings, goals, tax, debt, or spending..."
              rows="3"
            />
            <button className="primary-button chat-send" type="submit" disabled={loading || !draft.trim()}>
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button className="chat-fab" type="button" onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? "Hide assistant" : "Ask FinPilot AI"}
      </button>
    </div>
  );
}

export default ChatAssistant;
