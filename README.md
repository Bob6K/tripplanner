# Even eropuit — Volendam

De live site toont nu alleen Landal Volendam als een datumvrij Things to do-overzicht. De eerdere vier parken zijn tijdelijk verborgen met `hidden: true` in data.js; hun gegevens en localStorage blijven behouden. Oude park-URL’s openen Volendam. De eerdere plannercontroller app.js blijft bewaard maar wordt niet geladen.

Live: https://bob6k.github.io/tripplanner/?park=volendam

Drie onderdelen: 2 ideeën op het park, 6 in Volendam en 5 in de omgeving. Omgeving tot circa 30 minuten rijden bij normaal verkeer, ten noorden van Amsterdam; geen uitjes in Amsterdam centrum. Zaanse Schans via de noordelijke route is een grensgeval: verkeer kan de rit verlengen. Parkeren en lopen komen erbij.

Dezelfde kaartstijl, met vaste categoriepaletten en tekstlabels: spelen, boerderij, museum, zwemmen, varen, natuur/wandelen en ambachten/proeven. Kleurenlegenda werkt als filter. Zoeken, binnen/buiten/gratis/regen/favorieten, verbergen/terugzetten, informatiepopups en printen blijven beschikbaar. Geen dagplanner of datumvelden. Favorieten en verborgen uitjes worden per park in dezelfde localStorage bewaard.

Bronnen gecontroleerd op 15 oktober 2026 en per activiteit gekoppeld. Landal bevestigt fietsverhuur en ligging aan water; geen eigen zwembad of speeltuin als voorziening aangenomen. Bootjes kijken is uitdrukkelijk een zelf bedacht idee. Slobbeland is een aparte zomerlocatie naast het park en staat bij Volendam. Marker Museum heeft seizoensopening; Volendams Museum heeft een historische collectie en ook een brandtentoonstelling, met gerichte tip voor jonge kinderen. Geen onbevestigde dierknuffelactiviteit toegevoegd.

Parkfoto: https://mss-p-014-delivery.stylelabs.cloud/api/public/content/3951811-3x2?t=w1280 — afkomstig van https://www.landal.nl/parken/volendam.

Controller: volendam.js. Data: data.js. Controle: `node --check volendam.js`, `node --check data.js` en browsercontrole van categorieën, popups, opslag na herladen en mobiele weergave.

---

## Eerdere uitvoering (tijdelijk verborgen)

# Even eropuit — Tripplanner

Nederlandse, mobielvriendelijke gezinsplanner rond EuroParcs Buitenhuizen, EuroParcs De Woudhoeve , Landal Strandpark Duynhille en EuroParcs Noordwijkse Duinen. Statische HTML/CSS/JavaScript, zonder installatie, backend, API-sleutels of login.

## Website

Live website: https://bob6k.github.io/tripplanner/

In GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.

## Lokaal bekijken

Open `index.html` in een browser, of start in deze map `python3 -m http.server 4173` en open http://localhost:4173.

## Functies

- Vier zichtbare parkknoppen met officiële parkfoto’s en groene selectiehighlight: Buitenhuizen, De Woudhoeve, Strandpark Duynhille en Noordwijkse Duinen. Foto, regiotekst, activiteiten, routes, parklinks en eigen planning wisselen mee. Directe parklinks werken via `?park=buitenhuizen` , `?park=woudhoeve` , `?park=duynhille` en `?park=noordwijkse-duinen`, inclusief de terug-/vooruitknoppen van de browser.
- Activiteiten met filters, zoeken, favorieten, verbergen en terugzetten.
- Drie dagen met vrije activiteitenlijstjes. Voeg uitjes toe via de kaartknop. Het hele geplande blok is sleepbaar, behalve de titel en verwijderknop. De titel opent volledige activiteitinformatie. In de toevoegpopup kies je één of meerdere dagen met drie dagkaarten; er zijn geen dropdowns. Toetsenbord: focus een blok, spatie/Enter om op te pakken, pijlen om te verplaatsen, Enter om te bewaren, Escape om te annuleren. Verwijderen kan met het kruisje. Bestaande planningen met hoofdactiviteit/extra/regen worden automatisch overgezet zonder keuzes te verliezen.
- Aanpasbare datums, regenmodus, reset met bevestiging en printweergave.
- Keuzes worden per park opgeslagen in localStorage op dit apparaat en in deze browser. Bij geblokkeerde opslag verschijnt een waarschuwing. Geen synchronisatie tussen apparaten.

## Gegevens bijwerken

`data.js` bevat parken en hun eigen activiteiten. Voeg een park toe aan `TRIP_DATA.parks` met unieke `id`, `brand`, `name`, `address`, `thumbnail`, `website`, `bookingUrl`, `facilities`, `region`, `intro`, `parkNote` en `activities`. Activiteiten hebben unieke IDs binnen het park. De interface gebruikt de geselecteerde parkgegevens voor routes en opslag.

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

## De Woudhoeve

