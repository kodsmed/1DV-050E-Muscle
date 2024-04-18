# Kundmöte 2024-04-18

## Presenterat innehåll

### 4. Träningspass planering

Träningspass planeringen har implementerats så att användaren nu kan kombinera övningar och skapa individuellt anpassade träningspass.

Förklarat och motiverat förändringarna i databasen.

- Texten "Selected sets" ska ändras till "Selected exercises" - ✅
- Det skall vara möjligt att spara hur många sets (upprepningar) av en övning som skall utföras - ✅
- Det skall vara möjligt att spara hur lång vila som skall vara mellan varje set - ✅
- (önskemål) När träningspasset körs skall vila mellan seten vara en timer som räknar ner
- Utrymmet mellan knapparna för att justera vikt, repetitioner och tid är för litet - ✅
- Exercise skall isället för att ha bodypart och secondary bodypart ha en array av muskelgrupper (muscle groups) som övningen tränar. - ✅

### Liggande issues

- Inga liggande issues

### Begärda ändringar

- Set.sets skall bara ha +/- 1 knappar för att justera antalet set - ✅
- Set.rest_minutes skall spåra sekunder istället för minuter, och ha 10, 30 och 60 som inkrement -  
- Muscle groups skall primärt använda icon_uri för att visa muskelgruppen istället och ha icon_component som fallback i motsats till nuvarande implementation -
- (önskemål) När träningspasset skapas skall det vara möjligt att välja vilka fält i ett set som skall vara synliga -
- (önskemål) Set behöver därför tillåta att fält är null -  

### 5. Träningspass genomförande

Ligger som prio för nästa sprint fölt av visualisering av historisk täningsdata.
Tremor verkar vara en bra kandidat för att visualisera historisk data.
