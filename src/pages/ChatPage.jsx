import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../components/context/AuthContext";
import { useTheme } from "../components/context/ThemeContext";
import api from "../services/reqInterceptor";
import { uploadChatMediaToCloudinary } from "../utils/uploadToCloudinary";
import { io } from "socket.io-client";
import { useAlert } from "../components/ui/AlertProvider";
import {
  FiSearch,
  FiMoreVertical,
  FiPaperclip,
  FiMic,
  FiSend,
  FiSmile,
  FiPhone,
  FiVideo,
  FiMessageSquare,
  FiX,
  FiCheck,
  FiFile,
  FiArrowUp,
  FiTrash2,
  FiDownload,
  FiCheckCircle,
  FiPlay,
  FiPause,
} from "react-icons/fi";

/* ─── constants ───────────────────────────────────────────── */
let _apiBaseUrl = import.meta.env.VITE_AZURE_BASE_URL || import.meta.env.VITE_API_BASE_URL;
if (!_apiBaseUrl || _apiBaseUrl === "undefined") {
  console.warn("API Base URL was missing or 'undefined' in environment variables.");
  _apiBaseUrl = "";
}
const BASE_URL = _apiBaseUrl ? _apiBaseUrl.replace("/api", "").replace(/\/$/, "") : "";
const MSG_LIMIT = 30;

const VOICE_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

const VOICE_BLOB_TYPE = "audio/webm;codecs=opus";

const resolveRecorderMimeType = () => {
  if (typeof MediaRecorder === "undefined") return VOICE_BLOB_TYPE;
  if (MediaRecorder.isTypeSupported(VOICE_BLOB_TYPE)) return VOICE_BLOB_TYPE;
  for (const candidate of VOICE_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return VOICE_BLOB_TYPE;
};

/* ─── helpers ─────────────────────────────────────────────── */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diff = (now - d) / 86400000;
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
};

const formatMsgTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatLastSeen = (room) => {
  const iso = room?.updatedAt || room?.lastMessage?.createdAt;
  if (!iso) return "Last seen recently";

  const d = new Date(iso);
  const now = new Date();
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (d.toDateString() === now.toDateString()) {
    return `Last seen today at ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Last seen yesterday at ${timeStr}`;
  }

  const dateStr = d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
  return `Last seen ${dateStr} at ${timeStr}`;
};

const getRoomDisplayName = (room, uid) => {
  if (room.type === "group") return room.name || "Group Chat";
  return room.participants?.find((p) => p._id !== uid)?.name || "Unknown";
};

const getRoomOtherUser = (room, uid) =>
  room.participants?.find((p) => p._id !== uid) || null;

const getRoomAvatar = (room, uid) =>
  getRoomOtherUser(room, uid)?.avatar?.url || null;

