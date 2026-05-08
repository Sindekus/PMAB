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

        var validationError = await ValidateRequest(request);

        if (validationError is not null)
        {
            return validationError;
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

        var brand = await db.VehicleBrands.FirstAsync(b => b.Id == vehicle.VehicleBrandId);

        var response = new VehicleResponse(
            vehicle.Id,
            brand.Id,
            brand.Name,
            vehicle.Model,
            vehicle.Year,
            vehicle.EngineType);

        return CreatedAtAction(nameof(GetCustomerVehicles), new { customerId }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<VehicleResponse>> Update(int customerId, int id, UpdateVehicleRequest request)
    {
        var vehicle = await db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id && v.CustomerId == customerId && v.IsActive);

        if (vehicle is null)
        {
            return NotFound(new { message = "Auto nie istnieje." });
        }

        var validationError = await ValidateRequest(request);

        if (validationError is not null)
        {
            return validationError;
        }

        vehicle.VehicleBrandId = request.VehicleBrandId;
        vehicle.Model = request.Model.Trim();
        vehicle.Year = request.Year;
        vehicle.EngineType = request.EngineType.Trim();

        await db.SaveChangesAsync();

        var brand = await db.VehicleBrands.FirstAsync(b => b.Id == vehicle.VehicleBrandId);

        return Ok(new VehicleResponse(
            vehicle.Id,
            brand.Id,
            brand.Name,
            vehicle.Model,
            vehicle.Year,
            vehicle.EngineType));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int customerId, int id)
    {
        var vehicle = await db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == id && v.CustomerId == customerId && v.IsActive);

        if (vehicle is null)
        {
            return NotFound(new { message = "Auto nie istnieje." });
        }

        vehicle.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<ActionResult?> ValidateRequest(VehicleRequest request)
    {
        if (!await db.VehicleBrands.AnyAsync(b => b.Id == request.VehicleBrandId && b.IsActive))
        {
            return BadRequest(new { message = "Wybrana marka nie istnieje." });
        }

        if (string.IsNullOrWhiteSpace(request.Model))
        {
            return BadRequest(new { message = "Model pojazdu jest wymagany." });
        }

        if (request.Year < 1950 || request.Year > DateTime.UtcNow.Year + 1)
        {
            return BadRequest(new { message = "Nieprawidlowy rok pojazdu." });
        }

        if (string.IsNullOrWhiteSpace(request.EngineType))
        {
            return BadRequest(new { message = "Typ silnika jest wymagany." });
        }

        return null;
    }
}

public abstract record VehicleRequest(
    int VehicleBrandId,
    string Model,
    int Year,
    string EngineType);

public record CreateVehicleRequest(
    int VehicleBrandId,
    string Model,
    int Year,
    string EngineType) : VehicleRequest(VehicleBrandId, Model, Year, EngineType);

public record UpdateVehicleRequest(
    int VehicleBrandId,
    string Model,
    int Year,
    string EngineType) : VehicleRequest(VehicleBrandId, Model, Year, EngineType);

public record VehicleResponse(
    int Id,
    int VehicleBrandId,
    string BrandName,
    string Model,
    int Year,
    string EngineType);
