# AutoSerwis - plan projektu PMAB

## Cel projektu

Projekt to mobilna aplikacja biznesowa dla warsztatu samochodowego. Aplikacja ma pokazac podstawowy proces obslugi klienta: klient dodaje swoje auta, wybiera uslugi i umawia wizyte, a pracownik warsztatu zarzadza wizytami, klientami, autami i uslugami.

Projekt ma byc prosty, ale kompletny pod wymagania z przedmiotu Projektowanie Mobilnych Aplikacji Biznesowych.

## Aktualny stack

- Frontend mobilny: React Native / Expo w katalogu `mobile/`
- Backend: ASP.NET Core Web API na .NET 9 w katalogu `backend/`
- ORM: Entity Framework Core
- Baza danych: Microsoft SQL Server
- Docker: `docker-compose.yml` uruchamia SQL Server
- Repozytorium: jedno repo Git dla calego katalogu `PMAB`

Aktualny stan kodu:

- `backend/` ma Web API, EF Core, automigracje, seeder i endpoint logowania
- `backend/Data/AppDbContext.cs` ma encje: `Customer`, `Employee`, `UserAccount`, `VehicleBrand`, `Vehicle`, `ServiceCategory`, `WorkshopService`
- `backend/Data/DbSeeder.cs` dodaje konta testowe, marki, auta, kategorie uslug i przykladowe uslugi
- `mobile/` ma ekran logowania, wspolny layout, widok aut klienta oraz widoki uslug klienta/pracownika
- `docker-compose.yml` ma kontener SQL Server

## Wymagania projektowe

Projekt powinien spelnic wymagania:

- pelny CRUD dla minimum 10 prostych klas/tabel lub 6 rozbudowanych
- minimum 2-3 relacje 1 do wielu
- minimum jedna relacja wiele do wielu z tabela laczaca
- aplikacja mobilna polaczona z backendem
- dane zapisywane w bazie SQL Server
- mile widziane: Docker, CQRS, dodatkowe uporzadkowanie architektury

## Zakres MVP

Na potrzeby zaliczenia robimy MVP bez nadmiernej komplikacji.

### Tryb klienta

Klient moze:

- przegladac swoje auta
- dodac auto
- edytowac auto
- usunac auto
- przegladac uslugi warsztatu
- umowic wizyte dla wybranego auta
- wybrac jedna lub wiele uslug dla wizyty
- przegladac swoje wizyty
- anulowac wizyte

### Tryb pracownika

Pracownik moze:

- zobaczyc liste wizyt na wybrany dzien
- zobaczyc szczegoly wizyty
- zmienic status wizyty
- zobaczyc liste klientow
- zobaczyc auta danego klienta
- zarzadzac uslugami warsztatu
- dodac notatke do wizyty

## Co celowo pomijamy w MVP

Na tym etapie nie robimy:

- prawdziwego logowania JWT
- platnosci
- faktur i paragonow
- powiadomien push
- zaawansowanego kalendarza
- przypisywania wielu mechanikow do jednej wizyty
- zdjec pojazdow lub uslug

Logowanie w MVP jest proste: `POST /api/auth/login` sprawdza login i haslo zapisane w tabeli `UserAccounts`. Nie ma jeszcze JWT ani hashowania hasel. Rola uzytkownika pochodzi z bazy i decyduje, czy frontend pokazuje panel klienta czy pracownika.

## Proponowany model danych

Projekt powinien miec co najmniej 10 tabel. Aktualny plan zaklada 11 tabel, bo doszla tabela kont logowania:

1. `Customer`
2. `Employee`
3. `UserAccount`
4. `Vehicle`
5. `VehicleBrand`
6. `ServiceCategory`
7. `WorkshopService`
8. `Appointment`
9. `AppointmentService`
10. `AppointmentStatus`
11. `AppointmentNote`

`UserAccount` jest juz dodane jako pierwsza tabela pod logowanie. Pozostale tabele warsztatowe beda dochodzic etapami.

### Customer

Klient warsztatu.

Pola:

- `Id`
- `FirstName`
- `LastName`
- `Email`
- `PhoneNumber`
- `IsActive`

Relacje:

- jeden klient ma wiele aut
- jeden klient ma wiele wizyt

### Employee

Pracownik warsztatu.

Pola:

- `Id`
- `FirstName`
- `LastName`
- `Email`
- `PhoneNumber`
- `IsActive`

Relacje:

- jeden pracownik moze obslugiwac wiele wizyt
- jeden pracownik moze dodac wiele notatek do wizyt

### UserAccount

Konto logowania do aplikacji.

Pola:

- `Id`
- `Login`
- `Password`
- `Role`
- `CustomerId`
- `EmployeeId`
- `IsActive`

Relacje:

- konto klienta wskazuje na `Customer`
- konto pracownika wskazuje na `Employee`
- w MVP haslo jest tekstowe; docelowo mozna je zahashowac

### VehicleBrand

Slownik marek pojazdow.

Pola:

- `Id`
- `Name`
- `IsActive`

Relacje:

- jedna marka ma wiele pojazdow

### Vehicle

Auto klienta.

Pola:

- `Id`
- `CustomerId`
- `VehicleBrandId`
- `Model`
- `Year`
- `RegistrationNumber`
- `Vin`
- `Mileage`
- `IsActive`

Relacje:

- auto nalezy do jednego klienta
- auto ma jedna marke
- auto moze miec wiele wizyt

### ServiceCategory

Kategoria uslug warsztatu.

Pola:

- `Id`
- `Name`
- `Description`
- `IsActive`

Relacje:

- jedna kategoria ma wiele uslug

### WorkshopService

Usluga warsztatu, np. wymiana oleju.

Pola:

- `Id`
- `ServiceCategoryId`
- `Name`
- `Description`
- `BasePrice`
- `EstimatedDurationMinutes`
- `IsActive`

Relacje:

- usluga nalezy do jednej kategorii
- usluga moze wystapic w wielu wizytach przez `AppointmentService`

### AppointmentStatus

Slownik statusow wizyty.

Pola:

- `Id`
- `Name`
- `Code`

Przykladowe statusy:

- `New`
- `Confirmed`
- `InProgress`
- `Completed`
- `Cancelled`

Relacje:

- jeden status moze byc przypisany do wielu wizyt

### Appointment

Wizyta klienta w warsztacie.

Pola:

- `Id`
- `CustomerId`
- `VehicleId`
- `EmployeeId`
- `AppointmentStatusId`
- `ScheduledAt`
- `CreatedAt`
- `CustomerNotes`
- `IsActive`

Relacje:

- wizyta nalezy do jednego klienta
- wizyta dotyczy jednego auta
- wizyta moze byc przypisana do jednego pracownika
- wizyta ma jeden status
- wizyta ma wiele uslug przez `AppointmentService`
- wizyta moze miec wiele notatek

### AppointmentService

Tabela laczaca wizyty i uslugi. Realizuje relacje wiele do wielu.

Pola:

- `Id`
- `AppointmentId`
- `WorkshopServiceId`
- `Price`
- `Notes`

Relacje:

- jedna wizyta ma wiele pozycji uslug
- jedna usluga moze wystapic w wielu wizytach

### AppointmentNote

Notatka pracownika do wizyty.

Pola:

- `Id`
- `AppointmentId`
- `EmployeeId`
- `Content`
- `CreatedAt`

Relacje:

- jedna wizyta ma wiele notatek
- jeden pracownik moze dodac wiele notatek

## Relacje wymagane przez projekt

Relacje 1 do wielu:

- `Customer` 1 -> N `Vehicle`
- `VehicleBrand` 1 -> N `Vehicle`
- `Customer` 1 -> N `Appointment`
- `Vehicle` 1 -> N `Appointment`
- `Employee` 1 -> N `Appointment`
- `ServiceCategory` 1 -> N `WorkshopService`
- `AppointmentStatus` 1 -> N `Appointment`
- `Appointment` 1 -> N `AppointmentNote`

Relacja wiele do wielu:

- `Appointment` N -> N `WorkshopService`
- tabela laczaca: `AppointmentService`

## Backend - plan architektury

Minimalnie backend moze byc zrobiony jako klasyczne REST API:

- `Models/` - encje EF Core
- `Data/AppDbContext.cs` - konfiguracja DbContext
- `Data/DbSeeder.cs` - dane startowe
- `Controllers/` - kontrolery API
- `Dtos/` albo `Contracts/` - request/response DTO
- `Migrations/` - migracje EF Core

Opcjonalnie, jesli bedzie czas, mozna dodac prosty CQRS/MediatR podobnie jak w materialach prowadzacego:

- `Features/<Entity>/Commands`
- `Features/<Entity>/Queries`
- `Features/<Entity>/Handlers`

Priorytetem jest jednak dzialajacy CRUD i relacje, nie rozbudowana architektura.

## Przykladowe endpointy API

Auth:

- `POST /api/auth/login`

Klienci:

- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

Auta:

- `GET /api/vehicles`
- `GET /api/customers/{customerId}/vehicles`
- `GET /api/vehicles/{id}`
- `POST /api/vehicles`
- `PUT /api/vehicles/{id}`
- `DELETE /api/vehicles/{id}`

Uslugi:

- `GET /api/workshop-services`
- `GET /api/workshop-services/{id}`
- `POST /api/workshop-services`
- `PUT /api/workshop-services/{id}`
- `DELETE /api/workshop-services/{id}`
- `GET /api/service-categories`

Wizyty:

- `GET /api/appointments`
- `GET /api/appointments/{id}`
- `GET /api/appointments/by-date?date=YYYY-MM-DD`
- `GET /api/customers/{customerId}/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/{id}`
- `DELETE /api/appointments/{id}`
- `PATCH /api/appointments/{id}/status`

Slowniki:

- `GET /api/vehicle-brands`
- `GET /api/service-categories`
- `GET /api/appointment-statuses`

## Frontend mobile - plan ekranow

Minimalna nawigacja:

- `LoginScreen`
- `CustomerHomeScreen`
- `EmployeeHomeScreen`
- `VehiclesScreen`
- `VehicleFormScreen`
- `ServicesScreen`
- `ServiceFormScreen`
- `AppointmentsScreen`
- `AppointmentFormScreen`
- `AppointmentDetailsScreen`
- `CustomersScreen`
- `CustomerDetailsScreen`

### Schemat plikow frontend

Frontend ma byc dzielony na male pliki, a nie dopisywany w calosci do `App.tsx`.

Obecny kierunek:

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
      EmployeeServicesScreen.tsx
      EmployeeTodayScreen.tsx
      PlaceholderScreen.tsx
    theme.ts
    types.ts
