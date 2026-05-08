using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/vehicle-brands")]
public class VehicleBrandsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VehicleBrandResponse>>> GetAll()
    {
        var brands = await db.VehicleBrands
            .AsNoTracking()
            .Where(brand => brand.IsActive)
            .OrderBy(brand => brand.Name)
            .Select(brand => new VehicleBrandResponse(brand.Id, brand.Name))
            .ToListAsync();

        return Ok(brands);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehicleBrandResponse>> GetById(int id)
    {
        var brand = await db.VehicleBrands
            .AsNoTracking()
            .Where(b => b.Id == id && b.IsActive)
            .Select(b => new VehicleBrandResponse(b.Id, b.Name))
            .FirstOrDefaultAsync();

        if (brand is null)
        {
            return NotFound(new { message = "Marka nie istnieje." });
        }

        return Ok(brand);
    }

    [HttpPost]
    public async Task<ActionResult<VehicleBrandResponse>> Create(VehicleBrandRequest request)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Nazwa marki jest wymagana." });
        }

        if (await db.VehicleBrands.AnyAsync(b => b.Name == name))
        {
            return BadRequest(new { message = "Marka o takiej nazwie juz istnieje." });
        }

        var brand = new VehicleBrand { Name = name };

        db.VehicleBrands.Add(brand);
        await db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = brand.Id },
            new VehicleBrandResponse(brand.Id, brand.Name));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<VehicleBrandResponse>> Update(int id, VehicleBrandRequest request)
    {
        var brand = await db.VehicleBrands.FirstOrDefaultAsync(b => b.Id == id && b.IsActive);

        if (brand is null)
        {
            return NotFound(new { message = "Marka nie istnieje." });
        }

        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Nazwa marki jest wymagana." });
        }

        if (await db.VehicleBrands.AnyAsync(b => b.Name == name && b.Id != id))
        {
            return BadRequest(new { message = "Inna marka uzywa juz tej nazwy." });
        }

        brand.Name = name;
        await db.SaveChangesAsync();

        return Ok(new VehicleBrandResponse(brand.Id, brand.Name));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var brand = await db.VehicleBrands.FirstOrDefaultAsync(b => b.Id == id && b.IsActive);

        if (brand is null)
        {
            return NotFound(new { message = "Marka nie istnieje." });
        }

        var hasVehicles = await db.Vehicles.AnyAsync(v => v.VehicleBrandId == id && v.IsActive);

        if (hasVehicles)
        {
            return BadRequest(new { message = "Nie mozna usunac marki, do ktorej przypisane sa aktywne auta." });
        }

        brand.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record VehicleBrandRequest(string Name);

public record VehicleBrandResponse(int Id, string Name);
