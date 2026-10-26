import { useState, type FormEvent } from 'react'
import { site } from '../config'

type Attendance = 'yes' | 'no' | ''
type Status = 'idle' | 'submitting' | 'sent' | 'error'

function replyText(input: {
  name: string
  phone: string
  guests: number
  attendance: Attendance
  note: string
}) {
  const coming = input.attendance === 'yes'
  return [
    'RSVP for the wedding of Rahul Shaji & Jovial Rose',
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    coming ? `Guests: ${input.guests}` : 'Guests: 0',
    `Attending: ${coming ? 'Yes, with joy' : 'Sending love from afar'}`,
    input.note ? `Note: ${input.note}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function draftMessage(input: {
  name: string
  phone: string
  guests: number
  attendance: Attendance
  note: string
}) {
  const attending =
    input.attendance === 'yes'
      ? 'Yes, with joy'
      : input.attendance === 'no'
        ? 'Sending love from afar'
        : ''
  const lines = [
    'Hi Rahul,',
    '',
    'I would like to RSVP for your wedding with Jovial Rose.',
    '',
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    `Guests: ${input.attendance === 'no' ? '0' : input.attendance === 'yes' ? String(input.guests) : ''}`,
    `Attending: ${attending}`,
  ]
  if (input.note) lines.push(`Note: ${input.note}`)
  return lines.join('\n')
}

/**
 * The live sheet only stores a name and a phone number.
 * Attendance, guest count, and the note ride in the name
 * so they still land in that same spreadsheet.
 */
function nameError(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Please enter your name.'
  if (trimmed.length < 2 || !/\p{L}/u.test(trimmed)) return 'Please enter your name.'
  return ''
}

function phoneError(value: string, strict: boolean) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return strict ? 'Please enter a phone number.' : ''
  if (digits.length !== 10) return strict ? 'Enter a 10-digit phone number.' : ''
  return ''
}

function sheetName(input: {
  name: string
  guests: number
  attendance: Attendance
  note: string
}) {
  const coming = input.attendance === 'yes'
  const parts = [
    input.name,
    coming ? `Yes, ${input.guests}` : 'No',
  ]
  if (input.note) parts.push(input.note)
  return parts.join(' · ')
}

export function Rsvp() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)
  const [attendance, setAttendance] = useState<Attendance>('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [sentText, setSentText] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [nameBlurred, setNameBlurred] = useState(false)
  const [phoneBlurred, setPhoneBlurred] = useState(false)

  const nameMessage = nameError(name)
  const phoneMessage = phoneError(phone, attempted || phoneBlurred)

  const draft = draftMessage({
    name: name.trim(),
    phone: phone.trim(),
    guests,
    attendance,
    note: note.trim(),
  })
  const outgoing = sentText
    ? `Hi Rahul,\n\nI would like to RSVP for your wedding with Jovial Rose.\n\n${sentText}`
    : draft
  const whatsappHref = `https://wa.me/${site.rsvp.whatsapp}?text=${encodeURIComponent(outgoing)}`
  const emailHref = `mailto:${site.rsvp.email}?subject=${encodeURIComponent('RSVP for Rahul and Jovial')}&body=${encodeURIComponent(outgoing)}`

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAttempted(true)
    if (!attendance || nameError(name) || phoneError(phone, true)) return

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      guests,
      attendance,
      note: note.trim(),
    }
    const text = replyText(payload)
    setStatus('submitting')

    try {
      const formData = new FormData()
      formData.append('name', sheetName(payload))
      formData.append('phone', payload.phone)

      await fetch(site.rsvp.sheetSubmitUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData,
      })

      setSentText(text)
      setName('')
      setPhone('')
      setGuests(1)
      setAttendance('')
      setNote('')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section rsvp-section" id="rsvp">
      <div className="reply-card">
        <p className="kicker">Kindly reply</p>
        <h2>RSVP</h2>
        <p className="lede dark">
          A place is kept for you. Tell Rahul and Jovial whether you can share
          the day.
        </p>

        <form className="rsvp-form" autoComplete="off" onSubmit={(event) => void onSubmit(event)}>
          <label>
            Your name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setNameBlurred(true)}
              name="guest-name"
              autoComplete="off"
              aria-invalid={Boolean((attempted || nameBlurred) && nameMessage)}
              aria-describedby={(attempted || nameBlurred) && nameMessage ? 'name-error' : undefined}
              placeholder="Name"
            />
            {(attempted || nameBlurred) && nameMessage && (
              <span className="field-error" id="name-error" role="alert">
                {nameMessage}
              </span>
            )}
          </label>
          <label>
            Phone number
            <input
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
              }
              onBlur={() => setPhoneBlurred(true)}
              name="guest-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="off"
              aria-invalid={Boolean(phoneMessage)}
              aria-describedby={phoneMessage ? 'phone-error' : undefined}
              placeholder="Phone number"
            />
            {phoneMessage && (
              <span className="field-error" id="phone-error" role="alert">
                {phoneMessage}
              </span>
            )}
          </label>

          <fieldset>
            <legend>Will you be there?</legend>
            <div className="choice-row">
              <button
                type="button"
                className={attendance === 'yes' ? 'choice on' : 'choice'}
                aria-pressed={attendance === 'yes'}
                onClick={() => setAttendance('yes')}
              >
                With joy, I’ll be there
              </button>
              <button
                type="button"
                className={attendance === 'no' ? 'choice on' : 'choice'}
                aria-pressed={attendance === 'no'}
                onClick={() => setAttendance('no')}
              >
                Sending love from afar
              </button>
            </div>
          </fieldset>

          {attendance === 'yes' && (
            <div className="stepper">
              <span>Guests, including you</span>
              <div>
                <button
                  type="button"
                  onClick={() => setGuests((count) => Math.max(1, count - 1))}
                  aria-label="Fewer guests"
                >
                  −
                </button>
                <strong>{guests}</strong>
                <button
                  type="button"
                  onClick={() => setGuests((count) => Math.min(12, count + 1))}
                  aria-label="More guests"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <label>
            A note, if you wish
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              name="note"
              rows={3}
              placeholder="A blessing, a song request, a dietary note"
            />
          </label>

          <button className="gold-button" type="submit" disabled={!attendance || status === 'submitting'}>
            {status === 'submitting' ? 'Sending...' : 'Send RSVP'}
          </button>
        </form>

        {status === 'sent' && (
          <p className="rsvp-status" role="status">
            Your RSVP is saved. Thank you.
          </p>
        )}
        {status === 'error' && (
          <p className="rsvp-status rsvp-error" role="status">
            That didn’t save. Use an icon below to send it directly.
          </p>
        )}

        <div className="contact-icons">
          <a
            className="icon-link whatsapp"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp a drafted RSVP"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.14h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 14.04c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.26-.28.58-.35.77-.35h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.37-.42.49-.14.14-.28.29-.12.56.16.28.72 1.18 1.54 1.91 1.06.94 1.95 1.23 2.23 1.37.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.09 1.62.76 1.9.9.28.14.46.21.53.32.07.12.07.68-.17 1.36z"
              />
            </svg>
          </a>
          <a
            className="icon-link mail"
            href={emailHref}
            aria-label="Email a drafted RSVP"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
