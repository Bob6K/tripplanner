# Even eropuit — Tripplanner

Nederlandse, mobielvriendelijke gezinsplanner rond EuroParcs Buitenhuizen. Statische HTML/CSS/JavaScript, zonder installatie, backend, API-sleutels of login.

## Website

Beoogde GitHub Pages-URL: https://bob6k.github.io/tripplanner/ (pas live na een geslaagde Pages-publicatie).

In GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.

## Lokaal bekijken

Open `index.html` in een browser, of start in deze map `python3 -m http.server 4173` en open http://localhost:4173.

## Functies

- Parkselector met officiële EuroParcs-foto; datastructuur voor meerdere parken.
- Activiteiten met filters, zoeken, favorieten, verbergen en terugzetten.
- Drie dagen met hoofdactiviteit, kleine extra en regenbackup. Activiteiten kiezen via kaartknop; verwijderen met het kruisje. Een bezet vak vervangen toont vooraf een melding.
- Aanpasbare datums, regenmodus, reset met bevestiging en printweergave.
- Keuzes worden per park opgeslagen in localStorage op dit apparaat en in deze browser. Bij geblokkeerde opslag verschijnt een waarschuwing. Geen synchronisatie tussen apparaten.

## Gegevens bijwerken

`data.js` bevat parken en hun eigen activiteiten. Voeg een park toe aan `TRIP_DATA.parks` met unieke `id`, `name`, `address`, `thumbnail`, `website`, `bookingUrl`, `facilities` en `activities`. Activiteiten hebben unieke IDs binnen het park. De interface gebruikt de geselecteerde parkgegevens voor routes en opslag.

Bronnen zijn gekoppeld per activiteit. Controle uitgevoerd op 14 oktober 2026. Rijtijden, bezoekduur en leeftijdstips zijn indicaties/redactionele inschattingen, geen live routeberekening of garantie. Activiteiten met een bovengrens boven 20 minuten krijgen de markering “Iets verder weg”. Entreeprijzen zijn niet overgenomen.

Officiële foto: https://cdn-cms.bookingexperts.com/media/3606/97/optimized.jpg — afkomstig van https://www.europarcs.nl/vakantieparken/buitenhuizen. Deze wordt extern geladen; beschikbaarheid is afhankelijk van EuroParcs. Overige kaartbeelden zijn herkenbare emoji-illustraties.

## Onderzoeksnotities

- Zorgvrij: zomer-/winterrooster, schoolvakanties en dagelijks toegankelijke buitenvoorzieningen onderscheiden.
- Velserbeek: kinderboerderij zaterdag gesloten, winter zonder zondagopening.
- Brederode: tegenstrijdige openingstijden op de officiële homepage; geen vast rooster opgenomen.
- Pieter Vermeulen Museum: nieuwe locatie Doorneberglaan 29, IJmuiden; zaterdag niet vermeld als openingsdag.
- Heerenduinen: officiële SRO-site, dynamisch vrijzwemrooster; zwemvleugels en begeleiding zonder diploma, glijbaanregels gekoppeld.
- SnowWorld: commerciële naam Amsterdam, locatie Velsen-Zuid. Lesleeftijden en beschikbaarheid vooraf controleren.
- Escape Box: officiële detailpagina bevestigt Family Edition vanaf circa 10 jaar; duidelijk als ongeschikt voor zelfstandig spelen door 4 en 7 gemarkeerd. Animatie is geen gegarandeerd dagelijks programma.
- Strand conservatief op 20–25 minuten; Haarlem 20–30 minuten plus parkeren/lopen.
- “Tante Eef” niet toegevoegd: geen voldoende betrouwbare actuele officiële vermelding onder die naam gevonden.

## Controle

`node --check app.js` en `node --check data.js` controleren syntaxis. Mobiele en desktopcontrole gebeurt in de browser, inclusief opslag na herladen, filters, verbergen/terugzetten, planner, reset, regenmodus en datums.
