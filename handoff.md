# Handoff - sesja implementacyjna AutoSerwis

## Cel tej sesji

W tej sesji projekt przeszedl ze szkieletu do dzialajacego MVP z:

- logowaniem z bazy,
- automigracjami i seederem,
- podstawowym layoutem aplikacji mobilnej,
- zakladka `Auta` klienta,
- zakladka `Uslugi` klienta,
- zakladka `Uslugi` pracownika z CRUD.

Ten plik jest dla kolejnych agentow, zeby szybko zrozumieli, co bylo robione i jak kontynuowac bez rozbijania ustalonej struktury.

## Aktualny stack

- Backend: ASP.NET Core Web API, .NET 9, EF Core, SQL Server.
- Frontend: Expo / React Native / TypeScript.
- Baza: SQL Server w Dockerze z `docker-compose.yml`.
- Repo: jedno repo dla calego katalogu `PMAB`.

## Uruchamianie

SQL Server:

```cmd
docker compose up -d
```

Backend:

```cmd
cd backend
dotnet run --urls http://0.0.0.0:5203
```

Mobile:

```cmd
cd mobile
npx expo start
```

Adres API dla aplikacji mobilnej jest w:

```text
mobile/src/config/api.ts
```

Obecnie dla telefonu/emulatora ustawiony jest:

```text
http://192.168.100.7:5203
```

Jesli zmieni sie IP komputera, trzeba zaktualizowac ten plik.

## Logowanie

Logowanie jest proste, bez JWT i bez hashowania hasel.

Endpoint:

```text
POST /api/auth/login
```

Konta seed:

```text
klient / klient123
pracownik / pracownik123
```

Rola z backendu decyduje, ktory panel widzi frontend:

- `customer` -> panel klienta,
- `employee` -> panel pracownika.

## Backend - co dodano

Modele:

- `Customer`
- `Employee`
- `UserAccount`
- `UserRole`
- `VehicleBrand`
- `Vehicle`
- `ServiceCategory`
- `WorkshopService`

Kontrolery:

- `AuthController`
- `VehicleBrandsController`
- `VehiclesController`
- `ServiceCategoriesController`
- `WorkshopServicesController`

Migracje:

- `InitialAccounts`
- `AddVehicles`
- `AddWorkshopServices`

Seeder:

```text
backend/Data/DbSeeder.cs
```

Seeder dodaje:

- konto klienta,
- konto pracownika,
- marki aut,
- auta klienta,
- kategorie uslug,
- przykladowe uslugi.

Zasada: przy kazdej zmianie danych startowych aktualizowac `DbSeeder.cs`.

## Aktualne endpointy

Auth:

```text
POST /api/auth/login
```

Marki aut:

```text
GET /api/vehicle-brands
```

Auta klienta:

```text
GET /api/customers/{customerId}/vehicles
POST /api/customers/{customerId}/vehicles
```

Kategorie uslug:

```text
GET /api/service-categories
```

Uslugi warsztatu:

```text
GET /api/workshop-services
GET /api/workshop-services/{id}
POST /api/workshop-services
PUT /api/workshop-services/{id}
DELETE /api/workshop-services/{id}
```

`DELETE /api/workshop-services/{id}` robi soft delete przez `IsActive = false`.

## Frontend - struktura

Nie dopisywac kolejnych ekranow bezposrednio do `App.tsx`.

Obecna struktura:

```text
mobile/
  App.tsx
  src/
    config/
      api.ts
    layout/
      AppLayout.tsx
    screens/
      LoginScreen.tsx
      CustomerAppointmentsScreen.tsx
      CustomerVehiclesScreen.tsx
      CustomerServicesScreen.tsx
      EmployeeTodayScreen.tsx
      EmployeeServicesScreen.tsx
      PlaceholderScreen.tsx
    theme.ts
    types.ts
```

Zasady:

- `App.tsx` zarzadza zalogowanym uzytkownikiem i aktywna zakladka.
- `AppLayout.tsx` renderuje staly header, body i dolne menu.
- Ekrany w `screens/` renderuja tylko body.
- Typy wspolne sa w `src/types.ts`.
- Kolory wspolne sa w `src/theme.ts`.
- Adres API jest w `src/config/api.ts`.

## Widoki klienta

Klient ma zakladki:

- `Auta`
- `Wizyty`
- `Uslugi`

Zrobione:

- `Auta`: lista aut z bazy i dodawanie auta.
- `Uslugi`: lista uslug z bazy, tylko podglad.
- `Wizyty`: statyczny widok wizyt, jeszcze bez backendu.

Braki:

- edycja auta,
- usuwanie auta,
- prawdziwe wizyty z bazy,
- zapis klienta na usluge.

## Widoki pracownika

Pracownik ma zakladki:

- `Dzisiaj`
- `Klienci`
- `Uslugi`

Zrobione:

- `Uslugi`: lista, dodawanie, edycja i soft delete uslug.
- `Dzisiaj`: statyczny widok harmonogramu.

Braki:

- realne wizyty z bazy,
- lista klientow z bazy,
- zarzadzanie statusem wizyty.

## Zasady UI

- Nie pokazywac w aplikacji tekstow typu "ten widok bedzie dodany pozniej".
- Puste stany maja byc neutralne, np. `Brak uslug do wyswietlenia`.
- Nie dawac komentarzy w kodzie, jesli nie sa konieczne.
- Trzymac prosty styl iOS-like.
- `borderRadius` dla kart i przyciskow: `8`.
- Bez przesadnych gradientow, ozdobnikow i marketingowych ekranow.

## Weryfikacja wykonana w tej sesji

Backend:

```cmd
dotnet build
```

Frontend:

```cmd
npx tsc --noEmit
```

Sprawdzone endpointy:

- logowanie klienta i pracownika,
- lista marek aut,
- lista aut klienta,
- lista kategorii uslug,
- lista uslug,
- POST/PUT/DELETE uslugi na tymczasowym rekordzie.

## Najblizsze kroki

Najbardziej logiczna kontynuacja:

1. Domknac pelny CRUD dla `Vehicle`:
   - `PUT /api/customers/{customerId}/vehicles/{id}`,
   - `DELETE /api/customers/{customerId}/vehicles/{id}` jako soft delete,
   - edycja i usuwanie w `CustomerVehiclesScreen`.
2. Dodac wizyty:
   - `AppointmentStatus`,
   - `Appointment`,
   - `AppointmentService`,
   - relacja N:N: `Appointment` <-> `WorkshopService`.
3. Zrobic zapis klienta na usluge/wizyte.
4. Podmienic statyczne widoki wizyt na dane z backendu.
5. Przygotowac `README.md` z instrukcja uruchomienia.
