using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "9.0.15")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

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

        modelBuilder.Entity("backend.Models.Customer", b =>
        {
            b.Navigation("UserAccounts");
            b.Navigation("Vehicles");
        });

        modelBuilder.Entity("backend.Models.Employee", b =>
        {
            b.Navigation("UserAccounts");
        });

        modelBuilder.Entity("backend.Models.ServiceCategory", b =>
        {
            b.Navigation("WorkshopServices");
        });

        modelBuilder.Entity("backend.Models.VehicleBrand", b =>
        {
            b.Navigation("Vehicles");
        });
#pragma warning restore 612, 618
    }
}
