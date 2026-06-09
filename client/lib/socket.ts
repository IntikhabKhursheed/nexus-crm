"use client";

import { io, type Socket } from "socket.io-client";
import { getAccessToken, getActiveOrganizationId } from "./auth";
import { webEnv } from "./env";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAccessToken();
  const organizationId = getActiveOrganizationId();

  if (!token || !organizationId) {
    return null;
  }

  if (!socket) {
    socket = io(webEnv.socketUrl, {
      autoConnect: false,
      transports: ["websocket"],
      auth: {
        token,
        organizationId
      }
    });
  } else {
    socket.auth = {
      token,
      organizationId
    };
  }

  return socket;
}

export function connectSocket() {
  const instance = getSocket();
  if (instance && !instance.connected) {
    instance.connect();
  }
  return instance;
}

export function disconnectSocket() {
  socket?.disconnect();
}

