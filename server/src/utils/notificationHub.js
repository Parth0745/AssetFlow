class NotificationHub {
  constructor() {
    this.clients = new Set();
  }

  subscribe(res) {
    this.clients.add(res);
    return () => this.clients.delete(res);
  }

  broadcast(payload) {
    const message = `data: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      client.write(message);
    }
  }
}

export const notificationHub = new NotificationHub();
