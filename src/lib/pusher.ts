import Pusher from "pusher";

// Server-side Pusher instance
// Used ONLY in API routes to trigger (send) events to Pusher cloud
// PUSHER_SECRET must never be exposed to the browser - this file is safe because
// it only runs on the server (Next.js API routes)

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true, // use encrypted HTTPS connection to Pusher cloud
});

export default pusherServer;

