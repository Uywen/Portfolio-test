import { useEffect, useRef, useState } from 'react'
import './CoverPage.css'

const STORAGE_KEY = 'coverPage'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function CoverPage() {
  const stored = loadStored()

  const [photo, setPhoto] = useState(stored.photo ?? null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(stored.name ?? 'Your Name')
  const [occupation, setOccupation] = useState(
    stored.occupation ?? 'Frontend Developer',
  )
  const [location, setLocation] = useState(stored.location ?? 'City, Country')

  const fileInputRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const data = { photo, name, occupation, location }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage full or unavailable; ignore
    }
  }, [photo, name, occupation, location])

  // Drift the photo frame toward the cursor for a floating parallax effect.
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) return

    function handleMouseMove(event) {
      const frame = frameRef.current
      if (!frame) return
      // How far the cursor is from screen center, as a -1..1 ratio.
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      const shift = 30 // max px of travel
      const tilt = 8 // max deg of tilt
      frame.style.transform =
        `translate(${x * shift}px, ${y * shift}px) ` +
        `rotateY(${x * tilt}deg) rotateX(${-y * tilt}deg)`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  function handlePhotoClick() {
    fileInputRef.current?.click()
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <section className="cover">
      <button
        ref={frameRef}
        type="button"
        className="photo-frame"
        onClick={handlePhotoClick}
        aria-label="Upload a photo"
      >
        {photo ? (
          <img src={photo} alt="Profile" className="photo" />
        ) : (
          <span className="photo-placeholder">+ Add photo</span>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="photo-input"
      />

      <div className="cover-details">
        {isEditing ? (
          <div className="cover-fields">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="cover-input"
            />
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Occupation"
              className="cover-input"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="cover-input"
            />
          </div>
        ) : (
          <div className="cover-text">
            <h1>{name}</h1>
            <h2>{occupation}</h2>
            <p>{location}</p>
          </div>
        )}

        <button
          type="button"
          className="edit-button"
          onClick={() => setIsEditing((editing) => !editing)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>
    </section>
  )
}

export default CoverPage