```

Zasady:

- `App.tsx` trzyma stan zalogowanego uzytkownika i aktywnej zakladki.
- `AppLayout.tsx` renderuje stale elementy aplikacji: header, obszar tresci i dolne menu.
- Pliki w `screens/` renderuja tylko body danego widoku, bez wlasnego headera i bez wlasnego dolnego menu.
- Nowa zakladka lub ekran powinny powstawac jako osobny plik w `screens/`.
- Wspolne typy trzymac w `src/types.ts`.
- Wspolne kolory trzymac w `src/theme.ts`.
- Adres API trzymac w `src/config/api.ts`.
- Jezeli ekran zapisuje dane biznesowe, powinien uderzac w backend i baze, a nie zostawac lokalnym mockiem.

### LoginScreen

Logowanie przez API:

- `klient / klient123`
- `pracownik / pracownik123`

Po zalogowaniu frontend dostaje z backendu role `customer` albo `employee` i pokazuje odpowiedni panel. Nie ma juz recznego przelacznika `Klient / Pracownik` w headerze.

### CustomerHomeScreen

Skroty:

- Moje auta
- Moje wizyty
- Umow wizyte
- Uslugi

### CustomerVehiclesScreen

Widok zakladki `Auta`.

Aktualny zakres:

- pobiera auta klienta z `GET /api/customers/{customerId}/vehicles`
- pobiera marki z `GET /api/vehicle-brands`
- pokazuje duzy, wycentrowany przycisk `Dodaj auto`
- pokazuje liste aut klienta
- formularz dodawania auta jest w modalu prawie na caly ekran
- formularz zawiera: marka, model, rok, silnik `Benzyna/Diesel`
- zapis auta idzie przez `POST /api/customers/{customerId}/vehicles`

### CustomerServicesScreen

Widok zakladki `Uslugi` dla klienta.

Aktualny zakres:

- pobiera aktywne uslugi z `GET /api/workshop-services`
- pokazuje nazwe, kategorie, opis, cene i czas trwania
- klient na tym etapie tylko oglada uslugi
- zapis na wizyte bedzie osobnym etapem po dodaniu encji wizyt

### EmployeeServicesScreen

Widok zakladki `Uslugi` dla pracownika.

Aktualny zakres:

- pobiera kategorie z `GET /api/service-categories`
- pobiera uslugi z `GET /api/workshop-services`
- dodaje usluge przez `POST /api/workshop-services`
- edytuje usluge przez `PUT /api/workshop-services/{id}`
- usuwa usluge przez `DELETE /api/workshop-services/{id}`
- usuwanie jest soft delete: backend ustawia `IsActive = false`
- kategorie sa tylko z seedera, pracownik ich nie dodaje

### EmployeeHomeScreen

Skroty:

- Wizyty dzisiaj
- Wizyty wedlug daty
- Klienci
- Uslugi

## Baza danych, migracje i seeder

Baza nie powinna byc przekazywana jako plik `.bak`, `.mdf` ani recznie eksportowana baza.

Docelowy scenariusz dla prowadzacego:

1. Pobiera repozytorium albo ZIP.
2. Uruchamia SQL Server:

```cmd
docker compose up -d
```

3. Uruchamia backend:

```cmd
cd backend
dotnet run
```

4. Backend wykonuje migracje i seed danych startowych.

Backend w development powinien sluchac na:

```text
http://0.0.0.0:5203
```

Dla telefonu w tej samej sieci Expo laczy sie obecnie z:

```text
http://192.168.100.7:5203
```

Jesli zmieni sie adres IP komputera, trzeba zaktualizowac `apiBaseUrl` w `mobile/App.tsx` albo pozniej przeniesc go do konfiguracji.

Kolejnosc w kodzie backendu:

```csharp
db.Database.Migrate();
DbSeeder.Seed(db);
```

Migracje tworza strukture bazy:

- tabele
- kolumny
- klucze glowne
- klucze obce
- relacje
- indeksy

Seeder uzupelnia baze danymi testowymi:

- konto klienta i pracownika
- marki aut
- przykladowe auta klienta
- kategorie uslug
- uslugi warsztatu
- statusy wizyt
- przykladowi klienci
- przykladowi pracownicy
- przykladowe auta
- przykladowe wizyty
- przykladowe uslugi przypisane do wizyt

Seeder musi byc idempotentny, czyli bezpieczny do wielokrotnego uruchomienia. Nie moze dodawac duplikatow po kazdym starcie backendu.

Przykladowa zasada:

```csharp
if (db.Customers.Any())
{
    return;
}
```

Lub lepiej seedowac osobno slowniki i dane biznesowe, sprawdzajac czy dana tabela jest pusta.

## Dane startowe

Przykladowy seed:

UserAccount:

- `klient / klient123` -> `Customer` Jan Kowalski
- `pracownik / pracownik123` -> `Employee` Adam Mechanik

VehicleBrand:

- Toyota
- Volkswagen
- BMW
- Ford
- Opel

ServiceCategory:

- Obsluga okresowa
- Diagnostyka
- Hamulce
- Klimatyzacja

WorkshopService:

- Wymiana oleju
- Wymiana filtrow
- Diagnostyka komputerowa
- Wymiana klockow hamulcowych
- Serwis klimatyzacji

AppointmentStatus:

- Nowa
- Potwierdzona
- W trakcie
- Zakonczona
- Anulowana

Customer:

- Jan Kowalski
- Anna Nowak

Employee:

- Adam Mechanik
- Ewa Doradca

Vehicle:

- Toyota Corolla Jana Kowalskiego
- BMW 3 Jana Kowalskiego

Appointment:

- przykladowa wizyta na dzisiaj
- przykladowa wizyta na jutro

AppointmentService:

- wymiana oleju dla jednej wizyty
- diagnostyka komputerowa dla drugiej wizyty

## Kolejnosc prac

1. Zrobione: SQL Server w Dockerze.
2. Zrobione: automigracje i `DbSeeder`.
3. Zrobione: `Customer`, `Employee`, `UserAccount`.
4. Zrobione: proste logowanie przez `POST /api/auth/login`.
5. Zrobione: ekran logowania w mobile.
6. Zrobione: frontend uporzadkowany na osobny `AppLayout` i pliki `screens`.
7. Zrobione: `Vehicle` i `VehicleBrand` z migracja i seedem.
8. Zrobione: endpointy dla marek i aut klienta.
9. Zrobione: widok klienta `Auta` z lista aut i formularzem dodawania.
10. Zrobione: `ServiceCategory` i `WorkshopService` z migracja i seedem.
11. Zrobione: CRUD uslug dla pracownika i podglad uslug dla klienta.
12. Nastepne: rozbudowac auta do pelnego CRUD, czyli edycja i usuwanie.
13. Nastepne: dodac wizyty i relacje N:N `AppointmentService`.
14. Nastepne: przygotowac README z instrukcja uruchomienia.

## Aktualny status CRUD

Zrobione lub czesciowo zrobione klasy:

- `Customer` - seed i relacja z kontem, bez pelnego CRUD w UI.
- `Employee` - seed i relacja z kontem, bez pelnego CRUD w UI.
- `UserAccount` - proste logowanie, bez panelu zarzadzania kontami.
- `VehicleBrand` - seed i odczyt przez API, bez zarzadzania w UI.
- `Vehicle` - lista i dodawanie auta klienta, brakuje edycji i usuwania.
- `ServiceCategory` - seed i odczyt przez API, kategorie nie sa edytowane przez pracownika.
- `WorkshopService` - pelny CRUD dla pracownika: lista, dodawanie, edycja, soft delete; klient ma podglad.

Najblizszy sensowny krok pod wymaganie CRUD:

- domknac pelny CRUD dla `Vehicle`: edycja i soft delete auta klienta,
- potem dodac `Appointment`, `AppointmentStatus` i `AppointmentService`, zeby spelnic relacje N:N i zapis na usluge.

## Zasady UI

- Nie pokazywac w aplikacji tekstow planistycznych typu "ten widok bedzie dodany pozniej".
- Puste stany maja byc neutralne, np. `Brak uslug do wyswietlenia`.
- Widoki CRUD maja miec normalne akcje uzytkownika: `Dodaj`, `Edytuj`, `Usun`, `Zapisz`, `Zamknij`.
- Przyciski i karty maja zostac w prostym stylu iOS-like, z `borderRadius: 8`.
- Screeny maja byc osobnymi plikami w `mobile/src/screens/`, a layout ma zostac w `mobile/src/layout/AppLayout.tsx`.

## Materialy prowadzacego

Repo z zajec:

- https://github.com/jtjaskulski/PMAB2026Zaoczki

Materialy:

- https://github.com/jtjaskulski/KursReactNativeCQRS
- https://github.com/jtjaskulski/CQRSReactNative

Wazne inspiracje z materialow:

- backend w .NET + EF Core + SQL Server
- Docker dla SQL Server
- React Native jako klient mobilny
- CRUD po REST API
- relacje 1:N
- relacja master-detail / N:N przez tabele laczaca
- opcjonalny CQRS/MediatR

## Zasady dla kolejnych agentow

- Nie komplikowac projektu ponad MVP.
- Najpierw dowiezc dzialajacy CRUD, relacje i zapis w SQL Server.
- Auth/JWT zostawic na koniec albo pominac; obecnie jest proste logowanie przez `UserAccounts`.
- Przy kazdej zmianie danych startowych aktualizowac `backend/Data/DbSeeder.cs`.
- Przy kazdej zmianie struktury bazy dodac migracje EF Core.
- Nie dodawac platnosci, faktur ani push notyfikacji bez wyraznej decyzji.
- Zachowac stack: Expo/React Native + ASP.NET Core Web API + EF Core + SQL Server Docker.
- Baza ma byc odtwarzalna z migracji i seedera.
- Nie wrzucac do repo `node_modules`, `bin`, `obj`, `.expo`, plikow bazy ani lokalnych sekretow.
