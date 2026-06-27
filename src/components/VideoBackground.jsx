import { forwardRef } from 'react'

const VideoBackground = forwardRef(function VideoBackground(_, ref) {
  return (
    <div className="video-bg" aria-hidden="true">
      <video
        ref={ref}
        className="video-bg__video"
        src="/altroai automated.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="video-bg__overlay" />
    </div>
  )
})

export default VideoBackground
