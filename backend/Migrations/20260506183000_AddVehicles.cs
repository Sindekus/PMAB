using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

public partial class AddVehicles : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "VehicleBrands",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_VehicleBrands", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Vehicles",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                CustomerId = table.Column<int>(type: "int", nullable: false),
                VehicleBrandId = table.Column<int>(type: "int", nullable: false),
                Model = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                Year = table.Column<int>(type: "int", nullable: false),
                EngineType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Vehicles", x => x.Id);
                table.ForeignKey(
                    name: "FK_Vehicles_Customers_CustomerId",
                    column: x => x.CustomerId,
                    principalTable: "Customers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Vehicles_VehicleBrands_VehicleBrandId",
                    column: x => x.VehicleBrandId,
                    principalTable: "VehicleBrands",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_VehicleBrands_Name",
            table: "VehicleBrands",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Vehicles_CustomerId",
            table: "Vehicles",
            column: "CustomerId");

        migrationBuilder.CreateIndex(
            name: "IX_Vehicles_VehicleBrandId",
            table: "Vehicles",
            column: "VehicleBrandId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Vehicles");

        migrationBuilder.DropTable(
            name: "VehicleBrands");
    }
}
