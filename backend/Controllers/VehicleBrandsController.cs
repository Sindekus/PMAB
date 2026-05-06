using backend.Data;
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
            .Where(brand => brand.IsActive)
            .OrderBy(brand => brand.Name)
            .Select(brand => new VehicleBrandResponse(brand.Id, brand.Name))
            .ToListAsync();

        return Ok(brands);
    }
}

public record VehicleBrandResponse(int Id, string Name);
