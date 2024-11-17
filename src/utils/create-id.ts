export default function createId() {
  return ':' + Math.random().toString(36).substring(2, 6) + ':';
}