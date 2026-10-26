import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  mapsDirections,
  mapsEmbed,
  site,
  weddingDate,
  weddingIcs,
} from '../config'
import { GardenBackdrop } from './GardenBackdrop'
import { Rsvp } from './Rsvp'

type Photo = {
  src: string
  alt: string
  width: number
  height: number
}

const photos = {
  stairs: {
    src: site.photos.stairs,
    alt: 'Rahul and Jovial standing together on a marble staircase',
    width: 682,
    height: 1024,
  },
  portrait: {
    src: site.photos.portrait,
    alt: 'A close portrait of Rahul and Jovial',
    width: 682,
    height: 1024,
  },
  embrace: {
    src: site.photos.embrace,
    alt: 'Rahul and Jovial in a quiet embrace',
    width: 682,
    height: 1024,
  },
  walk: {
    src: site.photos.walk,
    alt: 'Rahul and Jovial walking hand in hand',
    width: 1024,
    height: 682,
  },
} satisfies Record<string, Photo>

function CrossRule() {
  return (
    <div className="rule" aria-hidden="true">
      <span />
      <svg viewBox="0 0 24 24">
        <path d="M12 3 v18 M6 9 h12" />
      </svg>
      <span />
    </div>
  )
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShown(true)
      },
      { threshold: 0.18 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, className: shown ? 'reveal shown' : 'reveal' }
}

function PhotoButton({
  photo,
  className,
  onOpen,
}: {
  photo: Photo
  className?: string
  onOpen: (photo: Photo) => void
}) {
  return (
    <button
      type="button"
      className={className ?? 'photo-btn'}
      onClick={() => onOpen(photo)}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
      />
      <span className="photo-zoom">View</span>
    </button>
  )
}

