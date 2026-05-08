# AutoSerwis PMAB

Mobilna aplikacja biznesowa dla warsztatu samochodowego. Klient zarzadza swoimi autami, uslugami i wizytami, pracownik zarzadza wizytami, klientami, slownikami i zespolem.

## Stack

- React Native / Expo (TypeScript)
- ASP.NET Core Web API na .NET 9
- Entity Framework Core
- SQL Server w Dockerze
- Docker compose dla bazy i backendu

## Wymagania

- Docker Desktop
- .NET 9 lub nowszy SDK (do lokalnego `dotnet run`, w Dockerze nie jest potrzebny)
- Node.js i npm (Node 20+ powinien starczyc)
- Expo Go na telefonie lub emulator Android

## Szybki start

W katalogu glownym projektu:

```cmd
docker compose up --build -d
```

Compose buduje obraz backendu, stawia SQL Server, czeka az baza odpowie, potem startuje API. Backend przy starcie wykonuje migracje i odpala seeder, wiec po kilkudziesieciu sekundach baza ma juz dane testowe.

API jest dostepne pod:

```text
http://localhost:5203
http://<ip-twojego-kompa>:5203
```

Drugi adres jest tym, ktorego uzywa telefon w tej samej sieci Wi-Fi.

W osobnym oknie:

```cmd
cd mobile
npm install
npm start
```

Potem zeskanuj QR w Expo Go albo wcisnij `a` zeby otworzyc emulator Androida.

## Adres API w mobilce

Plik `mobile/src/config/api.ts` sam wykrywa IP komputera dewelopera z `Constants.expoConfig.hostUri` (Expo i tak musi to znac, zeby telefon pobral bundle). Nie trzeba podmieniac IP recznie po przeniesieniu projektu na inny komputer ani po zmianie sieci.

W przegladarce na komputerze (`Platform.OS === 'web'`) uzywany jest `localhost:5203`.

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

Logowanie w MVP jest proste: API porownuje login i haslo z tabela `UserAccounts`, bez JWT i bez hashowania. Rola z bazy decyduje, ktory panel pokazuje aplikacja.

## Funkcje aplikacji

Klient:

- logowanie
- auta: lista, dodawanie, edycja, usuwanie (soft delete)
- uslugi: podglad oferty warsztatu
- wizyty: lista wlasnych wizyt, umawianie wizyty (auto, zestaw uslug, termin, uwagi), anulowanie

Pracownik:

- logowanie
- wizyty: lista na dzis / jutro / dowolny dzien, drill-down do szczegolow, zmiana statusu, dodawanie i usuwanie pozycji uslug, dodawanie i usuwanie notatek
- klienci: lista, dodawanie, edycja, usuwanie, drill-down do szczegolow z autami i historia wizyt
- uslugi: pelny CRUD (lista, dodawanie, edycja, soft delete)
- slowniki: marki aut, kategorie uslug, zespol pracownikow - wszedzie pelny CRUD

## Model bazy

11 tabel:

- `Customer`
- `Employee`
- `UserAccount`
- `VehicleBrand`
- `Vehicle`
- `ServiceCategory`
- `WorkshopService`
- `AppointmentStatus`
- `Appointment`
- `AppointmentService` (tabela laczaca dla relacji N:N miedzy `Appointment` a `WorkshopService`)
- `AppointmentNote`

Relacje 1:N:

- `Customer` -> `Vehicle`
- `Customer` -> `Appointment`
- `Customer` -> `UserAccount`
- `Employee` -> `Appointment`
- `Employee` -> `AppointmentNote`
- `Employee` -> `UserAccount`
- `VehicleBrand` -> `Vehicle`
- `Vehicle` -> `Appointment`
- `ServiceCategory` -> `WorkshopService`
- `AppointmentStatus` -> `Appointment`
- `Appointment` -> `AppointmentNote`

Relacja N:N:

- `Appointment` <-> `WorkshopService` przez `AppointmentService`

Wszystkie testowe dane sa w `backend/Data/DbSeeder.cs` i sa dorzucane idempotentnie.

## Co dziala lokalnie bez Dockera

Backend mozna takze odpalic natywnie:

```cmd
cd backend
dotnet run --launch-profile http
```

Wtedy connection string z `appsettings.json` celuje w `localhost,1433`. SQL Server musi byc wystartowany osobno (`docker compose up sqlserver -d`).

## Przydatne komendy

Logi backendu w kontenerze:

```cmd
docker compose logs -f backend
```

Stan kontenerow:

```cmd
docker compose ps
```

Zatrzymanie wszystkiego (dane w volumenie zostaja):

```cmd
docker compose down
```

Sprawdzenie typow w mobilce:

```cmd
cd mobile
npx tsc --noEmit
```

Sprawdzenie kompilacji backendu:

```cmd
cd backend
dotnet build
```

## Co celowo zostalo poza zakresem

- prawdziwe logowanie z JWT
- hashowanie hasel
- platnosci, faktury, paragony
- powiadomienia push
- zaawansowany kalendarz
- zdjecia pojazdow lub uslug
