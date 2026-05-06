using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/workshop-services")]
public class WorkshopServicesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<WorkshopServiceResponse>>> GetAll()
    {
        var services = await db.WorkshopServices
            .AsNoTracking()
            .Include(service => service.ServiceCategory)
            .Where(service => service.IsActive)
            .OrderBy(service => service.ServiceCategory.Name)
            .ThenBy(service => service.Name)
            .Select(service => new WorkshopServiceResponse(
                service.Id,
                service.ServiceCategoryId,
                service.ServiceCategory.Name,
                service.Name,
                service.Description,
                service.BasePrice,
                service.EstimatedDurationMinutes))
            .ToListAsync();

        return Ok(services);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<WorkshopServiceResponse>> GetById(int id)
    {
        var service = await db.WorkshopServices
            .AsNoTracking()
            .Include(workshopService => workshopService.ServiceCategory)
            .Where(workshopService => workshopService.Id == id && workshopService.IsActive)
            .Select(workshopService => new WorkshopServiceResponse(
                workshopService.Id,
                workshopService.ServiceCategoryId,
                workshopService.ServiceCategory.Name,
                workshopService.Name,
                workshopService.Description,
                workshopService.BasePrice,
                workshopService.EstimatedDurationMinutes))
            .FirstOrDefaultAsync();

        if (service is null)
        {
            return NotFound(new { message = "Usluga nie istnieje." });
        }

        return Ok(service);
    }

    [HttpPost]
    public async Task<ActionResult<WorkshopServiceResponse>> Create(CreateWorkshopServiceRequest request)
    {
        var validationError = await ValidateRequest(request);

        if (validationError is not null)
        {
            return validationError;
        }

        var category = await db.ServiceCategories
            .FirstAsync(serviceCategory => serviceCategory.Id == request.ServiceCategoryId);

        var service = new WorkshopService
        {
            ServiceCategoryId = request.ServiceCategoryId,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            BasePrice = request.BasePrice,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes
        };

        db.WorkshopServices.Add(service);
        await db.SaveChangesAsync();

        var response = new WorkshopServiceResponse(
            service.Id,
            service.ServiceCategoryId,
            category.Name,
            service.Name,
            service.Description,
            service.BasePrice,
            service.EstimatedDurationMinutes);

        return CreatedAtAction(nameof(GetById), new { id = service.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<WorkshopServiceResponse>> Update(int id, UpdateWorkshopServiceRequest request)
    {
        var service = await db.WorkshopServices
            .FirstOrDefaultAsync(workshopService => workshopService.Id == id && workshopService.IsActive);

        if (service is null)
        {
            return NotFound(new { message = "Usluga nie istnieje." });
        }

        var validationError = await ValidateRequest(request);

        if (validationError is not null)
        {
            return validationError;
        }

        var category = await db.ServiceCategories
            .FirstAsync(serviceCategory => serviceCategory.Id == request.ServiceCategoryId);

        service.ServiceCategoryId = request.ServiceCategoryId;
        service.Name = request.Name.Trim();
        service.Description = request.Description.Trim();
        service.BasePrice = request.BasePrice;
        service.EstimatedDurationMinutes = request.EstimatedDurationMinutes;

        await db.SaveChangesAsync();

        return Ok(new WorkshopServiceResponse(
            service.Id,
            service.ServiceCategoryId,
            category.Name,
            service.Name,
            service.Description,
            service.BasePrice,
            service.EstimatedDurationMinutes));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await db.WorkshopServices
            .FirstOrDefaultAsync(workshopService => workshopService.Id == id && workshopService.IsActive);

        if (service is null)
        {
            return NotFound(new { message = "Usluga nie istnieje." });
        }

        service.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<ActionResult?> ValidateRequest(WorkshopServiceRequest request)
    {
        if (!await db.ServiceCategories.AnyAsync(category =>
                category.Id == request.ServiceCategoryId &&
                category.IsActive))
        {
            return BadRequest(new { message = "Wybrana kategoria nie istnieje." });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Nazwa uslugi jest wymagana." });
        }

        if (request.BasePrice < 0)
        {
            return BadRequest(new { message = "Cena nie moze byc ujemna." });
        }

        if (request.EstimatedDurationMinutes <= 0)
        {
            return BadRequest(new { message = "Czas trwania musi byc wiekszy od zera." });
        }

        return null;
    }
}

public abstract record WorkshopServiceRequest(
    int ServiceCategoryId,
    string Name,
    string Description,
    decimal BasePrice,
    int EstimatedDurationMinutes);

public record CreateWorkshopServiceRequest(
    int ServiceCategoryId,
    string Name,
    string Description,
    decimal BasePrice,
    int EstimatedDurationMinutes) : WorkshopServiceRequest(
    ServiceCategoryId,
    Name,
    Description,
    BasePrice,
    EstimatedDurationMinutes);

public record UpdateWorkshopServiceRequest(
    int ServiceCategoryId,
    string Name,
    string Description,
    decimal BasePrice,
    int EstimatedDurationMinutes) : WorkshopServiceRequest(
    ServiceCategoryId,
    Name,
    Description,
    BasePrice,
    EstimatedDurationMinutes);

public record WorkshopServiceResponse(
    int Id,
    int ServiceCategoryId,
    string ServiceCategoryName,
    string Name,
    string Description,
    decimal BasePrice,
    int EstimatedDurationMinutes);
