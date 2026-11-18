# Jour Tempo

Jour Tempo adds French **EJP days** and **PP peak days** (capacity mechanism) to Gladys, for today and tomorrow, with the days left in the season. As an option, it also adds the EDF Tempo colour with "red tomorrow" and "white tomorrow" alerts. Data comes from the free [jourtempo.fr](https://jourtempo.fr/api/) API, read every 15 minutes: no account, no API key.

## Setup

Tick the data you want: **EJP days** and **PP peak days** are on by default. **Tempo colour** is optional, since Gladys already shows the Tempo colour natively. Then open the **Discovery** tab and add the proposed devices.

## Devices

**Jour Tempo · EJP** (calendar published by EDF, season from November 1 to March 31)

- EJP day today, EJP day tomorrow: 1 on an EJP day, otherwise 0.
- EJP today, EJP tomorrow: readable state ("Jour EJP", "Jour normal", "Pas encore vérifié", "Hors saison").
- EJP days left: out of the 22 of the season.

**Jour Tempo · Jours PP** (signals published by RTE for the capacity mechanism)

- PP day today, PP day tomorrow: 1 on a PP day, otherwise 0.
- PP today, PP tomorrow: readable state, and PP days left in the season.

**Jour Tempo · Tempo** (optional, source RTE)

- Red day today, red day tomorrow, white day tomorrow: 1 or 0.
- Tempo colour today and tomorrow, blue, white and red days left.

## Scene examples

- **Warn the day before an EJP day**: trigger "EJP day tomorrow" becomes 1, action: send a message.
- **Shed load on an EJP day**: at 7 am, condition "EJP day today" equals 1, action: lower the heating.

## Outages

Every API file carries a validity date. If jourtempo.fr stops answering, the integration keeps the last answer. Once the validity date has passed, binary sensors go to 0 and texts to "Inconnu" (unknown) instead of showing an old value, so a scene never fires on stale data.

## Sources

EJP days: calendar published by EDF. PP days: signals published by RTE. Tempo colour: RTE. Collected and published by [Jour Tempo](https://jourtempo.fr/), an independent service with no link to EDF or RTE.
