using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/customers/{customerId:int}/vehicles")]
public class VehiclesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VehicleResponse>>> GetCustomerVehicles(int customerId)
    {
        var vehicles = await db.Vehicles
            .AsNoTracking()
            .Include(vehicle => vehicle.VehicleBrand)
            .Where(vehicle => vehicle.CustomerId == customerId && vehicle.IsActive)
            .OrderBy(vehicle => vehicle.VehicleBrand.Name)
            .ThenBy(vehicle => vehicle.Model)
            .Select(vehicle => new VehicleResponse(
                vehicle.Id,
                vehicle.VehicleBrandId,
                vehicle.VehicleBrand.Name,
                vehicle.Model,
                vehicle.Year,
                vehicle.EngineType))
            .ToListAsync();

        return Ok(vehicles);
    }

    [HttpPost]
    public async Task<ActionResult<VehicleResponse>> Create(int customerId, CreateVehicleRequest request)
    {
        if (!await db.Customers.AnyAsync(customer => customer.Id == customerId && customer.IsActive))
        {
            return NotFound(new { message = "Klient nie istnieje." });
        }

        var brand = await db.VehicleBrands
            .FirstOrDefaultAsync(vehicleBrand =>
                vehicleBrand.Id == request.VehicleBrandId &&
                vehicleBrand.IsActive);

        if (brand is null)
        {
            return BadRequest(new { message = "Wybrana marka nie istnieje." });
        }

        if (request.Year < 1950 || request.Year > DateTime.UtcNow.Year + 1)
        {
            return BadRequest(new { message = "Nieprawidlowy rok pojazdu." });
        }

        var vehicle = new Vehicle
        {
            CustomerId = customerId,
            VehicleBrandId = request.VehicleBrandId,
            Model = request.Model.Trim(),
            Year = request.Year,
            EngineType = request.EngineType.Trim()
        };

        db.Vehicles.Add(vehicle);
        await db.SaveChangesAsync();

        var response = new VehicleResponse(
            vehicle.Id,
            brand.Id,
            brand.Name,
            vehicle.Model,
            vehicle.Year,
            vehicle.EngineType);

        return CreatedAtAction(nameof(GetCustomerVehicles), new { customerId }, response);
    }
}

public record CreateVehicleRequest(
    int VehicleBrandId,
    string Model,
    int Year,
    string EngineType);

public record VehicleResponse(
    int Id,
    int VehicleBrandId,
    string BrandName,
    string Model,
    int Year,
    string EngineType);
