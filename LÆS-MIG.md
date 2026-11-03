# kenhermann.dk – sådan kommer sitet online

Mappen indeholder hele sitet. `public/` er selve hjemmesiden, og `api/checkout.js` sender kunden til Stripes betalingsside.
Priserne tjekkes på serveren ud fra `api/catalog.json`, så ingen kan ændre dem i browseren.

## 1. Opret Stripe (ca. 15 min)
1. Opret en konto på stripe.com. Vælg Danmark og "Enkeltmandsvirksomhed", og brug CVR 32719678.
2. Udfyld bankkonto og ID, så Stripe kan udbetale til dig.
3. Gå til **Developers → API keys** og kopiér din **Secret key**. Start med test-nøglen (`sk_test_…`) og skift til den rigtige (`sk_live_…`), når alt virker.
4. Under **Settings → Public details** indsæt linket til handelsbetingelserne: `https://kenhermann.dk/#terms`.

## 2. Læg filerne på GitHub (ca. 5 min)
1. På github.com: **New repository** → navn `kenhermann-site` → Private → Create.
2. Klik **uploading an existing file** og træk *indholdet* af denne mappe ind (mapperne `public` og `api` og filerne `package.json`, `vercel.json` og `.gitignore`).
3. Klik **Commit changes**.

## 3. Forbind til Vercel (ca. 5 min)
1. På vercel.com: **Add New → Project** → vælg `kenhermann-site` → **Import**.
2. Åbn **Environment Variables** og tilføj:
   - Name: `STRIPE_SECRET_KEY`
   - Value: din Stripe secret key
3. Klik **Deploy**. Du får et link som `kenhermann-site.vercel.app`, hvor du kan teste sitet.

## 4. Test et køb
Med test-nøglen kan du betale med kortnummer `4242 4242 4242 4242`, en dato i fremtiden og en vilkårlig CVC.
Ordren dukker op i Stripe under **Payments**, og du får en mail fra Stripe.

## 5. Flyt kenhermann.dk over (ca. 10 min + ventetid)
1. I Vercel: **Project → Settings → Domains** → tilføj `kenhermann.dk` og `www.kenhermann.dk`.
2. Vercel viser de DNS-indstillinger, du skal bruge (typisk en A-record og en CNAME).
3. Log ind hos din domæneudbyder (fx one.com, Simply eller GoDaddy) og indtast dem.
4. Efter 10 minutter til et par timer peger domænet på det nye site. Dit gamle WordPress-site kører, indtil du skifter.

## 6. Til sidst
- Skift Stripe-nøglen i Vercel fra `sk_test_…` til `sk_live_…`, og deploy igen.
- Slå e-mailkvitteringer til i Stripe under **Settings → Customer emails**.

## Når noget skal ændres
Rettelser sker i `public/index.html` og `api/catalog.json`. Når en ny version uploades til GitHub, opdaterer Vercel sitet automatisk på 1–2 minutter.
Husk at rette priser **begge steder**: i `index.html` (det kunden ser) og i `api/catalog.json` (det kunden betaler).

## Ikke med i denne version
- **Oplag tæller ikke ned af sig selv.** Når et print er solgt, skal "left"-tallet rettes manuelt.
- **Nyhedsbrevet er slået fra**, indtil det kobles til fx Mailchimp. Slå det til ved at ændre `NEWSLETTER_ENABLED=false` til `true` i toppen af `index.html`, når det er koblet på.
- **Billederne er i webstørrelse**, fra chatten. Udskift gerne med skarpere versioner i samme filnavne.
