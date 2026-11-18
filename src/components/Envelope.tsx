import { site } from '../config'
import { GardenBackdrop } from './GardenBackdrop'

type EnvelopeProps = {
  opening: boolean
  onOpen: () => void
}

const petals = [
  { left: '8%', delay: '0s', duration: '11s', size: 9 },
  { left: '18%', delay: '2s', duration: '13s', size: 7 },
  { left: '28%', delay: '0.6s', duration: '10s', size: 11 },
  { left: '40%', delay: '3.2s', duration: '14s', size: 8 },
  { left: '52%', delay: '1.4s', duration: '12s', size: 10 },
  { left: '63%', delay: '4s', duration: '15s', size: 7 },
  { left: '74%', delay: '0.2s', duration: '11s', size: 12 },
  { left: '86%', delay: '2.6s', duration: '13s', size: 8 },
  { left: '12%', delay: '5s', duration: '16s', size: 6 },
  { left: '93%', delay: '1s', duration: '12s', size: 9 },
]

function SealMark() {
  return (
    <svg viewBox="0 0 88 88" aria-hidden="true">
      <defs>
        <radialGradient id="wax" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#a34758" />
          <stop offset="48%" stopColor="#6d2030" />
          <stop offset="100%" stopColor="#3d1018" />
        </radialGradient>
        <linearGradient id="gilt" x1="18%" y1="6%" x2="86%" y2="96%">
          <stop offset="0%" stopColor="#f8e7bc" />
          <stop offset="42%" stopColor="#d4b06a" />
          <stop offset="78%" stopColor="#a67c3d" />
          <stop offset="100%" stopColor="#f0d48a" />
        </linearGradient>
      </defs>
      <path
        d="M44 8c7 1 11 6 16 6 6 0 10 5 12 10 3 6 8 8 8 14 0 7-4 11-4 17s5 10 2 16c-3 6-9 7-14 10-5 3-8 9-16 9s-11-6-16-9c-5-3-11-4-14-10-3-6 2-10 2-16s-4-10-4-17c0-6 5-8 8-14 2-5 6-10 12-10 5 0 9-5 14-6z"
        fill="url(#wax)"
        stroke="url(#gilt)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <ellipse cx="34" cy="28" rx="10" ry="6" fill="#fff4e4" opacity="0.28" />
      <circle cx="44" cy="46" r="24" fill="none" stroke="#e8c98a" strokeWidth="1.45" />
      <circle cx="44" cy="46" r="19" fill="none" stroke="#f3d9a0" strokeWidth="0.7" />
      <path
        d="M44 28 v7 M40.5 31.5 h7"
        stroke="#f8f1e4"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <text
        x="44"
        y="54"
        textAnchor="middle"
        fill="#f8f1e4"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="13"
        letterSpacing="1.5"
      >
        R · J
      </text>
    </svg>
  )
}

export function Envelope({ opening, onOpen }: EnvelopeProps) {
  return (
    <div className={`envelope-screen ${opening ? 'is-opening' : ''}`}>
      <GardenBackdrop />
      <div className="petals" aria-hidden="true">
        {petals.map((petal) => (
          <span
            key={`${petal.left}-${petal.delay}`}
            className="petal"
            style={{
              left: petal.left,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
              width: petal.size,
              height: petal.size * 1.45,
            }}
          />
        ))}
      </div>

      <div className="envelope-frame" aria-hidden="true" />

      <p className="env-kicker">You are invited</p>
      <h1 className="env-names">
        Rahul <em>&</em> Jovial
      </h1>
      <p className="env-date">{site.wedding.dateDisplay}</p>
      {opening && <span className="open-burst" aria-hidden="true" />}

      <div className="envelope-stage">
        <div className="envelope-scene">
        <div className={`envelope ${opening ? 'open' : ''}`}>
          <div className="env-back" />
          <div className="env-liner" aria-hidden="true" />
          <div className="env-letter">
            <span className="env-letter-cross" aria-hidden="true">
              ✝
            </span>
            <strong>Rahul & Jovial</strong>
            <span>Holy Matrimony</span>
          </div>
          <div className="env-pocket" />
          <div className="env-flap" />
          <button
            type="button"
            className="seal"
            onClick={onOpen}
            aria-label="Open the invitation"
          >
            <SealMark />
          </button>
        </div>
        </div>
      </div>

      <p className="env-hint">Tap the seal</p>
    </div>
  )
}
