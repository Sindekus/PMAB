using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/appointment-statuses")]
public class AppointmentStatusesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppointmentStatusResponse>>> GetAll()
    {
        var statuses = await db.AppointmentStatuses
            .AsNoTracking()
            .OrderBy(status => status.SortOrder)
            .Select(status => new AppointmentStatusResponse(status.Id, status.Code, status.Name))
            .ToListAsync();

        return Ok(statuses);
    }
}

public record AppointmentStatusResponse(int Id, string Code, string Name);
