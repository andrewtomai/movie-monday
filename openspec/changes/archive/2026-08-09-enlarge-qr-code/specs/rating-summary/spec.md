## Purpose

Presents a scannable voting QR on the movie rating summary page so that when the page is projected during movie club, attendees can vote from their own phones without the host sharing a link.

## ADDED Requirements

### Requirement: Rating summary page shows a scannable QR for voting
The rating summary page SHALL render a QR code encoding the rate URL for the displayed movie. The QR SHALL scale with the viewport so it is large enough to scan from a distance when the page is displayed on a large screen. The QR SHALL include a quiet zone and use error correction sufficient to remain scannable under video-compressed or dimly lit display conditions.

#### Scenario: QR encodes the movie's rate URL
- **WHEN** a user opens the rating summary page for a movie
- **THEN** the page displays a QR code that encodes `<origin>/movie/<id>/rate` for that movie

#### Scenario: QR scales up on large displays
- **WHEN** the rating summary page is rendered on a wide, high-resolution viewport (e.g., a laptop shared to a TV)
- **THEN** the QR scales up with the viewport to a substantial fraction of the screen

#### Scenario: QR scans reliably at distance
- **WHEN** the rating summary page renders the QR code
- **THEN** the QR includes a quiet zone of at least 4 modules and error correction better than the library's lowest setting, so a phone camera can read it from across a room

### Requirement: Typeable URL fallback
The rating summary page SHALL display the movie's rate URL as text beneath the QR, matching the value encoded in the QR, so attendees can type the address when scanning fails.

#### Scenario: URL text shown and matches the QR
- **WHEN** the rating summary page renders the QR code
- **THEN** the exact rate URL is displayed as text beneath the QR and matches the value encoded in the QR