Directe link: https://bob6k.github.io/tripplanner/?park=woudhoeve

16 ideeën: 9 op het park en 7 in de omgeving. Alle geschatte autoritten in deze selectie hebben een bovengrens van 20 minuten bij normaal verkeer; drukte, parkeren en lopen kunnen extra tijd vragen. Geen live routegarantie.

Parkbron: https://www.europarcsdewoudhoeve.nl/faciliteiten. Officiële detailpagina zwembad noemt sluiting vanaf september, polsbandjestoegang en peuter-/kleuterbad. Geen animatieteam; wel Yuki’s speurtocht en een knutselpakket. Verhuur van skelters wordt voor het hoogseizoen genoemd. Geen onbevestigde airtrampoline of binnenzwembad toegevoegd. Escape Box niet geselecteerd voor deze leeftijdsgroep.

Omgeving: Zee Aquarium Bergen aan Zee, De Batavier, strand Egmond aan Zee, Slot op den Hoef, Museum Kranenburgh, De Hoep en een kort duinrondje vanaf ’t Woud. Officiële bezoek-/bronlinks staan per kaart. Bij De Batavier geen vast rooster overgenomen omdat de homepage een losse openingsdatum toont. Duinen: vanaf 18 jaar PWN-duinkaart vereist.

Parkfoto: https://cdn-cms.bookingexperts.com/media/3701/47/optimized.jpg — afkomstig van https://www.europarcs.nl/vakantieparken/de-woudhoeve. Datum van controle: 14 oktober 2026.

## Strandpark Duynhille

Directe link: https://bob6k.github.io/tripplanner/?park=duynhille

13 ideeën: 6 op het park en 7 in de omgeving voor kinderen van 4–7. Indicatieve autoritten maximaal 20 minuten bij normaal verkeer; geen live routeberekening. Strand op circa 700 meter is ook te voet bereikbaar. Bestaande opslag blijft intact en Duynhille krijgt een eigen planning.

Parkbron: https://www.landal.nl/parken/strandpark-duynhille/op-en-rond-het-park. Speeltuin, luchttrampoline, DIY-activiteiten, beachvolleybal, jeu de boules en fietsverhuur bevestigd. Geen kinderfiets-/zitjesbeschikbaarheid of begeleid kinderprogramma aangenomen. Geen eigen zwembad vermeld; de gratis zwemlocatie Kamperland ligt circa 40 minuten weg en is niet opgenomen. Aqua Mundo Port Zélande vraagt een apart dagticket.

Omgeving: De Mèkkerstee, De Flipjes, strand Westerduinen, RTM-tram, A Seal, Aqua Mundo Port Zélande en minigolf bij Houten Kaap (een ander park). Openingstijden en seizoensbeperkingen staan per activiteit, met officiële bronlink. De Flipjes zondag gesloten; RTM alleen op rijdagen.

Parkfoto van de officiële Landal-pagina: https://mss-p-014-delivery.stylelabs.cloud/api/public/content/9511047-3x2?t=w1280. Extern geladen. Controle: 14 oktober 2026.

## Noordwijkse Duinen

Directe link: https://bob6k.github.io/tripplanner/?park=noordwijkse-duinen

13 ideeën voor 4–7 jaar: 6 op het park en 7 daarbuiten met indicatieve autoritten van maximaal 20 minuten bij normaal verkeer. Rijtijden zijn schattingen, zonder parkeren/lopen; controleer de route voor vertrek. De footer opent de aangeleverde Comfort 5-link met oorspronkelijke datums en gastinstellingen (2 volwassenen, 0 kinderen); controleer die zelf bij boeken. Plannerdata worden daardoor niet aangepast.

Bronnen gecontroleerd op 15 oktober 2026. Brondata worden per park weergegeven; de andere parken behouden hun eerdere controledatum.

Op park: speeltuin, airtrampoline, zomerzwembad (gesloten vanaf september), Yuki-speurtocht (programma noemt 6+, jongste heeft ouderhulp nodig), knutselpakket en fietsverhuur inclusief kinderfietsen. Geen vast animatieteam. Bron: https://www.europarcsnoordwijkseduinen.nl/faciliteiten.

Omgeving: KidsZoo (gripsokken verplicht), Space Expo (museum; Space Train vanaf 9 dus uitgesloten), De Dierenhoeve (actuele omleiding en eigen routebeschrijving), Speelzandt, het korte 1,5 km Duinkabouterpad vanaf Langs Berg en Dal, strand Langevelderslag en binnenzwemmen bij Parc du Soleil (gratis voor parkgasten, code bij receptie). Alle officiële links staan in de kaarten. Entree De Dierenhoeve niet bevestigd en daarom als 'Kosten navragen' opgenomen.

Geen Keukenhof-bloementuin als herfstuitje; geen verder gelegen stedelijke musea of attracties buiten de rijtijdselectie opgenomen.

Parkfoto afkomstig van de officiële EuroParcs-pagina: https://cdn-cms.bookingexperts.com/media/3624/41/optimized.jpg.
