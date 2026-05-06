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
    }
}
