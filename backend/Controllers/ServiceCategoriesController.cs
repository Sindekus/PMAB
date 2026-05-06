using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/service-categories")]
public class ServiceCategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceCategoryResponse>>> GetAll()
    {
        var categories = await db.ServiceCategories
            .AsNoTracking()
            .Where(category => category.IsActive)
            .OrderBy(category => category.Name)
            .Select(category => new ServiceCategoryResponse(
                category.Id,
                category.Name,
                category.Description))
            .ToListAsync();

        return Ok(categories);
    }
}

public record ServiceCategoryResponse(
    int Id,
    string Name,
    string Description);
