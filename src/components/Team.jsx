import { motion } from 'motion/react'
import { useT } from '../i18n/LanguageContext'
import PhotoDust from './PhotoDust'

const TEAM_PHOTO = '/altro-team-interim.jpg'

export default function Team({ photoStyle, dustProgress, dustEnabled = false }) {
  const t = useT()

  return (
    <div className="team">
      <div className="team__inner">
        <h2 className="team__heading">{t('about.heading')}</h2>
        <figure className="team__figure">
          <div className="team__photo-wrap">
            <motion.img
              className="team__photo"
              src={TEAM_PHOTO}
              alt={t('about.photoAlt')}
              width="1024"
              height="768"
              fetchpriority="high"
              decoding="async"
              style={photoStyle}
            />
            {dustEnabled && dustProgress ? (
              <PhotoDust src={TEAM_PHOTO} progress={dustProgress} enabled={dustEnabled} />
            ) : null}
          </div>
          <motion.figcaption className="team__names" style={photoStyle}>
            <span>{t('about.elad')}</span>
            <span>{t('about.ran')}</span>
          </motion.figcaption>
        </figure>
      </div>
    </div>
  )
}
