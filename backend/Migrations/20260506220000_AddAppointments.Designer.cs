using System;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260506220000_AddAppointments")]
partial class AddAppointments
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "9.0.15")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

        modelBuilder.Entity("backend.Models.Appointment", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("AppointmentStatusId").HasColumnType("int");
            b.Property<DateTime>("CreatedAt").HasColumnType("datetime2");
            b.Property<int>("CustomerId").HasColumnType("int");
            b.Property<string>("CustomerNotes").HasMaxLength(500).HasColumnType("nvarchar(500)");
            b.Property<int?>("EmployeeId").HasColumnType("int");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<DateTime>("ScheduledAt").HasColumnType("datetime2");
            b.Property<int>("VehicleId").HasColumnType("int");
            b.HasKey("Id");
            b.HasIndex("AppointmentStatusId");
            b.HasIndex("CustomerId");
            b.HasIndex("EmployeeId");
            b.HasIndex("ScheduledAt");
            b.HasIndex("VehicleId");
            b.ToTable("Appointments");
        });

        modelBuilder.Entity("backend.Models.AppointmentNote", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("AppointmentId").HasColumnType("int");
            b.Property<string>("Content").IsRequired().HasMaxLength(500).HasColumnType("nvarchar(500)");
            b.Property<DateTime>("CreatedAt").HasColumnType("datetime2");
            b.Property<int>("EmployeeId").HasColumnType("int");
            b.HasKey("Id");
            b.HasIndex("AppointmentId");
            b.HasIndex("EmployeeId");
            b.ToTable("AppointmentNotes");
        });

        modelBuilder.Entity("backend.Models.AppointmentService", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("AppointmentId").HasColumnType("int");
            b.Property<string>("Notes").HasMaxLength(500).HasColumnType("nvarchar(500)");
            b.Property<decimal>("Price").HasPrecision(10, 2).HasColumnType("decimal(10,2)");
            b.Property<int>("WorkshopServiceId").HasColumnType("int");
            b.HasKey("Id");
            b.HasIndex("AppointmentId");
            b.HasIndex("WorkshopServiceId");
            b.ToTable("AppointmentServices");
        });

        modelBuilder.Entity("backend.Models.AppointmentStatus", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<string>("Code").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            b.Property<string>("Name").IsRequired().HasMaxLength(60).HasColumnType("nvarchar(60)");
            b.Property<int>("SortOrder").HasColumnType("int");
            b.HasKey("Id");
            b.HasIndex("Code").IsUnique();
            b.ToTable("AppointmentStatuses");
        });

        modelBuilder.Entity("backend.Models.Customer", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<string>("Email").IsRequired().HasMaxLength(160).HasColumnType("nvarchar(160)");
            b.Property<string>("FirstName").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("LastName").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            b.Property<string>("PhoneNumber").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            b.HasKey("Id");
            b.ToTable("Customers");
        });

        modelBuilder.Entity("backend.Models.Employee", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<string>("Email").IsRequired().HasMaxLength(160).HasColumnType("nvarchar(160)");
            b.Property<string>("FirstName").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("LastName").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            b.Property<string>("PhoneNumber").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            b.HasKey("Id");
            b.ToTable("Employees");
        });

        modelBuilder.Entity("backend.Models.ServiceCategory", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<string>("Description").IsRequired().HasMaxLength(300).HasColumnType("nvarchar(300)");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("Name").IsRequired().HasMaxLength(100).HasColumnType("nvarchar(100)");
            b.HasKey("Id");
            b.HasIndex("Name").IsUnique();
            b.ToTable("ServiceCategories");
        });

        modelBuilder.Entity("backend.Models.UserAccount", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int?>("CustomerId").HasColumnType("int");
            b.Property<int?>("EmployeeId").HasColumnType("int");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("Login").IsRequired().HasMaxLength(60).HasColumnType("nvarchar(60)");
            b.Property<string>("Password").IsRequired().HasMaxLength(120).HasColumnType("nvarchar(120)");
            b.Property<string>("Role").IsRequired().HasMaxLength(20).HasColumnType("nvarchar(20)");
            b.HasKey("Id");
            b.HasIndex("CustomerId");
            b.HasIndex("EmployeeId");
            b.HasIndex("Login").IsUnique();
            b.ToTable("UserAccounts");
        });

        modelBuilder.Entity("backend.Models.VehicleBrand", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("Name").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            b.HasKey("Id");
            b.HasIndex("Name").IsUnique();
            b.ToTable("VehicleBrands");
        });

        modelBuilder.Entity("backend.Models.Vehicle", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<int>("CustomerId").HasColumnType("int");
            b.Property<string>("EngineType").IsRequired().HasMaxLength(20).HasColumnType("nvarchar(20)");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("Model").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            b.Property<int>("VehicleBrandId").HasColumnType("int");
            b.Property<int>("Year").HasColumnType("int");
            b.HasKey("Id");
            b.HasIndex("CustomerId");
            b.HasIndex("VehicleBrandId");
            b.ToTable("Vehicles");
        });

        modelBuilder.Entity("backend.Models.WorkshopService", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("int");
            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));
            b.Property<decimal>("BasePrice").HasPrecision(10, 2).HasColumnType("decimal(10,2)");
            b.Property<string>("Description").IsRequired().HasMaxLength(500).HasColumnType("nvarchar(500)");
            b.Property<int>("EstimatedDurationMinutes").HasColumnType("int");
            b.Property<bool>("IsActive").HasColumnType("bit");
            b.Property<string>("Name").IsRequired().HasMaxLength(120).HasColumnType("nvarchar(120)");
            b.Property<int>("ServiceCategoryId").HasColumnType("int");
            b.HasKey("Id");
            b.HasIndex("ServiceCategoryId");
            b.ToTable("WorkshopServices");
        });

        modelBuilder.Entity("backend.Models.Appointment", b =>
        {
            b.HasOne("backend.Models.AppointmentStatus", "AppointmentStatus").WithMany("Appointments").HasForeignKey("AppointmentStatusId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.HasOne("backend.Models.Customer", "Customer").WithMany("Appointments").HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.HasOne("backend.Models.Employee", "Employee").WithMany("Appointments").HasForeignKey("EmployeeId").OnDelete(DeleteBehavior.Restrict);
            b.HasOne("backend.Models.Vehicle", "Vehicle").WithMany("Appointments").HasForeignKey("VehicleId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.Navigation("AppointmentStatus");
            b.Navigation("Customer");
            b.Navigation("Employee");
            b.Navigation("Vehicle");
        });

        modelBuilder.Entity("backend.Models.AppointmentNote", b =>
        {
            b.HasOne("backend.Models.Appointment", "Appointment").WithMany("Notes").HasForeignKey("AppointmentId").OnDelete(DeleteBehavior.Cascade).IsRequired();
            b.HasOne("backend.Models.Employee", "Employee").WithMany("AppointmentNotes").HasForeignKey("EmployeeId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.Navigation("Appointment");
            b.Navigation("Employee");
        });

        modelBuilder.Entity("backend.Models.AppointmentService", b =>
        {
            b.HasOne("backend.Models.Appointment", "Appointment").WithMany("Services").HasForeignKey("AppointmentId").OnDelete(DeleteBehavior.Cascade).IsRequired();
            b.HasOne("backend.Models.WorkshopService", "WorkshopService").WithMany("AppointmentServices").HasForeignKey("WorkshopServiceId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.Navigation("Appointment");
            b.Navigation("WorkshopService");
        });

        modelBuilder.Entity("backend.Models.UserAccount", b =>
        {
            b.HasOne("backend.Models.Customer", "Customer").WithMany("UserAccounts").HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Restrict);
            b.HasOne("backend.Models.Employee", "Employee").WithMany("UserAccounts").HasForeignKey("EmployeeId").OnDelete(DeleteBehavior.Restrict);
            b.Navigation("Customer");
            b.Navigation("Employee");
        });

        modelBuilder.Entity("backend.Models.Vehicle", b =>
        {
            b.HasOne("backend.Models.Customer", "Customer").WithMany("Vehicles").HasForeignKey("CustomerId").OnDelete(DeleteBehavior.Cascade).IsRequired();
            b.HasOne("backend.Models.VehicleBrand", "VehicleBrand").WithMany("Vehicles").HasForeignKey("VehicleBrandId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.Navigation("Customer");
            b.Navigation("VehicleBrand");
        });

        modelBuilder.Entity("backend.Models.WorkshopService", b =>
        {
            b.HasOne("backend.Models.ServiceCategory", "ServiceCategory").WithMany("WorkshopServices").HasForeignKey("ServiceCategoryId").OnDelete(DeleteBehavior.Restrict).IsRequired();
            b.Navigation("ServiceCategory");
        });

        modelBuilder.Entity("backend.Models.Appointment", b =>
        {
            b.Navigation("Notes");
            b.Navigation("Services");
        });

        modelBuilder.Entity("backend.Models.AppointmentStatus", b =>
        {
            b.Navigation("Appointments");
        });

        modelBuilder.Entity("backend.Models.Customer", b =>
        {
            b.Navigation("Appointments");
            b.Navigation("UserAccounts");
            b.Navigation("Vehicles");
        });

        modelBuilder.Entity("backend.Models.Employee", b =>
        {
            b.Navigation("AppointmentNotes");
            b.Navigation("Appointments");
            b.Navigation("UserAccounts");
        });

        modelBuilder.Entity("backend.Models.ServiceCategory", b =>
        {
            b.Navigation("WorkshopServices");
        });

        modelBuilder.Entity("backend.Models.Vehicle", b =>
        {
            b.Navigation("Appointments");
        });

        modelBuilder.Entity("backend.Models.VehicleBrand", b =>
        {
            b.Navigation("Vehicles");
        });

        modelBuilder.Entity("backend.Models.WorkshopService", b =>
        {
            b.Navigation("AppointmentServices");
        });
#pragma warning restore 612, 618
    }
}