const getMediaUrl = (raw) => {
  if (!raw) return "";

  let url = raw;
  if (typeof raw === "object" && raw !== null) {
    url = raw.secure_url || raw.url || raw.href || "";
  }

  url = String(url).trim();
  if (!url) return "";

  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

const inferMediaType = (mediaItem) => {
  const url = getMediaUrl(mediaItem?.url).toLowerCase();
  // Cloudinary audio files (uploaded from mobile as resource_type:video) contain /video/upload/
  // but are NOT actual video — they are audio/voice notes
  if (/\/video\/upload\//i.test(url)) return "audio";
  // Extension-based detection (web uploads)
  if (/\.(webm|mp3|wav|ogg|m4a|aac|amr|opus)(\?|$)/i.test(url)) return "audio";
  if (mediaItem?.type === "audio") return "audio";
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return "image";
  if (mediaItem?.type === "image") return "image";
  return "document";
};

const CustomAudioPlayer = ({ src, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const sliderRef = useRef(null);

  const updateSliderPct = (current, total) => {
    if (sliderRef.current && total > 0) {
      const pct = (current / total) * 100;
      sliderRef.current.style.setProperty("--pct", `${pct}%`);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    setProgress(current);
    updateSliderPct(current, audioRef.current.duration);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const value = Number(e.target.value);
    audioRef.current.currentTime = value;
    setProgress(value);
    updateSliderPct(value, duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    updateSliderPct(0, duration);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center gap-3 p-1 rounded-full max-w-[260px] min-w-[200px] w-fit ${isOwn ? "bg-white/10" : "bg-theme-body border border-theme-border"}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-none transition-transform hover:scale-105 active:scale-95 ${isOwn ? 'bg-white text-brand-primary' : 'bg-brand-primary text-white'}`} onClick={togglePlay} type="button">
        {isPlaying ? <FiPause size={20} style={{ marginLeft: 0 }} /> : <FiPlay size={20} style={{ marginLeft: '3px' }} />}
      </button>
      <div className="flex items-center gap-2 flex-1">
        <input
          ref={sliderRef}
          type="range"
          className="w-full h-1.5 appearance-none bg-black/20 rounded-full cursor-pointer relative [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
        />
        <span className="text-[11px] font-mono opacity-80 min-w-[36px]">{formatTime(progress)}</span>
      </div>
    </div>
  );
};

/* ─── sub-components ──────────────────────────────────────── */
const Avatar = ({ name, url, size = 40, online = false }) => (
  <div className="relative rounded-full shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
    {url ? (
      <img src={url} alt={name} className="w-full h-full object-cover rounded-full shadow-sm" />
    ) : (
      <div className="w-full h-full rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold text-sm">{getInitials(name)}</div>
    )}
    {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-emerald border-2 border-theme-card rounded-full" />}
  </div>
);

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-theme-body">
    <div className="w-24 h-24 mb-6 text-brand-primary/50 flex items-center justify-center bg-brand-primary/5 rounded-full">
      <FiMessageSquare size={64} />
    </div>
    <h2 className="text-2xl font-bold text-theme-text mb-2">DarziFlow Messenger</h2>
    <p className="text-theme-text-secondary max-w-sm mb-8 leading-relaxed">Select a conversation from the list or search for a user to start a new chat.</p>
    <div className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium">End-to-end secure messaging</div>
  </div>
);

const MessageTicks = ({ isDelivered, isRead }) => {
  if (isRead) {
    return (
      <span className="flex items-center text-blue-200">
        <FiCheck size={12} className="-mr-1.5" />
        <FiCheck size={12} />
      </span>
    );
  }
  if (isDelivered) {
    return (
      <span className="flex items-center">
        <FiCheck size={12} className="-mr-1.5" />
        <FiCheck size={12} />
      </span>
    );
  }
  return (
    <span className="flex items-center">
      <FiCheck size={12} />
    </span>
  );
};

/* ════════════════════════════════════════════════════════════
   Main ChatPage
   ════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const { showAlert } = useAlert();

  /* ── refs ──────────────────────────────────────────────── */
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const viewportRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const selectedRoomRef = useRef(null);
  const sendMessageRef = useRef(null);

  /* ── core state ────────────────────────────────────────── */
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sending, setSending] = useState(false);

  /* ── Phase 3: file attachment state ────────────────────── */
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  /* ── Phase 3: voice recorder state ─────────────────────── */
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recorderMimeTypeRef = useRef(VOICE_BLOB_TYPE);
  const recTimerRef = useRef(null);
  const stopRecordingRef = useRef(() => { });

  /* ── pagination state ──────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);

  /* ── typing state (per-room scoped) ────────────────────── */
  const [typingState, setTypingState] = useState(null);

  /* ── online presence state ─────────────────────────────── */
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  /* ── image lightbox preview ────────────────────────────── */
  const [previewMedia, setPreviewMedia] = useState(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
    });
    socketRef.current = socket;

    const onConnect = () => console.log("✅ Chat socket connected");
    const onConnectError = (err) => console.error("❌ Socket error:", err.message);

    const onReceiveMessage = (msg) => {
      const currentRoomId = selectedRoomRef.current?._id;
      const msgRoomId = msg.chatRoomId?._id || msg.chatRoomId || msg.chatRoom?._id || msg.chatRoom;

      if (msgRoomId && msgRoomId === currentRoomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      setRooms((prev) =>
        prev.map((r) =>
          r._id === msgRoomId
            ? {
              ...r,
              lastMessage: {
                text: msg.text,
                sender: msg.sender,
                createdAt: msg.createdAt,
              },
            }
            : r
        )
      );
    };

    const onUserTyping = (payload) => {
      if (!payload) return;
      const { userName, chatRoomId } = payload;
      const activeRoomId = selectedRoomRef.current?._id;
      if (chatRoomId && chatRoomId !== activeRoomId) return;

      setTypingState({ roomId: chatRoomId || activeRoomId, userName });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingState(null), 2500);
    };

    const onUserOnline = ({ userId }) =>
      setOnlineUsers((prev) => new Set([...prev, userId]));
    const onUserOffline = ({ userId }) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    const onMessageError = (data) =>
      console.error("Socket msg error:", data.error);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("receive_message", onReceiveMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);
    socket.on("message_error", onMessageError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.off("message_error", onMessageError);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await api.get("/chat/rooms");
        setRooms(res.data.rooms || []);
      } catch (e) {
        console.error("Failed to fetch rooms:", e);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentPage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentPage]);

  const clearAttachment = useCallback(() => {
    setAttachedFile((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const sendMessage = useCallback(async (attachmentOverride = null) => {
    const pendingAttachment =
      attachmentOverride?.file instanceof Blob
        ? attachmentOverride
        : attachedFile;
    const hasText = inputText.trim();
    if (!hasText && !pendingAttachment) return;
    if (!selectedRoomRef.current || !socketRef.current) return;

    setSending(true);

    let mediaPayload = [];
    if (pendingAttachment) {
      try {
        const { url } = await uploadChatMediaToCloudinary(
          pendingAttachment.file,
          selectedRoomRef.current._id
        );
        let finalUrl = url;
        if (pendingAttachment.type === "audio" && finalUrl.endsWith(".webm")) {
          finalUrl = finalUrl.replace(/\.webm$/, ".mp3");
        }
        
        let finalType = pendingAttachment.type;
        // Map audio to document for backend compatibility since Desktop backend only allows ['image', 'video', 'document']
        if (finalType === "audio") {
          finalType = "document";
        }

        mediaPayload = [{
          url: finalUrl,
          type: finalType,
          name: pendingAttachment.name,
        }];
      } catch (err) {
        console.error("Failed to upload media:", err);
        setSending(false);
        return;
      }
    }

    socketRef.current.emit("send_message", {
      chatRoomId: selectedRoomRef.current._id,
      senderId: authUser?._id,
      text: hasText || "",
      media: mediaPayload,
    });

    setInputText("");
    if (!attachmentOverride) {
      clearAttachment();
    } else if (pendingAttachment.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setSending(false);
    inputRef.current?.focus();
  }, [inputText, attachedFile, authUser, clearAttachment]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const openRoom = useCallback(
    async (room) => {
      if (selectedRoomRef.current?._id === room._id) return;

      if (selectedRoomRef.current) {
        socketRef.current?.emit("leave_room", {
          roomId: selectedRoomRef.current._id,
        });
      }

      setSelectedRoom(room);
      setMessages([]);
      setTypingState(null);
      setCurrentPage(1);
      setHasMorePages(false);
      setIsSearching(false);
      setSearchQuery("");
      setSearchResults([]);
      clearAttachment();
      stopRecordingRef.current(true);

      socketRef.current?.emit("join_room", { roomId: room._id });

      try {
        setLoadingMessages(true);
        const res = await api.get(
          `/chat/rooms/${room._id}/messages?page=1&limit=${MSG_LIMIT}`
        );
        const fetched = res.data.messages || [];
        setMessages(fetched);
        setHasMorePages(fetched.length === MSG_LIMIT);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setLoadingMessages(false);
      }

      setTimeout(() => inputRef.current?.focus(), 120);
    },
    [clearAttachment]
  );

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMorePages || !selectedRoomRef.current) return;

    const nextPage = currentPage + 1;
    const viewport = viewportRef.current;
    const prevScrollHeight = viewport?.scrollHeight || 0;

    try {
      setLoadingOlder(true);
      const res = await api.get(
        `/chat/rooms/${selectedRoomRef.current._id}/messages?page=${nextPage}&limit=${MSG_LIMIT}`
      );
      const older = res.data.messages || [];

      setMessages((prev) => [...older, ...prev]);
      setCurrentPage(nextPage);
      setHasMorePages(older.length === MSG_LIMIT);

      requestAnimationFrame(() => {
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight - prevScrollHeight;
        }
      });
    } catch (e) {
      console.error("Failed to load older messages:", e);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMorePages, currentPage]);

  const handleViewportScroll = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    if (vp.scrollTop < 80) {
      loadOlderMessages();
    }
  }, [loadOlderMessages]);

  const searchTimerRef = useRef(null);
  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(
          `/chat/users/search?query=${encodeURIComponent(q)}`
        );
        setSearchResults(res.data.users || []);
      } catch (e) {
        console.error("User search failed:", e);
      }
    }, 350);
  }, []);

  const startDirectChat = useCallback(
    async (targetUserId) => {
      try {
        const res = await api.post("/chat/rooms/direct", { targetUserId });
        const room = res.data.room;
        setRooms((prev) =>
          prev.some((r) => r._id === room._id) ? prev : [room, ...prev]
        );
        openRoom(room);
      } catch (e) {
        console.error("Failed to create/fetch direct chat:", e);
      }
    },
    [openRoom]
  );

  const emitTypingRef = useRef(null);
  const handleTyping = useCallback(
    (e) => {
      setInputText(e.target.value);
      if (!selectedRoomRef.current || !socketRef.current) return;
      clearTimeout(emitTypingRef.current);
      emitTypingRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", {
          chatRoomId: selectedRoomRef.current._id,
          userName: authUser?.name || "User",
        });
      }, 300);
    },
    [authUser]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    const type = isImage ? "image" : isAudio ? "audio" : "document";
    const previewUrl = (isImage || isAudio)
      ? URL.createObjectURL(file)
      : null;
    setAttachedFile({ file, previewUrl, type, name: file.name, size: file.size });
  }, []);

  const formatDuration = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const preferredMime = resolveRecorderMimeType();
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      recorderMimeTypeRef.current = recorder.mimeType || preferredMime || VOICE_BLOB_TYPE;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecDuration(0);

      recTimerRef.current = setInterval(() => {
        setRecDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      releaseMediaStream();
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [releaseMediaStream]);

  const stopRecording = useCallback((discard = false) => {
    clearInterval(recTimerRef.current);

    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      releaseMediaStream();
      setIsRecording(false);
      setRecDuration(0);
      audioChunksRef.current = [];
      return;
    }

    if (recorder.state === "inactive") {
      releaseMediaStream();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setRecDuration(0);
      if (!discard) {
        const mimeType = recorderMimeTypeRef.current || VOICE_BLOB_TYPE;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          const file = new File([audioBlob], `vn-${Date.now()}.webm`, { type: mimeType });
          const previewUrl = URL.createObjectURL(audioBlob);
          const voiceAttachment = {
            file,
            previewUrl,
            type: "audio",
            name: file.name,
            size: file.size,
          };
          setAttachedFile(voiceAttachment);
          Promise.resolve(sendMessageRef.current?.(voiceAttachment)).finally(() => {
            setAttachedFile(null);
            URL.revokeObjectURL(previewUrl);
          });
        }
      }
      audioChunksRef.current = [];
      return;
    }

    recorder.onstop = () => {
      releaseMediaStream();
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setRecDuration(0);

      if (discard) {
        audioChunksRef.current = [];
        return;
      }

      const mimeType = recorderMimeTypeRef.current || VOICE_BLOB_TYPE;
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size > 0) {
        const file = new File(
          [audioBlob],
          `vn-${Date.now()}.webm`,
          { type: mimeType }
        );
        const previewUrl = URL.createObjectURL(audioBlob);
        const voiceAttachment = {
          file,
          previewUrl,
          type: "audio",
          name: file.name,
          size: file.size,
        };

        setAttachedFile(voiceAttachment);
        Promise.resolve(sendMessageRef.current?.(voiceAttachment)).finally(() => {
          setAttachedFile(null);
          URL.revokeObjectURL(previewUrl);
        });
      } else {
        console.error("Voice note rejected: empty blob", {
          chunks: audioChunksRef.current.length,
        });
      }

      audioChunksRef.current = [];
    };

    recorder.stop();
  }, [releaseMediaStream]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      clearInterval(recTimerRef.current);
      stopRecordingRef.current(true);
    };
  }, []);

  const filteredRooms = rooms.filter((r) =>
    !searchQuery ||
    getRoomDisplayName(r, authUser?._id)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const activeTypingUser =
    typingState?.roomId && typingState.roomId === selectedRoom?._id
      ? typingState.userName
      : null;

  const otherUser = selectedRoom ? getRoomOtherUser(selectedRoom, authUser?._id) : null;
  const isOtherOnline = otherUser ? onlineUsers.has(otherUser._id) : false;

  // Format role: DEPARTMENT_HEAD -> Department Head
  const formatRole = (role) => {
    if (!role) return "";
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const roleLabel = selectedRoom?.type === "group"
    ? `${selectedRoom.participants?.length || 0} members`
    : formatRole(otherUser?.role) || "";

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-theme-body">

      <aside className={`absolute md:relative w-full md:w-[340px] shrink-0 h-full bg-theme-card border-r border-theme-border flex flex-col z-20 transition-transform duration-300 ${selectedRoom ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>

        <div className="flex items-center justify-between p-4 border-b border-theme-border-light shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={authUser?.name || "User"} url={authUser?.avatar?.url} size={42} />
            <span className="font-semibold text-theme-text">{authUser?.name || "User"}</span>
          </div>
          <div className="flex gap-1">
            <button
              className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors"
              title="New Chat"
              onClick={() => setIsSearching((p) => !p)}
            >
              <FiMessageSquare size={18} />
            </button>
            <button className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors" title="Menu">
              <FiMoreVertical size={18} />
            </button>
          </div>
        </div>

        <div className="m-4 relative shrink-0">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={isSearching ? "Search users…" : "Search or new chat"}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-slate-900/50 text-white rounded-lg focus:outline-none placeholder-slate-500"
              style={{ paddingLeft: '3rem' }}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="px-2 shrink-0">
            <p className="px-2 text-xs font-semibold text-theme-text-muted mb-2 tracking-wider">USERS</p>
            {searchResults.map((u) => (
              <button
                key={u._id}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all border-none bg-transparent hover:bg-theme-card-hover cursor-pointer text-left"
                onClick={() => startDirectChat(u._id)}
              >
                <Avatar name={u.name} url={u.avatar?.url} size={46} />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <span className="block font-semibold text-theme-text truncate mb-1">{u.name}</span>
                  <span className="block text-sm text-theme-text-secondary truncate">{u.role}</span>
                </div>
              </button>
            ))}
            <div className="h-px bg-theme-border-light my-2 mx-2" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
          {loadingRooms ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-theme-border" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-24 h-3 rounded bg-theme-border" />
                    <div className="w-3/4 h-3 rounded bg-theme-border-light" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <p className="text-center p-8 text-theme-text-muted text-sm leading-relaxed">
              No conversations yet.<br />Search for a user to start chatting.
            </p>
          ) : (
            filteredRooms.map((room) => {
              const name = getRoomDisplayName(room, authUser?._id);
              const avatar = getRoomAvatar(room, authUser?._id);
              const last = room.lastMessage;
              const isActive = selectedRoom?._id === room._id;
              const otherId = getRoomOtherUser(room, authUser?._id)?._id;
              const online = otherId ? onlineUsers.has(otherId) : false;

              return (
                <button
                  key={room._id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border-none cursor-pointer text-left ${isActive ? "bg-brand-primary/10" : "bg-transparent hover:bg-theme-card-hover"}`}
                  onClick={() => openRoom(room)}
                >
                  <Avatar name={name} url={avatar} size={46} online={online} />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-theme-text truncate">{name}</span>
                      <span className="text-xs text-theme-text-muted shrink-0 ml-2">{formatTime(last?.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-theme-text-secondary truncate">
                        {last ? (last.text || "📎 Attachment") : "No messages yet"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-theme-body relative min-w-0">
        {!selectedRoom ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-theme-card border-b border-theme-border-light shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 text-theme-text-secondary hover:text-theme-text" onClick={() => setSelectedRoom(null)}>
                  <FiArrowUp size={18} className="-rotate-90" />
                </button>
                <Avatar
                  name={getRoomDisplayName(selectedRoom, authUser?._id)}
                  url={getRoomAvatar(selectedRoom, authUser?._id)}
                  size={40}
                  online={isOtherOnline}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-theme-text">
                    {getRoomDisplayName(selectedRoom, authUser?._id)}
                  </span>
                  {activeTypingUser ? (
                    <span className="text-xs flex items-center text-brand-primary font-medium gap-1.5">
                      <span className="flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce" />
                        <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce delay-75" />
                        <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce delay-150" />
                      </span>
                      {activeTypingUser} is typing…
                    </span>
                  ) : (
                    <span className="text-xs text-theme-text-secondary flex items-center">
                      {roleLabel}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors hidden sm:block"
                  title="Voice Call"
                  onClick={() => showAlert({ title: "Feature in Development", message: "Voice calling features will be implemented in Cohort 2 / Next Phase.", type: "info" })}
                >
                  <FiPhone size={18} />
                </button>
                <button
                  className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors hidden sm:block"
                  title="Video Call"
                  onClick={() => showAlert({ title: "Feature in Development", message: "Video calling features will be implemented in Cohort 2 / Next Phase.", type: "info" })}
                >
                  <FiVideo size={18} />
                </button>
                <button className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors" title="More">
                  <FiMoreVertical size={18} />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full"
              ref={viewportRef}
              onScroll={handleViewportScroll}
            >
              {loadingOlder && (
                <div className="flex justify-center py-4 gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-primary/50 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-primary/50 animate-bounce delay-75" />
                  <span className="w-2 h-2 rounded-full bg-brand-primary/50 animate-bounce delay-150" />
                </div>
              )}

              {hasMorePages && !loadingOlder && (
                <button
                  className="mx-auto my-2 px-4 py-1.5 bg-theme-card text-brand-primary text-xs font-medium rounded-full shadow-sm hover:shadow flex items-center gap-2 border border-theme-border transition-all"
                  onClick={loadOlderMessages}
                >
                  <FiArrowUp size={13} /> Load older messages
                </button>
              )}

              {loadingMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center text-theme-text-muted gap-3">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-theme-text-muted gap-3">
                  <div className="text-4xl opacity-50">💬</div>
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === authUser?._id || msg.sender === authUser?._id;
                  const showAvatar =
                    !isOwn &&
                    (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex items-end gap-2 ${isOwn ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      {!isOwn && (
                        <div className="w-7 shrink-0 flex flex-col justify-end pb-1 hidden sm:flex">
                          {showAvatar && (
                            <Avatar
                              name={msg.sender?.name}
                              url={msg.sender?.avatar?.url}
                              size={28}
                            />
                          )}
                        </div>
                      )}
                      <div className={`relative flex flex-col p-3 shadow-sm w-fit max-w-[70%] sm:max-w-md md:max-w-lg rounded-2xl overflow-hidden ${isOwn ? "bg-brand-primary text-white" : "bg-theme-card text-theme-text border border-theme-border-light"}`}>
                        {!isOwn && showAvatar && (
                          <span className="text-xs font-semibold mb-1 text-brand-primary">{msg.sender?.name}</span>
                        )}
                        {msg.replyTo && (
                          <div className={`text-xs p-2 mb-2 rounded border-l-2 truncate ${isOwn ? 'bg-black/10 border-white/50' : 'bg-theme-body border-brand-primary text-theme-text-secondary'}`}>
                            <span>{msg.replyTo.text || "Attachment"}</span>
                          </div>
                        )}

                        {msg.media?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {msg.media.map((m, mi) => {
                              const safeUrl = getMediaUrl(m.url);
                              const mediaType = inferMediaType(m);
                              if (!safeUrl) return null;
                              if (mediaType === "image") {
                                return (
                                  <img
                                    key={mi}
                                    src={safeUrl}
                                    alt="attachment"
                                    className="max-w-[240px] h-auto object-cover rounded-lg cursor-zoom-in hover:opacity-95 transition-opacity border border-black/10"
                                    onClick={() =>
                                      setPreviewMedia({ url: safeUrl, type: "image" })
                                    }
                                  />
                                );
                              }
                              if (mediaType === "audio") {
                                return (
                                  <CustomAudioPlayer
                                    key={mi}
                                    src={safeUrl}
                                    isOwn={isOwn}
                                  />
                                );
                              }
                              return (
                                <a
                                  key={mi}
                                  href={safeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors max-w-[240px] no-underline ${isOwn ? 'bg-black/10 hover:bg-black/20 text-white' : 'bg-theme-body hover:bg-theme-border-light text-theme-text border border-theme-border'}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FiDownload size={14} />
                                  <span className="text-sm font-medium truncate">
                                    {m.name || "Document"}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {msg.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words m-0">{msg.text}</p>}
                        <span className="flex items-center justify-end gap-1 text-[10px] opacity-70 mt-1 uppercase font-medium">
                          {formatMsgTime(msg.createdAt)}
                          {isOwn && (
                            <MessageTicks
                              isDelivered={
                                otherUser ? onlineUsers.has(otherUser._id) : false
                              }
                              isRead={Boolean(msg.read)}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {attachedFile && !isRecording && (
              <div className="p-3 bg-theme-body border-t border-theme-border flex items-center gap-3 relative shrink-0">
                {attachedFile.type === "image" && attachedFile.previewUrl && (
                  <img
                    src={attachedFile.previewUrl}
                    alt="preview"
                    className="w-12 h-12 rounded object-cover border border-theme-border-light"
                  />
                )}
                {attachedFile.type === "audio" && attachedFile.previewUrl && (
                  <div className="flex items-center gap-2 p-2 bg-theme-card rounded-lg text-brand-primary border border-theme-border">
                    <FiMic size={16} />
                    <audio controls src={attachedFile.previewUrl} className="h-8 w-48 outline-none" />
                  </div>
                )}
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-medium text-theme-text truncate">{attachedFile.name}</span>
                  <span className="text-xs text-theme-text-muted">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button className="p-1.5 bg-theme-card border border-theme-border text-theme-text-secondary rounded-full hover:bg-theme-card-hover transition-colors" onClick={clearAttachment} title="Remove">
                  <FiX size={16} />
                </button>
              </div>
            )}

            {isRecording && (
              <div className="p-3 border-t border-theme-border bg-theme-card flex items-center shrink-0">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-accent-red/10 border border-accent-red/20 rounded-full">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-red animate-pulse" />
                  <span className="font-mono text-accent-red font-semibold tracking-wider">{formatDuration(recDuration)}</span>
                  <span className="text-accent-red text-sm font-medium flex-1">Recording…</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/50 text-accent-red hover:bg-accent-red hover:text-white transition-all"
                      title="Discard recording"
                      onClick={() => stopRecording(true)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-accent-emerald text-white hover:scale-105 transition-all shadow-sm"
                      title="Send voice note"
                      onClick={() => stopRecording(false)}
                      disabled={sending}
                    >
                      <FiCheckCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {!isRecording && (
              <div className="p-3 bg-theme-card border-t border-theme-border flex items-end gap-2 shrink-0 z-10">
                <button className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors hidden sm:block" title="Emoji"><FiSmile size={20} /></button>
                <button
                  className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors"
                  title="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip size={20} />
                </button>
                <div className="flex-1 bg-theme-body rounded-2xl border border-theme-border focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all p-1 flex items-center min-h-[44px]">
                  <textarea
                    ref={inputRef}
                    className="w-full bg-transparent border-none text-[15px] text-theme-text px-3 py-2 resize-none max-h-32 overflow-y-auto outline-none placeholder:text-theme-text-muted"
                    placeholder="Type a message…"
                    value={inputText}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                </div>
                {(inputText.trim() || attachedFile) ? (
                  <button
                    className="w-11 h-11 bg-brand-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => sendMessage()}
                    disabled={sending}
                    title="Send"
                  >
                    <FiSend size={18} />
                  </button>
                ) : (
                  <button
                    className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-card-hover rounded-full transition-colors"
                    title="Record voice note"
                    onClick={startRecording}
                    disabled={sending}
                  >
                    <FiMic size={20} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {previewMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewMedia(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setPreviewMedia(null)}
            aria-label="Close preview"
          >
            <FiX size={24} />
          </button>
          <img
            src={previewMedia.url}
            alt="Attachment preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
