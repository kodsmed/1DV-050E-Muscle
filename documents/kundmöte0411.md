# Kundmöte 2024-04-11

## Presenterat innehåll

### 1. Registrering av användare

Det reviderade registrerings förfarandet för nya användare gicks igenom där en informations sida skapades för att informera användaren om att den måste verifiera sin e-postadress. När användaren bekräftar sin e-postadress så omdirigeras användaren till inloggningssidan.

### Liggande issues

- Dataskydds förordningar behöver implementeras (Research om Australian Privacy Principle behövs)

### Begärda ändringar

- Inga föreslagna ändringar

### 2. Inloggning och säker routing

All trafik som inte går till / eller /login blir nu omdirigerad till /login. Detta för att säkerställa att användaren är inloggad innan den får tillgång till sidan.

### Liggande issues

- Inga liggande issues

### Begärda ändringar

- Inga föreslagna ändringar

### 3. Användarprofil

Användarprofilen har uppdaterats efter de nya kraven som ställts om att inkludera användarens namn och avatar.

### Liggande issues

- Inga liggande issues

### Begärda ändringar

- Inga föreslagna ändringar

### 4. Träningspass planering

Träningspass planeringen har implementerats så att användaren nu kan kombinera övningar och skapa individuellt anpassade träningspass.

### Liggande issues

- Inga liggande issues

### Begärda ändringar

- Texten "Selected sets" ska ändras till "Selected exercises" - ✅
- Det skall vara möjligt att spara hur många sets (upprepningar) av en övning som skall utföras - ✅
- Det skall vara möjligt att spara hur lång vila som skall vara mellan varje set - ✅
- (önskemål) När träningspasset körs skall vila mellan seten vara en timer som räknar ner
- Utrymmet mellan knapparna för att justera vikt, repetitioner och tid är för litet - ✅
- Exercise skall isället för att ha bodypart och secondary bodypart ha en array av muskelgrupper (muscle groups) som övningen tränar. - ✅