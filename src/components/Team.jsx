import { useT } from '../i18n/LanguageContext'

const TEAM_PHOTO = '/altro-team-interim.jpg'

export default function Team() {
  const t = useT()

  return (
    <section className="team" id="about" aria-labelledby="about-heading">
      <div className="team__inner">
        <h2 id="about-heading" className="team__heading">{t('about.heading')}</h2>
        <figure className="team__figure">
          <div className="team__photo-wrap">
            <img
              className="team__photo"
              src={TEAM_PHOTO}
              alt={t('about.photoAlt')}
              width="1024"
              height="768"
              decoding="async"
            />
          </div>
          <figcaption className="team__names">
            <span>{t('about.elad')}</span>
            <span>{t('about.ran')}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
