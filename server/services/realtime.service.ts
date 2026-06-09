import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { Membership } from "../models/Membership.js";

type SocketAuthPayload = {
  token?: string;
  organizationId?: string;
};

let io: SocketIOServer | null = null;

function extractToken(handshake: Socket["handshake"]) {
  const auth = handshake.auth as SocketAuthPayload | undefined;
  return auth?.token ?? null;
}

export function initRealtime(server: HttpServer, clientOrigin: string) {
  io = new SocketIOServer(server, {
    cors: {
      origin: clientOrigin,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket.handshake);
      if (!token) {
        return next(new Error("Missing socket auth token."));
      }

      const payload = verifyAccessToken(token);
      const organizationId = (socket.handshake.auth as SocketAuthPayload | undefined)?.organizationId;

      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      socket.data.organizationId = organizationId ?? "";

      if (organizationId) {
        const membership = await Membership.findOne({
          userId: payload.userId,
          organizationId,
          status: "active"
        }).lean();

        if (!membership) {
          return next(new Error("No active membership for the selected organization."));
        }
      }

      return next();
    } catch (error) {
      return next(error instanceof Error ? error : new Error("Socket authentication failed."));
    }
  });

  io.on("connection", (socket) => {
    const organizationId = String(socket.data.organizationId ?? "");
    const userId = String(socket.data.userId ?? "");

    if (organizationId) {
      socket.join(`org:${organizationId}`);
    }
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  return io;
}

export function getRealtimeServer() {
  return io;
}

export function emitOrganizationEvent(
  organizationId: string,
  event: string,
  payload: Record<string, unknown>
) {
  io?.to(`org:${organizationId}`).emit(event, payload);
}

export function emitUserEvent(userId: string, event: string, payload: Record<string, unknown>) {
  io?.to(`user:${userId}`).emit(event, payload);
}

