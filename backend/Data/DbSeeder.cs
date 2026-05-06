using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        SeedCustomerAccount(db);
        SeedEmployeeAccount(db);
        SeedVehicleBrands(db);
        SeedCustomerVehicles(db);
        SeedServiceCategories(db);
        SeedWorkshopServices(db);
    }

    private static void SeedCustomerAccount(AppDbContext db)
    {
        if (db.UserAccounts.Any(account => account.Login == "klient"))
        {
            return;
        }

        var customer = new Customer
        {
            FirstName = "Jan",
            LastName = "Kowalski",
            Email = "jan.kowalski@example.com",
            PhoneNumber = "500100200"
        };

        db.Customers.Add(customer);
        db.SaveChanges();

        db.UserAccounts.Add(new UserAccount
        {
            Login = "klient",
            Password = "klient123",
            Role = UserRole.Customer,
            CustomerId = customer.Id
        });

        db.SaveChanges();
    }

    private static void SeedEmployeeAccount(AppDbContext db)
    {
        if (db.UserAccounts.Any(account => account.Login == "pracownik"))
        {
            return;
        }

        var employee = new Employee
        {
            FirstName = "Adam",
            LastName = "Mechanik",
            Email = "adam.mechanik@example.com",
            PhoneNumber = "500300400"
        };

        db.Employees.Add(employee);
        db.SaveChanges();

        db.UserAccounts.Add(new UserAccount
        {
            Login = "pracownik",
            Password = "pracownik123",
            Role = UserRole.Employee,
            EmployeeId = employee.Id
        });

        db.SaveChanges();
    }

    private static void SeedVehicleBrands(AppDbContext db)
    {
        var brandNames = new[] { "Toyota", "Volkswagen", "BMW", "Ford", "Opel" };

        foreach (var brandName in brandNames)
        {
            if (db.VehicleBrands.Any(brand => brand.Name == brandName))
            {
                continue;
            }

            db.VehicleBrands.Add(new VehicleBrand
            {
                Name = brandName
            });
        }

        db.SaveChanges();
    }

    private static void SeedCustomerVehicles(AppDbContext db)
    {
        var customer = db.UserAccounts
            .Include(account => account.Customer)
            .FirstOrDefault(account => account.Login == "klient")
            ?.Customer;

        if (customer is null || db.Vehicles.Any(vehicle => vehicle.CustomerId == customer.Id))
        {
            return;
        }

        var toyota = db.VehicleBrands.First(brand => brand.Name == "Toyota");
        var bmw = db.VehicleBrands.First(brand => brand.Name == "BMW");

        db.Vehicles.AddRange(
            new Vehicle
            {
                CustomerId = customer.Id,
                VehicleBrandId = toyota.Id,
                Model = "Corolla",
                Year = 2019,
                EngineType = "Benzyna"
            },
            new Vehicle
            {
                CustomerId = customer.Id,
                VehicleBrandId = bmw.Id,
                Model = "3",
                Year = 2021,
                EngineType = "Diesel"
            });

        db.SaveChanges();
    }

    private static void SeedServiceCategories(AppDbContext db)
    {
        var categories = new[]
        {
            new ServiceCategory { Name = "Obsluga okresowa", Description = "Podstawowe czynnosci serwisowe." },
            new ServiceCategory { Name = "Diagnostyka", Description = "Sprawdzenie usterek i diagnostyka komputerowa." },
            new ServiceCategory { Name = "Hamulce", Description = "Serwis ukladu hamulcowego." },
            new ServiceCategory { Name = "Klimatyzacja", Description = "Obsluga ukladu klimatyzacji." },
            new ServiceCategory { Name = "Elektryka", Description = "Diagnostyka i naprawy instalacji elektrycznej." }
        };

        foreach (var category in categories)
        {
            if (db.ServiceCategories.Any(existingCategory => existingCategory.Name == category.Name))
            {
                continue;
            }

            db.ServiceCategories.Add(category);
        }

        db.SaveChanges();
    }

    private static void SeedWorkshopServices(AppDbContext db)
    {
        if (db.WorkshopServices.Any())
        {
            return;
        }

        var periodic = db.ServiceCategories.First(category => category.Name == "Obsluga okresowa");
        var diagnostics = db.ServiceCategories.First(category => category.Name == "Diagnostyka");
        var brakes = db.ServiceCategories.First(category => category.Name == "Hamulce");
        var airConditioning = db.ServiceCategories.First(category => category.Name == "Klimatyzacja");

        db.WorkshopServices.AddRange(
            new WorkshopService
            {
                ServiceCategoryId = periodic.Id,
                Name = "Wymiana oleju",
                Description = "Wymiana oleju silnikowego wraz z filtrem oleju.",
                BasePrice = 199.99m,
                EstimatedDurationMinutes = 60
            },
            new WorkshopService
            {
                ServiceCategoryId = periodic.Id,
                Name = "Wymiana filtrow",
                Description = "Wymiana filtra powietrza, kabinowego i paliwa.",
                BasePrice = 149.99m,
                EstimatedDurationMinutes = 45
            },
            new WorkshopService
            {
                ServiceCategoryId = diagnostics.Id,
                Name = "Diagnostyka komputerowa",
                Description = "Odczyt bledow i podstawowa analiza parametrow pracy pojazdu.",
                BasePrice = 120.00m,
                EstimatedDurationMinutes = 30
            },
            new WorkshopService
            {
                ServiceCategoryId = brakes.Id,
                Name = "Wymiana klockow hamulcowych",
                Description = "Wymiana kompletu klockow hamulcowych na jednej osi.",
                BasePrice = 249.99m,
                EstimatedDurationMinutes = 90
            },
            new WorkshopService
            {
                ServiceCategoryId = airConditioning.Id,
                Name = "Serwis klimatyzacji",
                Description = "Sprawdzenie szczelnosci i uzupelnienie czynnika klimatyzacji.",
                BasePrice = 299.99m,
                EstimatedDurationMinutes = 75
            });

        db.SaveChanges();
    }
}
