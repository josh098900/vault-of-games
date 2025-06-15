
import { Clock, Check, Heart, Plus } from "lucide-react";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "playing":
      return Clock;
    case "completed":
      return Check;
    case "wishlist":
      return Heart;
    default:
      return Plus;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "playing":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "wishlist":
      return "bg-pink-500/20 text-pink-400 border-pink-500/30";
    case "backlog":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "dropped":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};
