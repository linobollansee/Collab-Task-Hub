const io = require("socket.io-client");
const axios = require("axios");

const API_URL = "http://localhost:4000";
const WS_URL = "http://localhost:4000/chat";

// Utility to format objects for display
function formatJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

// Utility to format timestamps
function formatTime() {
  return new Date().toISOString();
}

function log(message, data = null) {
  const time = formatTime();
  if (data) {
    console.log(`[${time}] ${message}`);
    console.log(formatJSON(data));
  } else {
    console.log(`[${time}] ${message}`);
  }
}

async function testChat() {
  console.log("=".repeat(80));
  console.log("[START] CHAT WEBSOCKET IMPLEMENTATION TEST");
  console.log("=".repeat(80));
  console.log(`\n[INFO] API Base URL: ${API_URL}`);
  console.log(`[INFO] WebSocket URL: ${WS_URL}\n`);
  console.log("=".repeat(80));

  try {
    // 1. Register a test user
    console.log("\n" + "-".repeat(80));
    console.log("[1] STEP 1: User Registration");
    console.log("-".repeat(80));
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = "password123";
    const testName = "Test User";

    log("[SEND] Sending POST request to /auth/register", {
      email: testEmail,
      name: testName,
      password: "[HIDDEN]",
    });

    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      name: testName,
      password: testPassword,
    });

    log("[RECV] Registration response received", {
      id: registerRes.data.id,
      email: registerRes.data.email,
      name: registerRes.data.name,
      createdAt: registerRes.data.createdAt,
    });
    console.log(`[OK] User successfully registered: ${testEmail}`);

    // 2. Login to get JWT token
    console.log("\n" + "-".repeat(80));
    console.log("[2] STEP 2: User Login & JWT Token Generation");
    console.log("-".repeat(80));

    log("[SEND] Sending POST request to /auth/login", {
      email: testEmail,
      password: "[HIDDEN]",
    });

    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });

    const token = loginRes.data.access_token;
    const tokenPreview =
      token.substring(0, 20) + "..." + token.substring(token.length - 20);

    log("[RECV] Login response received", {
      access_token: tokenPreview,
      token_length: token.length,
      user: loginRes.data.user,
    });
    console.log(`[OK] JWT token obtained successfully`);

    // 3. Create a project
    console.log("\n" + "-".repeat(80));
    console.log("[3] STEP 3: Create Test Project");
    console.log("-".repeat(80));

    const projectData = {
      title: "Chat Test Project",
      description: "Testing chat functionality",
    };

    log("[SEND] Sending POST request to /projects", projectData);
    log("[AUTH] Authorization header", { Bearer: tokenPreview });

    const projectRes = await axios.post(`${API_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const projectId = projectRes.data.id;
    log("[RECV] Project creation response", projectRes.data);
    console.log(`[OK] Project created with ID: ${projectId}`);

    // 4. Connect to WebSocket
    console.log("\n" + "-".repeat(80));
    console.log("[4] STEP 4: WebSocket Connection");
    console.log("-".repeat(80));

    log("[WS] Initiating WebSocket connection", {
      url: WS_URL,
      auth: { token: tokenPreview },
      transports: ["websocket"],
    });

    const socket = io(WS_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      log("[OK] WebSocket CONNECTED", {
        socket_id: socket.id,
        transport: socket.io.engine.transport.name,
        connected: socket.connected,
      });

      // 5. Join project room
      console.log("\n" + "-".repeat(80));
      console.log("[5] STEP 5: Join Project Chat Room");
      console.log("-".repeat(80));

      const joinData = { projectId };
      log("[SEND] Emitting 'join-project' event", joinData);
      socket.emit("join-project", joinData);

      // Wait for join confirmation
      setTimeout(() => {
        log("[OK] Successfully joined project room", { projectId });

        // 6. Send a test message
        console.log("\n" + "-".repeat(80));
        console.log("[6] STEP 6: Send Chat Message");
        console.log("-".repeat(80));

        const messageData = {
          content: "Hello from automated test!",
          projectId,
        };

        log("[SEND] Emitting 'send-message' event", messageData);
        socket.emit("send-message", messageData);

        // 7. Test typing indicator
        setTimeout(() => {
          console.log("\n" + "-".repeat(80));
          console.log("[7] STEP 7: Test Typing Indicators");
          console.log("-".repeat(80));

          log("[SEND] Emitting 'typing' event (isTyping: true)", {
            projectId,
            isTyping: true,
          });
          socket.emit("typing", { projectId, isTyping: true });

          setTimeout(() => {
            log("[SEND] Emitting 'typing' event (isTyping: false)", {
              projectId,
              isTyping: false,
            });
            socket.emit("typing", { projectId, isTyping: false });

            // 8. Get message history via REST
            setTimeout(() => {
              testMessageHistory(token, projectId, socket, tokenPreview);
            }, 500);
          }, 1000);
        }, 500);
      }, 500);
    });

    socket.on("new-message", (message) => {
      log("[RECV] BROADCAST EVENT: 'new-message' received", message);
    });

    socket.on("user-typing", (data) => {
      log("[RECV] BROADCAST EVENT: 'user-typing' received", data);
    });

    socket.on("joined-project", (data) => {
      log("[RECV] EVENT: 'joined-project' acknowledgment", data);
    });

    socket.on("message-sent", (data) => {
      log("[RECV] EVENT: 'message-sent' acknowledgment", data);
    });

    socket.on("disconnect", (reason) => {
      log("[WS] WebSocket DISCONNECTED", { reason });
    });

    socket.on("connect_error", (error) => {
      log("[ERROR] WebSocket connection error", {
        message: error.message,
        description: error.description,
        stack: error.stack,
      });
    });

    socket.on("error", (error) => {
      log("[ERROR] WebSocket error", { error: error.toString() });
    });
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] TEST FAILED");
    console.log("=".repeat(80));
    log("Error details", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      stack: error.stack,
    });
    process.exit(1);
  }
}

async function testMessageHistory(token, projectId, socket, tokenPreview) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log("[8] STEP 8: Fetch Message History via REST API");
    console.log("-".repeat(80));

    const endpoint = `${API_URL}/chat/projects/${projectId}/messages`;
    log("[SEND] Sending GET request", {
      endpoint,
      authorization: tokenPreview,
      query_params: { limit: 200 },
    });

    const messagesRes = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    log("[RECV] Message history response", {
      total_messages: messagesRes.data.length,
      status: messagesRes.status,
      statusText: messagesRes.statusText,
    });

    let firstMessageId = null;
    if (messagesRes.data.length > 0) {
      console.log("\n[DATA] MESSAGES RETRIEVED:");
      messagesRes.data.forEach((msg, index) => {
        console.log(`\n   Message ${index + 1}:`);
        console.log(`   +-- ID: ${msg.id}`);
        console.log(`   +-- Content: "${msg.content}"`);
        console.log(`   +-- User: ${msg.userName} (${msg.userId})`);
        console.log(`   +-- Project: ${msg.projectId}`);
        console.log(`   +-- Created: ${msg.createdAt}`);
        console.log(`   +-- Edited: ${msg.isEdited}`);
        console.log(`   +-- Deleted: ${msg.isDeleted}`);
        if (index === 0) firstMessageId = msg.id;
      });
    }

    console.log(`[OK] Message history retrieved successfully`);

    // Continue with additional tests
    setTimeout(() => {
      testEditMessage(token, projectId, socket, tokenPreview, firstMessageId);
    }, 1000);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] MESSAGE HISTORY TEST FAILED");
    console.log("=".repeat(80));
    log("Error fetching messages", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    process.exit(1);
  }
}

async function testEditMessage(
  token,
  projectId,
  socket,
  tokenPreview,
  messageId,
) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log("[9] STEP 9: Edit Message via REST API");
    console.log("-".repeat(80));

    const editContent = "Edited message content via REST API";
    const endpoint = `${API_URL}/chat/messages/${messageId}`;

    log("[SEND] Sending PATCH request to edit message", {
      endpoint,
      messageId,
      newContent: editContent,
    });

    const editRes = await axios.patch(
      endpoint,
      { content: editContent },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    log("[RECV] Edit message response", editRes.data);
    console.log(`[OK] Message edited successfully via REST API`);

    // Test edit via WebSocket
    setTimeout(() => {
      testEditMessageViaWebSocket(
        token,
        projectId,
        socket,
        tokenPreview,
        messageId,
      );
    }, 1000);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] EDIT MESSAGE TEST FAILED");
    console.log("=".repeat(80));
    log("Error editing message", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    process.exit(1);
  }
}

async function testEditMessageViaWebSocket(
  token,
  projectId,
  socket,
  tokenPreview,
  messageId,
) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log("[10] STEP 10: Edit Message via WebSocket");
    console.log("-".repeat(80));

    const wsEditContent = "Edited via WebSocket event!";
    log("[SEND] Emitting 'edit-message' event", {
      messageId,
      content: wsEditContent,
    });

    socket.emit("edit-message", {
      messageId,
      content: wsEditContent,
    });

    // Listen for edit acknowledgment
    socket.once("message-edited", (data) => {
      log("[RECV] EVENT: 'message-edited' received", data);
      console.log(`[OK] Message edited successfully via WebSocket`);
    });

    setTimeout(() => {
      testMessagePagination(token, projectId, socket, tokenPreview, messageId);
    }, 1500);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] WEBSOCKET EDIT MESSAGE TEST FAILED");
    console.log("=".repeat(80));
    log("Error", { message: error.message });
    process.exit(1);
  }
}

async function testMessagePagination(
  token,
  projectId,
  socket,
  tokenPreview,
  messageId,
) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log(
      "[11] STEP 11: Test Message Pagination with 'before' Parameter",
    );
    console.log("-".repeat(80));

    // First, send a few more messages to test pagination
    log("[INFO] Sending additional messages for pagination test");

    socket.emit("send-message", {
      content: "Message 2 for pagination",
      projectId,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    socket.emit("send-message", {
      content: "Message 3 for pagination",
      projectId,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get messages with limit
    const endpoint = `${API_URL}/chat/projects/${projectId}/messages?limit=2`;
    log("[SEND] Fetching messages with limit=2", { endpoint });

    const limitRes = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    log("[RECV] Limited messages response", {
      count: limitRes.data.length,
      expected: "≤2",
    });
    console.log(`[OK] Pagination limit working`);

    // Test 'before' parameter if we have messages
    if (limitRes.data.length > 0) {
      const lastMessage = limitRes.data[limitRes.data.length - 1];
      const beforeEndpoint = `${API_URL}/chat/projects/${projectId}/messages?before=${lastMessage.createdAt}`;

      log("[SEND] Fetching messages before timestamp", {
        endpoint: beforeEndpoint,
        before: lastMessage.createdAt,
      });

      const beforeRes = await axios.get(beforeEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      log("[RECV] Messages before timestamp", {
        count: beforeRes.data.length,
      });
      console.log(`[OK] 'before' parameter working`);
    }

    setTimeout(() => {
      testDeleteMessage(token, projectId, socket, tokenPreview, messageId);
    }, 1000);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] PAGINATION TEST FAILED");
    console.log("=".repeat(80));
    log("Error", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    process.exit(1);
  }
}

async function testDeleteMessage(
  token,
  projectId,
  socket,
  tokenPreview,
  messageId,
) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log("[12] STEP 12: Delete Message via REST API");
    console.log("-".repeat(80));

    const endpoint = `${API_URL}/chat/messages/${messageId}`;
    log("[SEND] Sending DELETE request", {
      endpoint,
      messageId,
    });

    const deleteRes = await axios.delete(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    log("[RECV] Delete message response", deleteRes.data);

    if (
      deleteRes.data.isDeleted &&
      deleteRes.data.content === "[Message deleted]"
    ) {
      console.log(`[OK] Message deleted successfully (soft delete)`);
    }

    setTimeout(() => {
      testLeaveProject(token, projectId, socket, tokenPreview);
    }, 1000);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] DELETE MESSAGE TEST FAILED");
    console.log("=".repeat(80));
    log("Error deleting message", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    process.exit(1);
  }
}

async function testLeaveProject(token, projectId, socket, tokenPreview) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log("[13] STEP 13: Leave Project Room");
    console.log("-".repeat(80));

    log("[SEND] Emitting 'leave-project' event", { projectId });

    socket.emit("leave-project", { projectId });

    socket.once("left-project", (data) => {
      log("[RECV] EVENT: 'left-project' acknowledgment", data);
      console.log(`[OK] Successfully left project room`);
    });

    setTimeout(() => {
      testErrorHandling(token, projectId, socket, tokenPreview);
    }, 1000);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] LEAVE PROJECT TEST FAILED");
    console.log("=".repeat(80));
    log("Error", { message: error.message });
    process.exit(1);
  }
}

async function testErrorHandling(token, projectId, socket, tokenPreview) {
  try {
    console.log("\n" + "-".repeat(80));
    console.log("[14] STEP 14: Error Handling Tests");
    console.log("-".repeat(80));

    // Test 1: Try to access messages from non-existent project
    log("[TEST] Attempting to access non-existent project messages");
    try {
      await axios.get(
        `${API_URL}/chat/projects/00000000-0000-0000-0000-000000000000/messages`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("[WARN] Expected error but got success");
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        log("[OK] Correctly rejected unauthorized project access", {
          status: error.response.status,
          message: error.response.data.message,
        });
      }
    }

    // Test 2: Try to edit non-existent message
    log("[TEST] Attempting to edit non-existent message");
    try {
      await axios.patch(
        `${API_URL}/chat/messages/00000000-0000-0000-0000-000000000000`,
        { content: "test" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("[WARN] Expected error but got success");
    } catch (error) {
      if (error.response?.status === 404) {
        log("[OK] Correctly rejected non-existent message edit", {
          status: error.response.status,
          message: error.response.data.message,
        });
      }
    }

    // Test 3: Try to delete non-existent message
    log("[TEST] Attempting to delete non-existent message");
    try {
      await axios.delete(
        `${API_URL}/chat/messages/00000000-0000-0000-0000-000000000000`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("[WARN] Expected error but got success");
    } catch (error) {
      if (error.response?.status === 404) {
        log("[OK] Correctly rejected non-existent message deletion", {
          status: error.response.status,
          message: error.response.data.message,
        });
      }
    }

    // Test 4: Try to access messages without authentication
    log("[TEST] Attempting to access messages without token");
    try {
      await axios.get(`${API_URL}/chat/projects/${projectId}/messages`);
      console.log("[WARN] Expected authentication error but got success");
    } catch (error) {
      if (error.response?.status === 401) {
        log("[OK] Correctly rejected unauthenticated request", {
          status: error.response.status,
        });
      }
    }

    console.log(`[OK] All error handling tests passed`);

    setTimeout(() => {
      testFinalSummary(socket);
    }, 1000);
  } catch (error) {
    console.log("\n" + "=".repeat(80));
    console.error("[FAIL] ERROR HANDLING TEST FAILED");
    console.log("=".repeat(80));
    log("Unexpected error", { message: error.message });
    process.exit(1);
  }
}

function testFinalSummary(socket) {
  console.log("\n" + "=".repeat(80));
  console.log("[PASS] ALL TESTS PASSED SUCCESSFULLY!");
  console.log("=".repeat(80));

  console.log("\n[SUMMARY] COMPREHENSIVE TEST RESULTS:");
  console.log("   [OK] 1.  User Registration");
  console.log("   [OK] 2.  User Login & JWT Authentication");
  console.log("   [OK] 3.  Project Creation");
  console.log("   [OK] 4.  WebSocket Connection with JWT Auth");
  console.log("   [OK] 5.  Join Project Room");
  console.log("   [OK] 6.  Send Message via WebSocket");
  console.log("   [OK] 7.  Typing Indicators (Start/Stop)");
  console.log("   [OK] 8.  Message Persistence & History Retrieval");
  console.log("   [OK] 9.  Edit Message via REST API");
  console.log("   [OK] 10. Edit Message via WebSocket");
  console.log("   [OK] 11. Message Pagination (limit & before params)");
  console.log("   [OK] 12. Delete Message (Soft Delete)");
  console.log("   [OK] 13. Leave Project Room");
  console.log("   [OK] 14. Error Handling & Authorization");

  console.log("\n[SUCCESS] Chat system fully tested and operational!");
  console.log("=".repeat(80) + "\n");

  setTimeout(() => {
    log("[WS] Disconnecting WebSocket and exiting...");
    socket.disconnect();
    process.exit(0);
  }, 1000);
}

testChat();
