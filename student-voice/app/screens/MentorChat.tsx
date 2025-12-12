import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/config/axiosInstance";
import { useRouter } from "expo-router";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi 👋 I'm your AI Mentor! How can I help you today?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // waiting for immediate reply
  const [connecting, setConnecting] = useState(false); // network-retry state
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const router = useRouter();

  // Auto-scroll when messages change
  useEffect(() => {
    const t = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages]);

  const appendMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  // If last message is system, replace it; otherwise append
  const appendOrReplaceSystem = (text: string, idSuffix = "") => {
    setMessages((prev) => {
      if (prev.length === 0)
        return [
          { id: Date.now().toString() + idSuffix, text, sender: "system" },
        ];
      const last = prev[prev.length - 1];
      if (last.sender === "system") {
        const copy = prev.slice();
        copy[copy.length - 1] = { ...last, text };
        return copy;
      } else {
        return [
          ...prev,
          { id: Date.now().toString() + idSuffix, text, sender: "system" },
        ];
      }
    });
  };

  /**
   * sendToApi: performs single API call attempt
   * returns the ai text on success, or throws the error
   */
  const sendToApi = async (prompt: string) => {
    const res = await axiosInstance.post("/api/mentorchart", { prompt });
    const aiText =
      res?.data?.aiResponse ??
      res?.data?.reply ??
      res?.data?.response ??
      (typeof res?.data === "string" ? res.data : undefined);
    return aiText ?? "Sorry — I couldn't get a reply.";
  };

  /**
   * sendMessage: handles user message, API call, retries on failure,
   * and UI states (loading / connecting).
   */
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || connecting) return;

    // append user message immediately
    const userMsg: Message = {
      id: Date.now().toString() + "-u",
      text: trimmed,
      sender: "user",
    };
    appendMessage(userMsg);
    setInput("");
    Keyboard.dismiss();

    setLoading(true);
    try {
      // Try first API call
      const aiText = await sendToApi(trimmed);

      // success -> append AI response
      appendMessage({
        id: Date.now().toString() + "-ai",
        text: aiText,
        sender: "ai",
      });
      setLoading(false);
      return;
    } catch (errFirst: any) {
      // First attempt failed -> begin connecting/retry flow
      console.warn(
        "Initial mentorchart call failed:",
        errFirst?.message ?? errFirst
      );

      // show single system message (or replace if already present)
      appendOrReplaceSystem("Connection lost — retrying...", "-sys-retry");

      setLoading(false);
      setConnecting(true);

      // Retry policy
      const maxRetries = 3;
      let success = false;
      let lastError: any = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // exponential backoff: 1000ms * 2^(attempt-1) with some jitter
        const base = 1000 * 2 ** (attempt - 1);
        const jitter = Math.floor(Math.random() * 300);
        const waitMs = base + jitter;
        console.log(`Retry #${attempt} in ${waitMs}ms`);

        await sleep(waitMs);

        // update single system message instead of appending many
        appendOrReplaceSystem(
          `Reconnecting... (attempt ${attempt}/${maxRetries})`,
          `-sys-attempt-${attempt}`
        );

        try {
          const aiText = await sendToApi(trimmed);
          appendMessage({
            id: Date.now().toString() + `-ai-${attempt}`,
            text: aiText,
            sender: "ai",
          });
          success = true;
          break;
        } catch (err: any) {
          console.warn(`Retry #${attempt} failed:`, err?.message ?? err);
          lastError = err;
          // continue to next attempt
        }
      }

      if (!success) {
        appendOrReplaceSystem(
          lastError?.response?.data?.message ??
            lastError?.message ??
            "Unable to connect. Please check your network and try again.",
          "-sys-failed"
        );
      }
    } finally {
      setConnecting(false);
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user"
          ? styles.userBubble
          : item.sender === "ai"
            ? styles.aiBubble
            : styles.systemBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user" ? styles.userText : styles.aiText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.headerTitle}>AI Mentor Chat</Text>
        </TouchableOpacity>
        <Ionicons name="sparkles-outline" size={24} color="#6366F1" />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Connecting banner (visible when retrying) */}
      {connecting ? (
        <View style={styles.connectingBanner}>
          <ActivityIndicator
            size="small"
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.connectingText}>Connecting…</Text>
        </View>
      ) : null}

      {/* Input bar fixed at bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!loading && !connecting}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              (loading || connecting) && { opacity: 0.6 },
            ]}
            disabled={loading || connecting}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  messageBubble: {
    maxWidth: "75%",
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: { backgroundColor: "#4F46E5", alignSelf: "flex-end" },
  aiBubble: { backgroundColor: "#E5E7EB", alignSelf: "flex-start" },
  systemBubble: {
    backgroundColor: "#FDE68A",
    alignSelf: "center",
    borderRadius: 12,
  },
  messageText: { fontSize: 15 },
  userText: { color: "#FFFFFF" },
  aiText: { color: "#111827" },

  connectingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 24,
    alignSelf: "center",
    marginBottom: 8,
  },
  connectingText: { color: "white", fontWeight: "600" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 30,
    marginBottom: Platform.OS === "ios" ? 10 : 6,
    marginTop: 5,
  },
  input: { flex: 1, fontSize: 15, color: "#111827", paddingHorizontal: 10 },
  sendButton: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 25,
    marginLeft: 8,
  },
});
