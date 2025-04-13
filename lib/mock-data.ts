export interface User {
  id: string
  name: string
  avatar: string
  isOnline?: boolean
}

export interface Reaction {
  emoji: string
  user: User
}

export interface Message {
  id: string
  content: string
  sender: User
  timestamp: Date
  reactions: Reaction[]
}

export interface Conversation {
  id: string
  name: string
  members: User[]
  messages: Message[]
  lastMessage: Message | null
  isGroup: boolean
}

// Mock users
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "You",
    avatar: "https://avatars.githubusercontent.com/u/66236295?v=4",
    isOnline: true,
  },
  {
    id: "user-2",
    name: "John Doe",
    avatar: "",
    isOnline: true,
  },
  {
    id: "user-3",
    name: "Jane Smith",
    avatar: "",
    isOnline: false,
  },
  {
    id: "user-4",
    name: "Alex Johnson",
    avatar: "",
    isOnline: true,
  },
  {
    id: "user-5",
    name: "Sarah Williams",
    avatar: "",
    isOnline: false,
  },
  {
    id: "user-6",
    name: "Michael Brown",
    avatar: "",
    isOnline: true,
  },
]

// Helper function to create a message
const createMessage = (
  id: string,
  content: string,
  sender: User,
  timestamp: Date,
  reactions: Reaction[] = [],
): Message => ({
  id,
  content,
  sender,
  timestamp,
  reactions,
})

// Sample image URLs for mock data
const sampleImages = [
  "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682687220198-88e9bdea9931?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1693520999631-6ac145c1dd15?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682687220067-dced9a881b56?w=800&auto=format&fit=crop",
]

// Create mock conversations
export const mockConversations: Conversation[] = [
  // Direct message with John
  {
    id: "conv-1",
    name: "John Doe",
    members: [mockUsers[0], mockUsers[1]],
    messages: [
      createMessage("msg-1", "Hey, how's it going?", mockUsers[1], new Date(Date.now() - 3600000 * 24), [
        { emoji: "👍", user: mockUsers[0] },
      ]),
      createMessage(
        "msg-2",
        "Pretty good! Working on that project we discussed.",
        mockUsers[0],
        new Date(Date.now() - 3600000 * 23),
      ),
      createMessage("msg-3", "Great! Can you share your progress?", mockUsers[1], new Date(Date.now() - 3600000 * 22)),
      createMessage("msg-4", "Sure, I'll send you the files soon.", mockUsers[0], new Date(Date.now() - 3600000 * 21)),
      createMessage(
        "msg-5",
        `[Image: project-mockup.jpg]|${sampleImages[0]}`,
        mockUsers[0],
        new Date(Date.now() - 3600000 * 20),
        [{ emoji: "🔥", user: mockUsers[1] }],
      ),
      createMessage(
        "msg-6",
        "This looks amazing! Can you also send the documentation?",
        mockUsers[1],
        new Date(Date.now() - 3600000 * 19),
      ),
      createMessage("msg-7", "[File: project_documentation.pdf]", mockUsers[0], new Date(Date.now() - 3600000 * 18)),
    ],
    lastMessage: createMessage(
      "msg-7",
      "[File: project_documentation.pdf]",
      mockUsers[0],
      new Date(Date.now() - 3600000 * 18),
    ),
    isGroup: false,
  },

  // Group chat
  {
    id: "conv-2",
    name: "Project Team",
    members: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    messages: [
      createMessage("msg-8", "Team meeting tomorrow at 10 AM", mockUsers[2], new Date(Date.now() - 3600000 * 10), [
        { emoji: "👍", user: mockUsers[2] },
        { emoji: "👍", user: mockUsers[1] },
        { emoji: "👍", user: mockUsers[3] },
      ]),
      createMessage("msg-9", "I'll be there!", mockUsers[0], new Date(Date.now() - 3600000 * 9)),
      createMessage("msg-10", "Me too", mockUsers[1], new Date(Date.now() - 3600000 * 8)),
      createMessage(
        "msg-11",
        "Great, I'll prepare the presentation",
        mockUsers[2],
        new Date(Date.now() - 3600000 * 7),
        [
          { emoji: "🎉", user: mockUsers[0] },
          { emoji: "👏", user: mockUsers[3] },
        ],
      ),
      createMessage(
        "msg-12",
        `[Image: presentation-draft.png]|${sampleImages[1]}`,
        mockUsers[2],
        new Date(Date.now() - 3600000 * 6),
        [
          { emoji: "👀", user: mockUsers[0] },
          { emoji: "👍", user: mockUsers[1] },
        ],
      ),
      createMessage(
        "msg-13",
        "Here's the data analysis we discussed",
        mockUsers[3],
        new Date(Date.now() - 3600000 * 5),
      ),
      createMessage("msg-14", "[File: quarterly_analysis.xlsx]", mockUsers[3], new Date(Date.now() - 3600000 * 4)),
      createMessage(
        "msg-15",
        `[Image: chart-results.jpg]|${sampleImages[2]}`,
        mockUsers[3],
        new Date(Date.now() - 3600000 * 3),
      ),
    ],
    lastMessage: createMessage(
      "msg-15",
      `[Image: chart-results.jpg]|${sampleImages[2]}`,
      mockUsers[3],
      new Date(Date.now() - 3600000 * 3),
    ),
    isGroup: true,
  },

  // Direct message with Jane
  {
    id: "conv-3",
    name: "Jane Smith",
    members: [mockUsers[0], mockUsers[2]],
    messages: [
      createMessage("msg-16", "Did you review the document I sent?", mockUsers[2], new Date(Date.now() - 3600000 * 5)),
      createMessage(
        "msg-17",
        "Yes, it looks good! Just a few minor changes needed.",
        mockUsers[0],
        new Date(Date.now() - 3600000 * 4),
      ),
      createMessage(
        "msg-18",
        "Can you highlight what needs to be changed?",
        mockUsers[2],
        new Date(Date.now() - 3600000 * 3),
        [{ emoji: "👀", user: mockUsers[0] }],
      ),
      createMessage(
        "msg-19",
        `[Image: document-feedback.jpg]|${sampleImages[3]}`,
        mockUsers[0],
        new Date(Date.now() - 3600000 * 2),
      ),
      createMessage(
        "msg-20",
        "Thanks! I'll make these changes right away.",
        mockUsers[2],
        new Date(Date.now() - 3600000 * 1),
      ),
    ],
    lastMessage: createMessage(
      "msg-20",
      "Thanks! I'll make these changes right away.",
      mockUsers[2],
      new Date(Date.now() - 3600000 * 1),
    ),
    isGroup: false,
  },

  // Direct message with Alex
  {
    id: "conv-4",
    name: "Alex Johnson",
    members: [mockUsers[0], mockUsers[3]],
    messages: [
      createMessage("msg-21", "Are we still on for lunch tomorrow?", mockUsers[3], new Date(Date.now() - 3600000 * 2)),
      createMessage("msg-22", "Looking forward to it.", mockUsers[0], new Date(Date.now() - 3600000 * 1), [
        { emoji: "😊", user: mockUsers[3] },
      ]),
      createMessage("msg-23", "[File: restaurant_menu.pdf]", mockUsers[3], new Date(Date.now() - 3600000 * 0.5)),
    ],
    lastMessage: createMessage(
      "msg-23",
      "[File: restaurant_menu.pdf]",
      mockUsers[3],
      new Date(Date.now() - 3600000 * 0.5),
    ),
    isGroup: false,
  },
]
