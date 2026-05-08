using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        SeedCustomerAccount(db);
        SeedSecondaryCustomer(db);
        SeedEmployeeAccount(db);
        SeedSecondaryEmployee(db);
        SeedVehicleBrands(db);
        SeedCustomerVehicles(db);
        SeedSecondaryCustomerVehicles(db);
        SeedServiceCategories(db);
        SeedWorkshopServices(db);
        SeedAppointmentStatuses(db);
        SeedAppointments(db);
        SeedAppointmentNotes(db);
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

    private static void SeedSecondaryCustomer(AppDbContext db)
    {
        if (db.Customers.Any(customer => customer.Email == "anna.nowak@example.com"))
        {
            return;
        }

        db.Customers.Add(new Customer
        {
            FirstName = "Anna",
            LastName = "Nowak",
            Email = "anna.nowak@example.com",
            PhoneNumber = "500200300"
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

    private static void SeedSecondaryEmployee(AppDbContext db)
    {
        if (db.Employees.Any(employee => employee.Email == "ewa.doradca@example.com"))
        {
            return;
        }

        db.Employees.Add(new Employee
        {
            FirstName = "Ewa",
            LastName = "Doradca",
            Email = "ewa.doradca@example.com",
            PhoneNumber = "500400500"
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

    private static void SeedSecondaryCustomerVehicles(AppDbContext db)
    {
        var customer = db.Customers.FirstOrDefault(c => c.Email == "anna.nowak@example.com");

        if (customer is null || db.Vehicles.Any(v => v.CustomerId == customer.Id))
        {
            return;
        }

        var volkswagen = db.VehicleBrands.First(brand => brand.Name == "Volkswagen");

        db.Vehicles.Add(new Vehicle
        {
            CustomerId = customer.Id,
            VehicleBrandId = volkswagen.Id,
            Model = "Golf",
            Year = 2018,
            EngineType = "Benzyna"
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

    private static void SeedAppointmentStatuses(AppDbContext db)
    {
        var statuses = new[]
        {
            new AppointmentStatus { Code = "New", Name = "Nowa", SortOrder = 1 },
            new AppointmentStatus { Code = "Confirmed", Name = "Potwierdzona", SortOrder = 2 },
            new AppointmentStatus { Code = "InProgress", Name = "W trakcie", SortOrder = 3 },
            new AppointmentStatus { Code = "Completed", Name = "Zakonczona", SortOrder = 4 },
            new AppointmentStatus { Code = "Cancelled", Name = "Anulowana", SortOrder = 5 }
        };

        foreach (var status in statuses)
        {
            if (db.AppointmentStatuses.Any(s => s.Code == status.Code))
            {
                continue;
            }

            db.AppointmentStatuses.Add(status);
        }

        db.SaveChanges();
    }

    private static void SeedAppointments(AppDbContext db)
    {
        if (db.Appointments.Any())
        {
            return;
        }

        var jan = db.Customers.FirstOrDefault(c => c.Email == "jan.kowalski@example.com");
        var anna = db.Customers.FirstOrDefault(c => c.Email == "anna.nowak@example.com");
        var adam = db.Employees.FirstOrDefault(e => e.Email == "adam.mechanik@example.com");
        var ewa = db.Employees.FirstOrDefault(e => e.Email == "ewa.doradca@example.com");

        if (jan is null || anna is null || adam is null || ewa is null)
        {
            return;
        }

        var janToyota = db.Vehicles.FirstOrDefault(v => v.CustomerId == jan.Id && v.Model == "Corolla");
        var janBmw = db.Vehicles.FirstOrDefault(v => v.CustomerId == jan.Id && v.Model == "3");
        var annaGolf = db.Vehicles.FirstOrDefault(v => v.CustomerId == anna.Id && v.Model == "Golf");

        if (janToyota is null || janBmw is null || annaGolf is null)
        {
            return;
        }

        var oilChange = db.WorkshopServices.First(s => s.Name == "Wymiana oleju");
        var diagnostics = db.WorkshopServices.First(s => s.Name == "Diagnostyka komputerowa");
        var filterChange = db.WorkshopServices.First(s => s.Name == "Wymiana filtrow");

        var statusConfirmed = db.AppointmentStatuses.First(s => s.Code == "Confirmed");
        var statusInProgress = db.AppointmentStatuses.First(s => s.Code == "InProgress");
        var statusNew = db.AppointmentStatuses.First(s => s.Code == "New");

        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var firstAppointment = new Appointment
        {
            CustomerId = jan.Id,
            VehicleId = janToyota.Id,
            EmployeeId = adam.Id,
            AppointmentStatusId = statusConfirmed.Id,
            ScheduledAt = today.AddHours(9),
            CreatedAt = DateTime.UtcNow,
            CustomerNotes = "Prosze rowniez sprawdzic poziom plynow.",
            Services =
            {
                new AppointmentService
                {
                    WorkshopServiceId = oilChange.Id,
                    Price = oilChange.BasePrice
                }
            }
        };

        var secondAppointment = new Appointment
        {
            CustomerId = anna.Id,
            VehicleId = annaGolf.Id,
            EmployeeId = ewa.Id,
            AppointmentStatusId = statusInProgress.Id,
            ScheduledAt = today.AddHours(11).AddMinutes(30),
            CreatedAt = DateTime.UtcNow,
            Services =
            {
                new AppointmentService
                {
                    WorkshopServiceId = diagnostics.Id,
                    Price = diagnostics.BasePrice
                }
            }
        };

        var thirdAppointment = new Appointment
        {
            CustomerId = jan.Id,
            VehicleId = janBmw.Id,
            EmployeeId = adam.Id,
            AppointmentStatusId = statusNew.Id,
            ScheduledAt = tomorrow.AddHours(10),
            CreatedAt = DateTime.UtcNow,
            Services =
            {
                new AppointmentService
                {
                    WorkshopServiceId = filterChange.Id,
                    Price = filterChange.BasePrice
                }
            }
        };

        db.Appointments.AddRange(firstAppointment, secondAppointment, thirdAppointment);
        db.SaveChanges();
    }

    private static void SeedAppointmentNotes(AppDbContext db)
    {
        if (db.AppointmentNotes.Any())
        {
            return;
        }

        var inProgress = db.Appointments
            .Include(appointment => appointment.AppointmentStatus)
            .FirstOrDefault(appointment => appointment.AppointmentStatus.Code == "InProgress");

        if (inProgress is null || inProgress.EmployeeId is null)
        {
            return;
        }

        db.AppointmentNotes.Add(new AppointmentNote
        {
            AppointmentId = inProgress.Id,
            EmployeeId = inProgress.EmployeeId.Value,
            Content = "Wykonano wstepna diagnostyke, kontynuuje sprawdzanie ukladu wtryskowego.",
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
    }
}
