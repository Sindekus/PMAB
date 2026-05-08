using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

public partial class AddAppointments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AppointmentStatuses",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                SortOrder = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AppointmentStatuses", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Appointments",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                CustomerId = table.Column<int>(type: "int", nullable: false),
                VehicleId = table.Column<int>(type: "int", nullable: false),
                EmployeeId = table.Column<int>(type: "int", nullable: true),
                AppointmentStatusId = table.Column<int>(type: "int", nullable: false),
                ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                CustomerNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Appointments", x => x.Id);
                table.ForeignKey(
                    name: "FK_Appointments_AppointmentStatuses_AppointmentStatusId",
                    column: x => x.AppointmentStatusId,
                    principalTable: "AppointmentStatuses",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Appointments_Customers_CustomerId",
                    column: x => x.CustomerId,
                    principalTable: "Customers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Appointments_Employees_EmployeeId",
                    column: x => x.EmployeeId,
                    principalTable: "Employees",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Appointments_Vehicles_VehicleId",
                    column: x => x.VehicleId,
                    principalTable: "Vehicles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "AppointmentServices",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                AppointmentId = table.Column<int>(type: "int", nullable: false),
                WorkshopServiceId = table.Column<int>(type: "int", nullable: false),
                Price = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AppointmentServices", x => x.Id);
                table.ForeignKey(
                    name: "FK_AppointmentServices_Appointments_AppointmentId",
                    column: x => x.AppointmentId,
                    principalTable: "Appointments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_AppointmentServices_WorkshopServices_WorkshopServiceId",
                    column: x => x.WorkshopServiceId,
                    principalTable: "WorkshopServices",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "AppointmentNotes",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                AppointmentId = table.Column<int>(type: "int", nullable: false),
                EmployeeId = table.Column<int>(type: "int", nullable: false),
                Content = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AppointmentNotes", x => x.Id);
                table.ForeignKey(
                    name: "FK_AppointmentNotes_Appointments_AppointmentId",
                    column: x => x.AppointmentId,
                    principalTable: "Appointments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_AppointmentNotes_Employees_EmployeeId",
                    column: x => x.EmployeeId,
                    principalTable: "Employees",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AppointmentNotes_AppointmentId",
            table: "AppointmentNotes",
            column: "AppointmentId");

        migrationBuilder.CreateIndex(
            name: "IX_AppointmentNotes_EmployeeId",
            table: "AppointmentNotes",
            column: "EmployeeId");

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_AppointmentStatusId",
            table: "Appointments",
            column: "AppointmentStatusId");

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_CustomerId",
            table: "Appointments",
            column: "CustomerId");

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_EmployeeId",
            table: "Appointments",
            column: "EmployeeId");

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_ScheduledAt",
            table: "Appointments",
            column: "ScheduledAt");

        migrationBuilder.CreateIndex(
            name: "IX_Appointments_VehicleId",
            table: "Appointments",
            column: "VehicleId");

        migrationBuilder.CreateIndex(
            name: "IX_AppointmentServices_AppointmentId",
            table: "AppointmentServices",
            column: "AppointmentId");

        migrationBuilder.CreateIndex(
            name: "IX_AppointmentServices_WorkshopServiceId",
            table: "AppointmentServices",
            column: "WorkshopServiceId");

        migrationBuilder.CreateIndex(
            name: "IX_AppointmentStatuses_Code",
            table: "AppointmentStatuses",
            column: "Code",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "AppointmentNotes");

        migrationBuilder.DropTable(
            name: "AppointmentServices");

        migrationBuilder.DropTable(
            name: "Appointments");

        migrationBuilder.DropTable(
            name: "AppointmentStatuses");
    }
}
