## MODIFIED Requirements

### Requirement: Rating summary page shows a scannable QR for voting
The rating summary page SHALL render a QR code encoding the rate URL for the displayed movie while the page is in voting mode. The QR SHALL scale with the viewport so it is large enough to scan from a distance when the page is displayed on a large screen. The QR SHALL include a quiet zone and use error correction sufficient to remain scannable under video-compressed or dimly lit display conditions.

#### Scenario: QR encodes the movie's rate URL
- **WHEN** the rating summary page is in voting mode for a movie
- **THEN** the page displays a QR code that encodes `<origin>/movie/<id>/rate` for that movie

#### Scenario: QR scales up on large displays
- **WHEN** the rating summary page is rendered in voting mode on a wide, high-resolution viewport (e.g., a laptop shared to a TV)
- **THEN** the QR scales up with the viewport to a substantial fraction of the screen

#### Scenario: QR scans reliably at distance
- **WHEN** the rating summary page renders the QR code in voting mode
- **THEN** the QR includes a quiet zone of at least 4 modules and error correction better than the library's lowest setting, so a phone camera can read it from across a room

#### Scenario: QR hidden in results mode
- **WHEN** the rating summary page is in results mode
- **THEN** the page does not render the QR code

### Requirement: Typeable URL fallback
The rating summary page SHALL display the movie's rate URL as text beneath the QR while the page is in voting mode, matching the value encoded in the QR, so attendees can type the address when scanning fails. In results mode the rate URL text SHALL NOT be displayed.

#### Scenario: URL text shown and matches the QR
- **WHEN** the rating summary page is in voting mode
- **THEN** the exact rate URL is displayed as text beneath the QR and matches the value encoded in the QR

#### Scenario: URL text hidden in results mode
- **WHEN** the rating summary page is in results mode
- **THEN** the rate URL is not displayed as text

## ADDED Requirements

### Requirement: Rating summary page has two toggleable modes
The rating summary page SHALL have a results mode and a voting mode. The page SHALL load in results mode and SHALL provide a single control to toggle between the two modes. The control SHALL read "Start Voting" in results mode and "Show Results" in voting mode. The current mode SHALL be persisted so that reloading the page restores it.

#### Scenario: Page loads in results mode
- **WHEN** a user opens the rating summary page for a movie
- **THEN** the page displays results mode and the toggle control reads "Start Voting"

#### Scenario: Toggle into voting mode
- **WHEN** the user activates the control while in results mode
- **THEN** the page switches to voting mode and the control reads "Show Results"

#### Scenario: Toggle back to results mode
- **WHEN** the user activates the control while in voting mode
- **THEN** the page switches back to results mode

#### Scenario: Mode restored after reload
- **WHEN** a user reloads the page while in voting mode
- **THEN** the page restores voting mode instead of defaulting to results mode

### Requirement: Results mode shows score and voter information
While in results mode the rating summary page SHALL display the average score, the total number of ratings, a chip naming each person who has rated the movie, and a histogram of the distribution of ratings across the rating values.

#### Scenario: Score, chips, and histogram displayed
- **WHEN** the rating summary page is in results mode and ratings exist for the movie
- **THEN** the page displays the average score, the total rating count, a chip for each person who rated, and a histogram of the rating distribution

#### Scenario: No QR in results mode
- **WHEN** the rating summary page is in results mode
- **THEN** the page displays no QR code and no rate URL text

#### Scenario: Anonymous raters shown as one chip
- **WHEN** the rating summary page is in results mode and some ratings have no known member
- **THEN** the page shows a single chip reading "<n> anonymous" instead of one chip per unknown rater, and the count and histogram include those ratings

### Requirement: Voting mode hides score while showing live activity
While in voting mode the rating summary page SHALL display the total number of ratings submitted and a chip naming each person who has rated the movie, and SHALL NOT display the average score or the rating histogram.

#### Scenario: Score hidden while ratings exist
- **WHEN** the rating summary page is in voting mode and ratings exist for the movie
- **THEN** the page displays the total rating count and voter chips but no average score and no histogram

#### Scenario: New voter appears as a chip
- **WHEN** a person who has not yet rated the movie submits a rating while the page is in voting mode
- **THEN** a chip naming that person appears in the voter chips without a page reload

### Requirement: Ratings data updates live
The rating summary page SHALL refresh its rating data automatically on a regular interval so the displayed count, voter chips, and (in results mode) average score and histogram reflect new submissions without manual action.

#### Scenario: Count updates as ratings arrive
- **WHEN** a rating is submitted for the movie while the page is open
- **THEN** the page shows the updated rating count within a few seconds without a manual refresh

#### Scenario: Voter chips update as ratings arrive
- **WHEN** a rating is submitted for the movie by a new voter while the page is open
- **THEN** a chip naming that voter appears within a few seconds without a manual refresh

#### Scenario: Score updates live in results mode
- **WHEN** a rating is submitted while the page is in results mode
- **THEN** the average score updates within a few seconds without a manual refresh
