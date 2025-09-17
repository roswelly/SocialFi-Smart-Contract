export function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} month ago`;
  return `${Math.floor(diffInSeconds / 31536000)} year ago`;
}

export function getRandomAvatarImage(): string {
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  return `/chats/${randomNumber}.png`;
}

export function shortenAddress(address: string): string {
  return address.slice(2, 8);
}