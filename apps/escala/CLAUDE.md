# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app does

**Escala** is a single-page church media schedule manager (Portuguese-language). It generates a monthly calendar where administrators assign team members (`pessoas`) to technical roles (`funcoes`: Datashow, Live, Filmadora) for each day's services.

## Running the app

Open `index.html` directly in a browser — no build step, no server, no dependencies. All logic is in `app.js` (vanilla JS).

## Architecture

Two files only:
- `index.html` — layout, styles, and modal markup
- `app.js` — all application logic

### Key data structures in `app.js`

- **`pessoas`** — array of team member names (edit here to add/remove people)
- **`funcoes`** — array of role names: `["Datashow", "Live", "Filmadora"]`
- **`eventosFixos`** — hardcoded recurring church events keyed by `"diaSemana_ocorrencia"` (e.g., `"domingo_todo"`, `"sabado_1"`). These render on the calendar as fixed events but are never stored in `escalas`.
- **`escalas`** — the live schedule object: `{ [dia]: [{horario, funcao, pessoa}] }` keyed by day-of-month number
- **`escalasImportadasRelativas`** — schedule stored as relative keys (`"diaSemana_ocorrencia"`) so it can be reapplied across months

### Persistence model

Schedules are saved to `localStorage` under the key `"escalaApp"`. The export/import feature serializes `escalasImportadasRelativas` (relative keys) to a `.txt` file containing JSON — this allows a schedule built for one month to be imported and remapped to another month.

When saving a day's assignments, `escalas` (absolute day numbers) and `escalasImportadasRelativas` (relative keys) are both updated in sync.

### Calendar rendering flow

1. `gerarCalendario()` builds the `<table>` DOM for the selected month
2. `atualizaExibicaoDia(dia, celula)` populates each cell with sorted schedule items + fixed events
3. `atualizaContagem()` + `atualizaTabelaContagem()` update the sidebar count table
4. The person with the highest total assignments is highlighted (`.highlight` class)

### Adding/changing team members or roles

- Add names to the `pessoas` array in `app.js`
- Add roles to the `funcoes` array (also update the sidebar table header in `index.html` if you add a role)
- Add recurring events to `eventosFixos` using keys like `"diaSemana_N"` (Nth occurrence) or `"diaSemana_todo"` (every occurrence)
