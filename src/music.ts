const source = `${import.meta.env.BASE_URL}music/eternally-yours.mp3`

let track: HTMLAudioElement | null = null

export function startMusic() {
  if (!track) {
    track = new Audio(source)
    track.loop = true
    track.preload = 'auto'
    track.preservesPitch = true
  }
  track.playbackRate = 0.90
  if (track.paused) void track.play()
}

export function setMuted(muted: boolean) {
  if (!track) return
  track.playbackRate = 0.90
  track.muted = muted
  if (!muted && track.paused) void track.play()
}
