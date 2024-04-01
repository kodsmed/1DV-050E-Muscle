# Muscle

## 1. Funktionella krav

Funktionella krav är av sådan art att de kan testas och verifieras. De beskriver vad systemet skall göra, inte hur det skall göras.
Förenklat kan funktionella krav beskrivas som "features/funktioner" systemet skall ha efter färdigställande.

- Användare skall kunna registrera sig i systemet och logga in, antingen med användarnamn och lösenord eller med Google-konto.

- Åtkomst måste kunna regleras. Initialt skall det finnas två roller, administratör och användare.

- Gym övningar skall kunna registreras i systemet.

- Gym övningar skall kunna kopplas till ett träningspass.

- Utförda träningspass skall kunna registreras i systemet.

- Utförda övningar skall kunna kopplas till ett träningspass.

- Träningspass skall kunna kopplas till en användare.

## 2. Ickefunktionella produktkrav (non-functional product requirements)

Ickefunktionella krav, i kontrast till funktionella krav, är restriktioner på hur kraven skall uppfyllas.
De beskriver egenskaper som systemets kodbas skall ha efter färdigställande.

- Applikationen skall följa The one true brace style (1TBS) kod-standard.
function foo(bar: boolean): boolean {
  if (bar) {
    return true;
  }
  return false;
}

- Applikationen skall genom god dokumentation vara enkel att vidareutveckla och underhålla.

## 3. Organisationskrav (non-functional organizational requirements)

Organisationskrav är krav är ickefunktionella krav, men som kanske inte är relaterade till produkten eller dess kod. De beskriver hur projektet skall organiseras och genomföras. De innefattar väldigt övergripande krav som genomsyrar hela projektet och dess hur arbetet bedriv i det.

- Applikationen skall vara förberedd för framtida vidareutveckling.

- Applikationen skall skrivas i TypeScript.

- Designprincipen Atomic Design skall användas för att strukturera komponenter.

### 3.1 Versionshantering

Git. Det finns bara en branch, main till vilken pull requests skapas och mergas efter Review från beställaren.

### 3.2 Kodstandard

- Projektet kommer använda 1TBS kodstandard.

### 3.3 Koddokumentation

- Projektet kommer dokumenteras i kod och med JSdoc där det är lämpligt.

## 4. Externa krav (non-functional external requirements)

### 4.1 Etiska krav

Är det moraliskt försvarbart att skapa den applikation du tänker dig skapa?

> Ja, inga moraliska eller juridiska hinder föreligger.

Finns det någon individ som kan komma till skada fysiskt eller känslomässigt av din applikation:

> En användare som tränar felaktigt kan skada sig fysiskt. Detta är dock inte en konsekvens av applikationen utan av användarens handlingar i samband med träning, vilket inte kan förhindras av applikationen. Användaren kan dock få en felaktig uppfattning om sin träning om applikationen inte fungerar korrekt. Detta kan förhindras genom att applikationen testas och utvärderas noggrant. Tanken med applikationen är att öka användarens förståelse för sin träning och därmed minska risken för skador.

Vad kan hända om applikationen brister i funktion?

> Användaren kan få en felaktig uppfattning om sin träning.

Vad kan hända om applikationen brister i säkerhet?

> Användare kan få obehörig åtkomst till applikationen och dess data. Detta kan förhindras genom att applikationen testas och utvärderas noggrant. Åtkomst till applikationen måste därför begränsas och konton hanteras på lämpligt sätt.

Finns det miljö eller samhälleliga aspekter som bör beaktas?

> Den senaste folkhälsotrenden är en minskning av fysisk aktivitet. Applikationen kan bidra till att öka användarens fysiska aktivitet och därmed förbättra deras hälsa. Detta kan dock inte garanteras och det är upp till användaren att använda applikationen på ett sätt som gynnar deras hälsa.

### 4.2 Lagar & Standarder

> Konton kommer att vara baserade på email adresser, och vad än namn användaren anger. Användarens träningsdata kommer att sparas i en databas.
Användaren kommer i enlighet med dataskyddsförordningen GDPR informeras om att kontot sparas och hur det tas bort vid registrering, alla användare kommer ha möjlighet att ta bort sitt eget konto via sin profil.

|              |                                          |
|--------------|------------------------------------------|
|Samråd med: | Max Karlsson, 2024-03-28  |
