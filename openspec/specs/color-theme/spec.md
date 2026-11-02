# color-theme Specification

## Purpose
Controls the app's color theme: dark is the default appearance, the user can switch between dark, light, and system themes, and the chosen theme is remembered and applied before the first paint.

## Requirements

### Requirement: Dark theme is the default

On a first visit with no saved theme preference, the app SHALL render in the dark theme. The dark theme SHALL use the existing dark design tokens so that page background, text, cards, borders, and interactive states are all rendered in dark colors.

#### Scenario: First visit renders dark

- **WHEN** a user opens the app with no saved theme preference
- **THEN** the document root carries the dark theme and the page renders with a dark background and light text

#### Scenario: Dark theme has no light flash on load

- **WHEN** a returning or first-time visitor loads the page
- **THEN** the theme is applied to the document before the first paint, so no light-theme frame is shown

### Requirement: User can change the theme

The app SHALL provide a control that lets the user switch between dark, light, and system themes. Selecting a theme SHALL apply it immediately to the current page without a reload. In system mode the app SHALL follow the operating system color-scheme preference and update when it changes.

#### Scenario: Switch to light applies immediately

- **WHEN** the user selects the light theme
- **THEN** the page updates to the light theme without reloading

#### Scenario: Switch back to dark applies immediately

- **WHEN** the user selects the dark theme
- **THEN** the page updates to the dark theme without reloading

#### Scenario: System mode follows the operating system

- **WHEN** the user selects system mode and the operating system preference is dark
- **THEN** the page renders in the dark theme
- **AND** changing the operating system preference to light updates the page to the light theme

### Requirement: Theme choice is remembered

The app SHALL persist the user's selected theme and restore it on later visits. A saved choice SHALL take precedence over the default dark theme.

#### Scenario: Saved choice survives reload

- **WHEN** the user selects the light theme and reloads the app
- **THEN** the app renders in the light theme

#### Scenario: No saved choice falls back to dark

- **WHEN** storage contains no saved theme choice
- **THEN** the app renders in the dark theme

### Requirement: Theme control is reachable from every page

The theme control SHALL be available from every page of the app and SHALL be keyboard operable and labeled for assistive technology.

#### Scenario: Control present on every page

- **WHEN** the user navigates to any page of the app
- **THEN** the theme control is present and usable

#### Scenario: Control exposes an accessible name

- **WHEN** assistive technology inspects the theme control
- **THEN** the control exposes an accessible label describing its action

### Requirement: Browser chrome matches the active theme

The app SHALL declare the active `color-scheme` so native controls and scrollbars match the theme, and SHALL update the page `theme-color` metadata to the active theme's background so mobile browser chrome does not clash.

#### Scenario: color-scheme follows the active theme

- **WHEN** the dark theme is active
- **THEN** the document declares a dark color-scheme
- **AND** when the light theme is active the document declares a light color-scheme

#### Scenario: theme-color updates with the theme

- **WHEN** the active theme changes
- **THEN** the page's `theme-color` metadata reflects the new theme's background color
