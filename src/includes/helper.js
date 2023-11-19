export function formatTime(time) {
  let minutes = Math.floor(time / 60) || 0
  let seconds = Math.round((time - minutes * 60) || 0)

  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
