using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<UserAccount> UserAccounts => Set<UserAccount>();

    public DbSet<VehicleBrand> VehicleBrands => Set<VehicleBrand>();

    public DbSet<Vehicle> Vehicles => Set<Vehicle>();

    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();

    public DbSet<WorkshopService> WorkshopServices => Set<WorkshopService>();

    public DbSet<AppointmentStatus> AppointmentStatuses => Set<AppointmentStatus>();

    public DbSet<Appointment> Appointments => Set<Appointment>();

    public DbSet<AppointmentService> AppointmentServices => Set<AppointmentService>();

    public DbSet<AppointmentNote> AppointmentNotes => Set<AppointmentNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(customer => customer.FirstName).HasMaxLength(80).IsRequired();
            entity.Property(customer => customer.LastName).HasMaxLength(80).IsRequired();
            entity.Property(customer => customer.Email).HasMaxLength(160).IsRequired();
            entity.Property(customer => customer.PhoneNumber).HasMaxLength(30).IsRequired();
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.Property(employee => employee.FirstName).HasMaxLength(80).IsRequired();
            entity.Property(employee => employee.LastName).HasMaxLength(80).IsRequired();
            entity.Property(employee => employee.Email).HasMaxLength(160).IsRequired();
            entity.Property(employee => employee.PhoneNumber).HasMaxLength(30).IsRequired();
        });

        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.Property(account => account.Login).HasMaxLength(60).IsRequired();
            entity.Property(account => account.Password).HasMaxLength(120).IsRequired();
            entity.Property(account => account.Role).HasConversion<string>().HasMaxLength(20).IsRequired();

            entity.HasIndex(account => account.Login).IsUnique();

            entity.HasOne(account => account.Customer)
                .WithMany(customer => customer.UserAccounts)
                .HasForeignKey(account => account.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(account => account.Employee)
                .WithMany(employee => employee.UserAccounts)
                .HasForeignKey(account => account.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<VehicleBrand>(entity =>
        {
            entity.Property(brand => brand.Name).HasMaxLength(80).IsRequired();
            entity.HasIndex(brand => brand.Name).IsUnique();
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.Property(vehicle => vehicle.Model).HasMaxLength(80).IsRequired();
            entity.Property(vehicle => vehicle.EngineType).HasMaxLength(20).IsRequired();

            entity.HasOne(vehicle => vehicle.Customer)
                .WithMany(customer => customer.Vehicles)
                .HasForeignKey(vehicle => vehicle.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(vehicle => vehicle.VehicleBrand)
                .WithMany(brand => brand.Vehicles)
                .HasForeignKey(vehicle => vehicle.VehicleBrandId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.Property(category => category.Name).HasMaxLength(100).IsRequired();
            entity.Property(category => category.Description).HasMaxLength(300).IsRequired();
            entity.HasIndex(category => category.Name).IsUnique();
        });

        modelBuilder.Entity<WorkshopService>(entity =>
        {
            entity.Property(service => service.Name).HasMaxLength(120).IsRequired();
            entity.Property(service => service.Description).HasMaxLength(500).IsRequired();
            entity.Property(service => service.BasePrice).HasPrecision(10, 2);

            entity.HasOne(service => service.ServiceCategory)
                .WithMany(category => category.WorkshopServices)
                .HasForeignKey(service => service.ServiceCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AppointmentStatus>(entity =>
        {
            entity.Property(status => status.Name).HasMaxLength(60).IsRequired();
            entity.Property(status => status.Code).HasMaxLength(30).IsRequired();
            entity.HasIndex(status => status.Code).IsUnique();
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.Property(appointment => appointment.CustomerNotes).HasMaxLength(500);

            entity.HasOne(appointment => appointment.Customer)
                .WithMany(customer => customer.Appointments)
                .HasForeignKey(appointment => appointment.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(appointment => appointment.Vehicle)
                .WithMany(vehicle => vehicle.Appointments)
                .HasForeignKey(appointment => appointment.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(appointment => appointment.Employee)
                .WithMany(employee => employee.Appointments)
                .HasForeignKey(appointment => appointment.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(appointment => appointment.AppointmentStatus)
                .WithMany(status => status.Appointments)
                .HasForeignKey(appointment => appointment.AppointmentStatusId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(appointment => appointment.ScheduledAt);
        });

        modelBuilder.Entity<AppointmentService>(entity =>
        {
            entity.Property(service => service.Price).HasPrecision(10, 2);
            entity.Property(service => service.Notes).HasMaxLength(500);

            entity.HasOne(service => service.Appointment)
                .WithMany(appointment => appointment.Services)
                .HasForeignKey(service => service.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(service => service.WorkshopService)
                .WithMany(workshopService => workshopService.AppointmentServices)
                .HasForeignKey(service => service.WorkshopServiceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AppointmentNote>(entity =>
        {
            entity.Property(note => note.Content).HasMaxLength(500).IsRequired();

            entity.HasOne(note => note.Appointment)
                .WithMany(appointment => appointment.Notes)
                .HasForeignKey(note => note.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(note => note.Employee)
                .WithMany(employee => employee.AppointmentNotes)
                .HasForeignKey(note => note.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
