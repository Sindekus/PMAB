# AutoSerwis PMAB

Mobilna aplikacja biznesowa dla warsztatu samochodowego.

Stack:

- React Native / Expo
- ASP.NET Core Web API .NET 9
- Entity Framework Core
- SQL Server w Dockerze

## Wymagania

- Docker Desktop
- .NET 9 SDK
- Node.js / npm
- Expo Go albo emulator Android

## Uruchomienie bazy danych

W katalogu glownym projektu:

```cmd
docker compose up -d
```

SQL Server startuje na porcie:

```text
1433
```

Backend sam utworzy baze `WorkshopDb`, wykona migracje i doda dane startowe z seedera.

## Uruchomienie backendu

```cmd
cd backend
dotnet run --urls http://0.0.0.0:5203
```

API bedzie dostepne pod:

```text
http://localhost:5203
```

Przy starcie backend wykonuje:

```text
db.Database.Migrate()
DbSeeder.Seed(db)
```

## Uruchomienie aplikacji mobilnej

Pierwsze uruchomienie po sklonowaniu repo:

```cmd
cd mobile
npm install
npx expo start
```

Potem mozna uruchomic aplikacje w Expo Go albo na emulatorze.

## Adres API dla telefonu

Adres API jest ustawiony w:

```text
mobile/src/config/api.ts
```

Dla telefonu w tej samej sieci trzeba ustawic IP komputera, np.:

```text
http://192.168.100.7:5203
```

Jesli IP komputera sie zmieni, trzeba zaktualizowac ten plik.

## Konta testowe

Klient:

```text
login: klient
haslo: klient123
```

Pracownik:

```text
login: pracownik
haslo: pracownik123
```

## Aktualne funkcje

Klient:

- logowanie
- lista aut
- dodawanie auta
- podglad uslug warsztatu
- statyczny widok wizyt

Pracownik:

- logowanie
- lista uslug
- dodawanie uslugi
- edycja uslugi
- soft delete uslugi
- statyczny widok wizyt dzisiaj

## Przydatne komendy

Sprawdzenie backendu:

```cmd
cd backend
dotnet build
```

Sprawdzenie frontendu:

```cmd
cd mobile
npx tsc --noEmit
```

Status kontenerow:

```cmd
docker compose ps
```

Zatrzymanie kontenerow:

```cmd
docker compose down
```
