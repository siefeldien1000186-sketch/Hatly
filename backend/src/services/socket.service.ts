import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import prisma from '../prisma';

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}`);

    // Join user room for targeted notifications
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their notification room`);
    });

    // Join driver radar room for available rides/deliveries
    socket.on('join:driver:radar', (driverId: string) => {
      socket.join('drivers:radar');
      socket.join(`driver:${driverId}`);
      console.log(`Driver ${driverId} joined driver radar`);
    });

    // Leave driver radar
    socket.on('leave:driver:radar', (driverId: string) => {
      socket.leave('drivers:radar');
      console.log(`Driver ${driverId} left driver radar`);
    });

    // Join store room for kitchen orders
    socket.on('join:store', (storeId: string) => {
      socket.join(`store:${storeId}`);
      console.log(`Store ${storeId} joined store room`);
    });

    // Join specific order tracking room
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order room: ${orderId}`);
    });

    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    // Realtime driver GPS broadcast
    socket.on('driver:location', async (data: { driverId: string; orderId?: string; lat: number; lng: number; heading?: number }) => {
      const { driverId, orderId, lat, lng, heading } = data;

      // Broadcast to specific order room if on active trip
      if (orderId) {
        socket.to(`order:${orderId}`).emit('driver:location:update', {
          driverId,
          lat,
          lng,
          heading: heading || 0,
          timestamp: new Date().toISOString(),
        });
      }

      // Also update in DB periodically or on movement
      try {
        await prisma.driver.update({
          where: { id: driverId },
          data: {
            currentLat: lat,
            currentLng: lng,
            lastLocationUpdate: new Date(),
          },
        });
      } catch (err) {
        // silently catch transient db update error
      }
    });

    // In-app order chat message
    socket.on('order:chat:send', (data: { orderId: string; senderId: string; senderName: string; senderRole: string; message: string }) => {
      const chatPayload = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      // Broadcast to everyone in this order room
      io?.to(`order:${data.orderId}`).emit('order:chat:message', chatPayload);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

// Helper notification dispatchers
export const notifyOrderCreated = (order: any) => {
  if (!io) return;
  // If order involves a store (Food, Market, Shopping), alert the store
  if (order.storeId) {
    io.to(`store:${order.storeId}`).emit('store:new_order', order);
  }
  // If it is a ride or ready delivery, alert drivers on radar
  io.to('drivers:radar').emit('radar:new_order', order);
  // Alert admin
  io.emit('admin:order_update', order);
};

export const notifyOrderStatusUpdated = (order: any) => {
  if (!io) return;
  io.to(`order:${order.id}`).emit('order:status_update', order);
  io.to(`user:${order.customerId}`).emit('notification', {
    titleAr: 'تحديث حالة الطلب',
    titleEn: 'Order Status Update',
    bodyAr: `تم تحديث حالة طلبك #${order.orderNumber} إلى ${order.status}`,
    bodyEn: `Your order #${order.orderNumber} status changed to ${order.status}`,
    orderId: order.id,
  });
  if (order.driver?.userId) {
    io.to(`user:${order.driver.userId}`).emit('order:status_update', order);
  }
  io.emit('admin:order_update', order);
};
