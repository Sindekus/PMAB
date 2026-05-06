using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260506120000_InitialAccounts")]
partial class InitialAccounts
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "9.0.15")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

        modelBuilder.Entity("backend.Models.Customer", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");

            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

            b.Property<string>("Email")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("nvarchar(160)");

            b.Property<string>("FirstName")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<bool>("IsActive")
                .HasColumnType("bit");

            b.Property<string>("LastName")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<string>("PhoneNumber")
                .IsRequired()
                .HasMaxLength(30)
                .HasColumnType("nvarchar(30)");

            b.HasKey("Id");

            b.ToTable("Customers");
        });

        modelBuilder.Entity("backend.Models.Employee", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");

            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

            b.Property<string>("Email")
                .IsRequired()
                .HasMaxLength(160)
                .HasColumnType("nvarchar(160)");

            b.Property<string>("FirstName")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<bool>("IsActive")
                .HasColumnType("bit");

            b.Property<string>("LastName")
                .IsRequired()
                .HasMaxLength(80)
                .HasColumnType("nvarchar(80)");

            b.Property<string>("PhoneNumber")
                .IsRequired()
                .HasMaxLength(30)
                .HasColumnType("nvarchar(30)");

            b.HasKey("Id");

            b.ToTable("Employees");
        });

        modelBuilder.Entity("backend.Models.UserAccount", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("int");

            SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

            b.Property<int?>("CustomerId")
                .HasColumnType("int");

            b.Property<int?>("EmployeeId")
                .HasColumnType("int");

            b.Property<bool>("IsActive")
                .HasColumnType("bit");

            b.Property<string>("Login")
                .IsRequired()
                .HasMaxLength(60)
                .HasColumnType("nvarchar(60)");

            b.Property<string>("Password")
                .IsRequired()
                .HasMaxLength(120)
                .HasColumnType("nvarchar(120)");

            b.Property<string>("Role")
                .IsRequired()
                .HasMaxLength(20)
                .HasColumnType("nvarchar(20)");

            b.HasKey("Id");

            b.HasIndex("CustomerId");

            b.HasIndex("EmployeeId");

            b.HasIndex("Login")
                .IsUnique();

            b.ToTable("UserAccounts");
        });

        modelBuilder.Entity("backend.Models.UserAccount", b =>
        {
            b.HasOne("backend.Models.Customer", "Customer")
                .WithMany("UserAccounts")
                .HasForeignKey("CustomerId")
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne("backend.Models.Employee", "Employee")
                .WithMany("UserAccounts")
                .HasForeignKey("EmployeeId")
                .OnDelete(DeleteBehavior.Restrict);

            b.Navigation("Customer");

            b.Navigation("Employee");
        });

        modelBuilder.Entity("backend.Models.Customer", b =>
        {
            b.Navigation("UserAccounts");
        });

        modelBuilder.Entity("backend.Models.Employee", b =>
        {
            b.Navigation("UserAccounts");
        });
#pragma warning restore 612, 618
    }
}
