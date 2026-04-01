import PusherJS from "pusher-js";

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

const pusherClient =
  pusherKey && pusherCluster
    ? new PusherJS(pusherKey, {
        cluster: pusherCluster,
      })
    : null;

export default pusherClient;
