# Rolling Pool Specification

## Purpose

Defines how the rolling pool — the randomly seeded set of unwatched movies — is created, frozen, and preserved across navigation so selections survive leaving and returning to the page.

## Requirements

### Requirement: Rolling pool seeded once per movie set

The system SHALL seed the rolling pool from the unwatched movies of the selected attendees exactly once per distinct movie-title set. Re-entering the rolling pool page with the same title set SHALL NOT rebuild the pool or alter movie order or checked state.

#### Scenario: Initial seed from attendee movies

- **WHEN** the user navigates to the rolling pool page with attendees selected and their unwatched movies have loaded
- **THEN** the pool is seeded, shuffled, and every movie is unchecked

#### Scenario: Re-entering page with same titles does not rebuild

- **WHEN** the user leaves the rolling pool page and returns while the eligible movie titles are unchanged
- **THEN** the existing pool, movie order, and checked state are preserved unchanged

### Requirement: Rolling pool survives navigation and refresh

The system SHALL preserve the rolling pool and its checked state across back navigation, browser back, and page refresh.

#### Scenario: Back from voting pool preserves selections

- **WHEN** the user checks movies on the rolling pool page, advances to the voting pool, then navigates back to the rolling pool page
- **THEN** the checked movies remain checked and the pool order is unchanged

#### Scenario: Browser refresh preserves selections

- **WHEN** the user refreshes the page while on the rolling pool page after checking movies
- **THEN** the checked movies remain checked and the pool order is unchanged

### Requirement: Seeding waits for all attendee movies

The system SHALL seed the rolling pool only once every selected attendee's unwatched movies have been loaded, so the pool is never built from a partial title set.

#### Scenario: Slow member load does not produce a partial pool

- **WHEN** one attendee's movies load while another attendee's movies are still loading
- **THEN** the pool is not seeded until all selected attendees' movies have loaded, and the final pool contains the union of all titles

### Requirement: Changed title set re-seeds the pool

The system SHALL rebuild the rolling pool when the set of eligible movie titles changes, such as when the selected attendees change.

#### Scenario: Attendee change re-seeds the pool

- **WHEN** the user returns to attendee selection, changes who is attending, and rolls again
- **THEN** the pool is re-seeded from the new attendees' unwatched movies with all movies unchecked

### Requirement: Manual reseed is an explicit action

The system SHALL reshuffle the pool and clear checked state only in response to an explicit user reseed action, never as a side effect of navigation or data refetch.

#### Scenario: Reseed button reshuffles

- **WHEN** the user clicks the reseed control with no movies checked
- **THEN** the pool contains the same titles in a new shuffled order and all movies are unchecked

#### Scenario: Reseed disabled while movies checked

- **WHEN** the user has checked at least one movie
- **THEN** the reseed control is disabled so checked selections cannot be discarded accidentally
