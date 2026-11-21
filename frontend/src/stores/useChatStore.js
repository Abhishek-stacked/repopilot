import { create } from 'zustand';
import { mockChatSessions } from '../data/mockData';

export const useChatStore = create((set, get) => ({
  sessions: mockChatSessions,
  activeSessionId: mockChatSessions[0].id,
  isGenerating: false,

  getActiveSession: () => {
    return get().sessions.find((s) => s.id === get().activeSessionId) || get().sessions[0];
  },

  setActiveSession: (sessionId) => {
    set({ activeSessionId: sessionId });
  },

  createNewSession: () => {
    const newSession = {
      id: `chat_${Date.now()}`,
      title: 'New Investigation',
      updatedAt: 'Just now',
      messages: []
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: newSession.id
    }));
  },

  sendMessage: (content) => {
    const activeId = get().activeSessionId;
    const userMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    set((state) => ({
      isGenerating: true,
      sessions: state.sessions.map((s) => {
        if (s.id === activeId) {
          const updatedMessages = [...s.messages, userMessage];
          return {
            ...s,
            title: s.messages.length === 0 ? content.slice(0, 35) + '...' : s.title,
            updatedAt: 'Just now',
            messages: updatedMessages
          };
        }
        return s;
      })
    }));

    // Realistic RAG assistant response with source code citation
    setTimeout(() => {
      const assistantMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: `Based on your repository codebase search, here is the answer regarding: **"${content}"**:

The relevant logic resides in \`src/indexing/chunker.ts\` and \`src/server.ts\`. The service initializes the listener and dispatches tasks to the background processing worker.

\`\`\`typescript
export async function initializeWorker(config: WorkerConfig) {
  const queue = new BullQueue('repo-indexing', config.redisUrl);
  queue.process(async (job) => {
    const { repoId, branch } = job.data;
    await indexRepository(repoId, branch);
  });
  return queue;
}
\`\`\`

All chunking operations preserve AST token boundaries so citations map back to line spans accurately.`,
        citations: [
          {
            file: 'src/indexing/chunker.ts',
            lines: '14-38',
            snippet: 'export async function initializeWorker(config: WorkerConfig) {...}'
          },
          {
            file: 'src/server.ts',
            lines: '52-68',
            snippet: 'await initializeWorker(serverConfig);'
          }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      set((state) => ({
        isGenerating: false,
        sessions: state.sessions.map((s) => 
          s.id === activeId 
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        )
      }));
    }, 1200);
  }
}));