function Tilt({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLElement>(null)

  const move = (event: MouseEvent<HTMLElement>) => {
    const element = ref.current
    if (!element) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = element.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    element.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`
  }

  const leave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <article
      ref={ref}
      className={className}
      onMouseMove={move}
      onMouseLeave={leave}
    >
      {children}
    </article>
  )
}

function Countdown() {
  const iso = site.wedding.dateISO
  const target = weddingDate()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!iso) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [iso])

  if (!target) return null

  const distance = Math.max(0, target.getTime() - now)
  const days = Math.floor(distance / 86400000)
  const hours = Math.floor((distance % 86400000) / 3600000)
  const minutes = Math.floor((distance % 3600000) / 60000)
  const seconds = Math.floor((distance % 60000) / 1000)
  const units = [
    ['Days', days],
    ['Hours', hours],
    ['Minutes', minutes],
    ['Seconds', seconds],
  ] as const

  return (
    <div className="countdown" aria-label="Countdown to the wedding">
      {units.map(([label, value]) => (
        <div key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function addToCalendar() {
  const ics = weddingIcs()
  if (!ics) return
  const file = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rahul-jovial-wedding.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function Invitation() {
  const welcome = useReveal<HTMLElement>()
  const day = useReveal<HTMLElement>()
  const church = useReveal<HTMLElement>()
  const walk = useReveal<HTMLElement>()
  const reception = useReveal<HTMLElement>()
  const portrait = useReveal<HTMLElement>()
  const [active, setActive] = useState<Photo | null>(null)
  const [openMap, setOpenMap] = useState<'church' | 'reception' | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      const progress = max > 0 ? root.scrollTop / max : 0
      root.style.setProperty('--scroll', progress.toFixed(4))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const dateLabel = site.wedding.dateDisplay

  return (
    <main className="page">
      <div className="progress" aria-hidden="true" />
      <header className="hero">
        <GardenBackdrop />
        <div className="hero-card">
          <div className="hero-portrait">
            <PhotoButton
              photo={photos.stairs}
              className="hero-frame"
              onOpen={setActive}
            />
            <div className="hero-names">
              <p className="kicker">Together with their families</p>
              <p className="hero-name">{site.couple.groom}</p>
              <p className="amp">&</p>
              <p className="hero-name">{site.couple.bride}</p>
            </div>
          </div>
          <div className="hero-copy">
            <p className="ml" lang="ml">
              രാഹുൽ ഷാജിയുടെയും ജോവിയൽ റോസിന്റെയും വിവാഹത്തിലേക്ക്
              സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു
            </p>
            {dateLabel && <p className="date-line">{dateLabel}</p>}
          </div>
        </div>
        <a className="scroll-cue" href="#welcome">
          Scroll
        </a>
      </header>

      <section id="welcome" ref={welcome.ref} className={`section narrow ${welcome.className}`}>
        <CrossRule />
        <blockquote>
          What God has joined together, let no one separate.
          <cite>Mark 10:9</cite>
        </blockquote>
        <p>
          Rahul Shaji and Jovial Rose ask you to witness their Holy Matrimony
          and to stay for the celebration that follows. Your presence and your
          prayers are the gift they hope for.
        </p>
      </section>

      <section ref={day.ref} className={`section narrow day ${day.className}`}>
        <p className="kicker">The day</p>
        <ol className="day-list">
          {site.schedule.map((item) => (
            <li key={item.time}>
              <time>{item.time}</time>
              <div>
                <strong>{item.title}</strong>
                {item.detail ? <span>{item.detail}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {weddingDate() && (
        <section className="countdown-band" aria-label="Countdown to the wedding">
          <p className="kicker">Counting the days</p>
          <h2>Until we say I do</h2>
          {dateLabel && <p className="countdown-date">{dateLabel}</p>}
          <Countdown />
          <button type="button" className="ghost-button" onClick={addToCalendar}>
            Save the date
          </button>
        </section>
      )}

      <section ref={church.ref} className={`section ${church.className}`}>
        <div className="split">
          <PhotoButton photo={photos.embrace} onOpen={setActive} />
          <Tilt className="venue-card">
            <p className="kicker">Holy Matrimony</p>
            <h2>The vows</h2>
            <p className="ml" lang="ml">
              വിവാഹ കൂദാശ · {site.church.malayalamPlace}
            </p>
            <h3>{site.church.name}</h3>
            <p className="time-line">{site.wedding.churchTime}</p>
            <p className="time-note">Church</p>
            <address>{site.church.address}</address>
            <p>
              The marriage will be solemnised in the parish church at
              Thodupuzha, where family and friends gather for the blessing.
            </p>
            <div className="venue-actions">
              <a
                className="gold-button"
                href={mapsDirections(site.church.latitude, site.church.longitude)}
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  setOpenMap((current) => (current === 'church' ? null : 'church'))
                }
              >
                {openMap === 'church' ? 'Hide map' : 'Show map'}
              </button>
            </div>
            {openMap === 'church' && (
              <iframe
                className="map"
                title="Map of St. Sebastian's Forane Church, Thodupuzha"
                src={mapsEmbed(site.church.latitude, site.church.longitude)}
                loading="lazy"
              />
            )}
          </Tilt>
        </div>
      </section>

      <section ref={walk.ref} className={`band ${walk.className}`}>
        <PhotoButton photo={photos.walk} className="band-photo" onOpen={setActive} />
        <p>Rahul & Jovial</p>
      </section>

      <section ref={reception.ref} className={`section ${reception.className}`}>
        <div className="split reverse">
          <Tilt className="venue-card">
            <p className="kicker">Reception</p>
            <h2>The celebration</h2>
            <p className="ml" lang="ml">
              സ്വീകരണം · {site.reception.malayalamPlace}
            </p>
            <h3>{site.reception.name}</h3>
            <p className="place-detail">{site.reception.detail}</p>
            <p className="time-line">{site.wedding.receptionTime}</p>
            <p className="time-note">Wedding</p>
            <address>{site.reception.address}</address>
            <p>
              After the church blessing, the celebration continues among the
              gardens at Jacobs in Pandappilly.
            </p>
            <div className="venue-actions">
              <a
                className="gold-button"
                href={mapsDirections(
                  site.reception.latitude,
                  site.reception.longitude,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  setOpenMap((current) =>
                    current === 'reception' ? null : 'reception',
                  )
                }
              >
                {openMap === 'reception' ? 'Hide map' : 'Show map'}
              </button>
            </div>
            {openMap === 'reception' && (
              <iframe
                className="map"
                title="Map of Jacobs Entertainments, Pandappilly"
                src={mapsEmbed(site.reception.latitude, site.reception.longitude)}
                loading="lazy"
              />
            )}
          </Tilt>
          <PhotoButton photo={photos.portrait} onOpen={setActive} />
        </div>
      </section>

      <section ref={portrait.ref} className={`section closing ${portrait.className}`}>
        <CrossRule />
        <p className="script-line">Come share the day with us</p>
      </section>

      <Rsvp />

      <footer className="footer">
        <p className="script-line small">With love</p>
        <p>Rahul Shaji & Jovial Rose</p>
        <p className="footer-places">Thodupuzha · Muvattupuzha</p>
      </footer>

      {active && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={() => setActive(null)}
        >
          <button type="button" className="lightbox-close" onClick={() => setActive(null)}>
            Close
          </button>
          <img
            src={active.src}
            alt={active.alt}
            width={active.width}
            height={active.height}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  )
}
