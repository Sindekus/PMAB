using backend.Data;
using backend.Models;
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

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceCategoryResponse>> GetById(int id)
    {
        var category = await db.ServiceCategories
            .AsNoTracking()
            .Where(c => c.Id == id && c.IsActive)
            .Select(c => new ServiceCategoryResponse(c.Id, c.Name, c.Description))
            .FirstOrDefaultAsync();

        if (category is null)
        {
            return NotFound(new { message = "Kategoria nie istnieje." });
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceCategoryResponse>> Create(ServiceCategoryRequest request)
    {
        var validationError = await ValidateRequest(request, currentId: null);

        if (validationError is not null)
        {
            return validationError;
        }

        var category = new ServiceCategory
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim()
        };

        db.ServiceCategories.Add(category);
        await db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.Id },
            new ServiceCategoryResponse(category.Id, category.Name, category.Description));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ServiceCategoryResponse>> Update(int id, ServiceCategoryRequest request)
    {
        var category = await db.ServiceCategories.FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

        if (category is null)
        {
            return NotFound(new { message = "Kategoria nie istnieje." });
        }

        var validationError = await ValidateRequest(request, currentId: id);

        if (validationError is not null)
        {
            return validationError;
        }

        category.Name = request.Name.Trim();
        category.Description = request.Description.Trim();

        await db.SaveChangesAsync();

        return Ok(new ServiceCategoryResponse(category.Id, category.Name, category.Description));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await db.ServiceCategories.FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

        if (category is null)
        {
            return NotFound(new { message = "Kategoria nie istnieje." });
        }

        var hasServices = await db.WorkshopServices.AnyAsync(s => s.ServiceCategoryId == id && s.IsActive);

        if (hasServices)
        {
            return BadRequest(new { message = "Nie mozna usunac kategorii z aktywnymi uslugami." });
        }

        category.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<ActionResult?> ValidateRequest(ServiceCategoryRequest request, int? currentId)
    {
        var name = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Nazwa kategorii jest wymagana." });
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "Opis kategorii jest wymagany." });
        }

        var nameTaken = currentId is null
            ? await db.ServiceCategories.AnyAsync(c => c.Name == name)
            : await db.ServiceCategories.AnyAsync(c => c.Name == name && c.Id != currentId);

        if (nameTaken)
        {
            return BadRequest(new { message = "Inna kategoria uzywa juz tej nazwy." });
        }

        return null;
    }
}

public record ServiceCategoryRequest(string Name, string Description);

public record ServiceCategoryResponse(
    int Id,
    string Name,
    string Description);
