using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppointmentSummaryResponse>>> GetAll(
        [FromQuery] DateTime? date,
        [FromQuery] int? employeeId)
    {
        var query = ActiveAppointmentsQuery();

        if (date.HasValue)
        {
            var dayStart = date.Value.Date;
            var dayEnd = dayStart.AddDays(1);
            query = query.Where(a => a.ScheduledAt >= dayStart && a.ScheduledAt < dayEnd);
        }

        if (employeeId.HasValue)
        {
            query = query.Where(a => a.EmployeeId == employeeId.Value);
        }

        var summaries = await query
            .OrderBy(a => a.ScheduledAt)
            .Select(a => new AppointmentSummaryResponse(
                a.Id,
                a.ScheduledAt,
                a.CustomerId,
                a.Customer.FirstName + " " + a.Customer.LastName,
                a.VehicleId,
                a.Vehicle.VehicleBrand.Name,
                a.Vehicle.Model,
                a.EmployeeId,
                a.Employee == null ? null : a.Employee.FirstName + " " + a.Employee.LastName,
                a.AppointmentStatusId,
                a.AppointmentStatus.Code,
                a.AppointmentStatus.Name,
                a.Services.Count,
                a.Services.Sum(s => (decimal?)s.Price) ?? 0m))
            .ToListAsync();

        return Ok(summaries);
    }

    [HttpGet("/api/customers/{customerId:int}/appointments")]
    public async Task<ActionResult<IReadOnlyList<AppointmentSummaryResponse>>> GetForCustomer(int customerId)
    {
        var summaries = await ActiveAppointmentsQuery()
            .Where(a => a.CustomerId == customerId)
            .OrderByDescending(a => a.ScheduledAt)
            .Select(a => new AppointmentSummaryResponse(
                a.Id,
                a.ScheduledAt,
                a.CustomerId,
                a.Customer.FirstName + " " + a.Customer.LastName,
                a.VehicleId,
                a.Vehicle.VehicleBrand.Name,
                a.Vehicle.Model,
                a.EmployeeId,
                a.Employee == null ? null : a.Employee.FirstName + " " + a.Employee.LastName,
                a.AppointmentStatusId,
                a.AppointmentStatus.Code,
                a.AppointmentStatus.Name,
                a.Services.Count,
                a.Services.Sum(s => (decimal?)s.Price) ?? 0m))
            .ToListAsync();

        return Ok(summaries);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AppointmentDetailsResponse>> GetById(int id)
    {
        var details = await BuildDetails(id);

        if (details is null)
        {
            return NotFound(new { message = "Wizyta nie istnieje." });
        }

        return Ok(details);
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDetailsResponse>> Create(CreateAppointmentRequest request)
    {
        var validationError = await ValidateBaseRequest(
            request.CustomerId,
            request.VehicleId,
            request.EmployeeId,
            request.ScheduledAt);

        if (validationError is not null)
        {
            return validationError;
        }

        if (request.WorkshopServiceIds.Count == 0)
        {
            return BadRequest(new { message = "Wybierz przynajmniej jedna usluge dla wizyty." });
        }

        var services = await db.WorkshopServices
            .Where(service => request.WorkshopServiceIds.Contains(service.Id) && service.IsActive)
            .ToListAsync();

        if (services.Count != request.WorkshopServiceIds.Distinct().Count())
        {
            return BadRequest(new { message = "Jedna z wybranych uslug nie jest juz dostepna." });
        }

        var defaultStatus = await db.AppointmentStatuses.FirstOrDefaultAsync(s => s.Code == "New");

        if (defaultStatus is null)
        {
            return Problem("Brak slownika statusow wizyt.");
        }

        var appointment = new Appointment
        {
            CustomerId = request.CustomerId,
            VehicleId = request.VehicleId,
            EmployeeId = request.EmployeeId,
            AppointmentStatusId = defaultStatus.Id,
            ScheduledAt = request.ScheduledAt,
            CreatedAt = DateTime.UtcNow,
            CustomerNotes = string.IsNullOrWhiteSpace(request.CustomerNotes) ? null : request.CustomerNotes.Trim()
        };

        foreach (var service in services)
        {
            appointment.Services.Add(new AppointmentService
            {
                WorkshopServiceId = service.Id,
                Price = service.BasePrice
            });
        }

        db.Appointments.Add(appointment);
        await db.SaveChangesAsync();

        var details = await BuildDetails(appointment.Id);

        return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, details);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AppointmentDetailsResponse>> Update(int id, UpdateAppointmentRequest request)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.IsActive);

        if (appointment is null)
        {
            return NotFound(new { message = "Wizyta nie istnieje." });
        }

        var validationError = await ValidateBaseRequest(
            appointment.CustomerId,
            request.VehicleId,
            request.EmployeeId,
            request.ScheduledAt);

        if (validationError is not null)
        {
            return validationError;
        }

        appointment.VehicleId = request.VehicleId;
        appointment.EmployeeId = request.EmployeeId;
        appointment.ScheduledAt = request.ScheduledAt;
        appointment.CustomerNotes = string.IsNullOrWhiteSpace(request.CustomerNotes) ? null : request.CustomerNotes.Trim();

        await db.SaveChangesAsync();

        return Ok(await BuildDetails(appointment.Id));
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<AppointmentDetailsResponse>> ChangeStatus(int id, ChangeAppointmentStatusRequest request)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.IsActive);

        if (appointment is null)
        {
            return NotFound(new { message = "Wizyta nie istnieje." });
        }

        var status = await db.AppointmentStatuses.FirstOrDefaultAsync(s => s.Code == request.StatusCode);

        if (status is null)
        {
            return BadRequest(new { message = "Nieznany status wizyty." });
        }

        appointment.AppointmentStatusId = status.Id;
        await db.SaveChangesAsync();

        return Ok(await BuildDetails(appointment.Id));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.IsActive);

        if (appointment is null)
        {
            return NotFound(new { message = "Wizyta nie istnieje." });
        }

        appointment.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/services")]
    public async Task<ActionResult<AppointmentDetailsResponse>> AddService(int id, AddAppointmentServiceRequest request)
    {
        var appointment = await db.Appointments
            .Include(a => a.Services)
            .FirstOrDefaultAsync(a => a.Id == id && a.IsActive);

        if (appointment is null)
        {
            return NotFound(new { message = "Wizyta nie istnieje." });
        }

        var service = await db.WorkshopServices.FirstOrDefaultAsync(s => s.Id == request.WorkshopServiceId && s.IsActive);

        if (service is null)
        {
            return BadRequest(new { message = "Wybrana usluga nie istnieje." });
        }

        if (appointment.Services.Any(s => s.WorkshopServiceId == service.Id))
        {
            return BadRequest(new { message = "Ta usluga jest juz dodana do wizyty." });
        }

        appointment.Services.Add(new AppointmentService
        {
            WorkshopServiceId = service.Id,
            Price = service.BasePrice,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
        });

        await db.SaveChangesAsync();

        return Ok(await BuildDetails(appointment.Id));
    }

    [HttpDelete("{id:int}/services/{serviceId:int}")]
    public async Task<ActionResult<AppointmentDetailsResponse>> RemoveService(int id, int serviceId)
    {
        var item = await db.AppointmentServices
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.AppointmentId == id);

        if (item is null)
        {
            return NotFound(new { message = "Pozycja uslugi nie istnieje." });
        }

        db.AppointmentServices.Remove(item);
        await db.SaveChangesAsync();

        return Ok(await BuildDetails(id));
    }

    [HttpPost("{id:int}/notes")]
    public async Task<ActionResult<AppointmentDetailsResponse>> AddNote(int id, AddAppointmentNoteRequest request)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.IsActive);

        if (appointment is null)
        {
            return NotFound(new { message = "Wizyta nie istnieje." });
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { message = "Tresc notatki nie moze byc pusta." });
        }

        if (!await db.Employees.AnyAsync(e => e.Id == request.EmployeeId && e.IsActive))
        {
            return BadRequest(new { message = "Wybrany pracownik nie istnieje." });
        }

        db.AppointmentNotes.Add(new AppointmentNote
        {
            AppointmentId = id,
            EmployeeId = request.EmployeeId,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync();

        return Ok(await BuildDetails(id));
    }

    [HttpDelete("{id:int}/notes/{noteId:int}")]
    public async Task<ActionResult<AppointmentDetailsResponse>> RemoveNote(int id, int noteId)
    {
        var note = await db.AppointmentNotes.FirstOrDefaultAsync(n => n.Id == noteId && n.AppointmentId == id);

        if (note is null)
        {
            return NotFound(new { message = "Notatka nie istnieje." });
        }

        db.AppointmentNotes.Remove(note);
        await db.SaveChangesAsync();

        return Ok(await BuildDetails(id));
    }

    private IQueryable<Appointment> ActiveAppointmentsQuery()
    {
        return db.Appointments
            .AsNoTracking()
            .Include(a => a.Customer)
            .Include(a => a.Vehicle)
            .ThenInclude(v => v.VehicleBrand)
            .Include(a => a.Employee)
            .Include(a => a.AppointmentStatus)
            .Include(a => a.Services)
            .Where(a => a.IsActive);
    }

    private async Task<AppointmentDetailsResponse?> BuildDetails(int id)
    {
        return await db.Appointments
            .AsNoTracking()
            .Where(a => a.Id == id && a.IsActive)
            .Select(a => new AppointmentDetailsResponse(
                a.Id,
                a.ScheduledAt,
                a.CreatedAt,
                a.CustomerNotes,
                a.CustomerId,
                a.Customer.FirstName + " " + a.Customer.LastName,
                a.Customer.PhoneNumber,
                a.VehicleId,
                a.Vehicle.VehicleBrand.Name,
                a.Vehicle.Model,
                a.Vehicle.Year,
                a.EmployeeId,
                a.Employee == null ? null : a.Employee.FirstName + " " + a.Employee.LastName,
                a.AppointmentStatusId,
                a.AppointmentStatus.Code,
                a.AppointmentStatus.Name,
                a.Services
                    .OrderBy(s => s.Id)
                    .Select(s => new AppointmentServiceItem(
                        s.Id,
                        s.WorkshopServiceId,
                        s.WorkshopService.Name,
                        s.WorkshopService.ServiceCategory.Name,
                        s.Price,
                        s.WorkshopService.EstimatedDurationMinutes,
                        s.Notes))
                    .ToList(),
                a.Notes
                    .OrderByDescending(n => n.CreatedAt)
                    .Select(n => new AppointmentNoteItem(
                        n.Id,
                        n.Content,
                        n.CreatedAt,
                        n.EmployeeId,
                        n.Employee.FirstName + " " + n.Employee.LastName))
                    .ToList(),
                a.Services.Sum(s => (decimal?)s.Price) ?? 0m))
            .FirstOrDefaultAsync();
    }

    private async Task<ActionResult?> ValidateBaseRequest(int customerId, int vehicleId, int? employeeId, DateTime scheduledAt)
    {
        if (!await db.Customers.AnyAsync(c => c.Id == customerId && c.IsActive))
        {
            return BadRequest(new { message = "Klient nie istnieje." });
        }

        if (!await db.Vehicles.AnyAsync(v => v.Id == vehicleId && v.CustomerId == customerId && v.IsActive))
        {
            return BadRequest(new { message = "Wybrane auto nie nalezy do tego klienta." });
        }

        if (employeeId.HasValue &&
            !await db.Employees.AnyAsync(e => e.Id == employeeId.Value && e.IsActive))
        {
            return BadRequest(new { message = "Wybrany pracownik nie istnieje." });
        }

        if (scheduledAt < DateTime.Today.AddDays(-1))
        {
            return BadRequest(new { message = "Termin wizyty nie moze byc w przeszlosci." });
        }

        return null;
    }
}

public record AppointmentSummaryResponse(
    int Id,
    DateTime ScheduledAt,
    int CustomerId,
    string CustomerName,
    int VehicleId,
    string VehicleBrandName,
    string VehicleModel,
    int? EmployeeId,
    string? EmployeeName,
    int AppointmentStatusId,
    string StatusCode,
    string StatusName,
    int ServicesCount,
    decimal TotalPrice);

public record AppointmentDetailsResponse(
    int Id,
    DateTime ScheduledAt,
    DateTime CreatedAt,
    string? CustomerNotes,
    int CustomerId,
    string CustomerName,
    string CustomerPhone,
    int VehicleId,
    string VehicleBrandName,
    string VehicleModel,
    int VehicleYear,
    int? EmployeeId,
    string? EmployeeName,
    int AppointmentStatusId,
    string StatusCode,
    string StatusName,
    IReadOnlyList<AppointmentServiceItem> Services,
    IReadOnlyList<AppointmentNoteItem> Notes,
    decimal TotalPrice);

public record AppointmentServiceItem(
    int Id,
    int WorkshopServiceId,
    string ServiceName,
    string CategoryName,
    decimal Price,
    int DurationMinutes,
    string? Notes);

public record AppointmentNoteItem(
    int Id,
    string Content,
    DateTime CreatedAt,
    int EmployeeId,
    string EmployeeName);

public record CreateAppointmentRequest(
    int CustomerId,
    int VehicleId,
    int? EmployeeId,
    DateTime ScheduledAt,
    string? CustomerNotes,
    IReadOnlyList<int> WorkshopServiceIds);

public record UpdateAppointmentRequest(
    int VehicleId,
    int? EmployeeId,
    DateTime ScheduledAt,
    string? CustomerNotes);

public record ChangeAppointmentStatusRequest(string StatusCode);

public record AddAppointmentServiceRequest(int WorkshopServiceId, string? Notes);

public record AddAppointmentNoteRequest(int EmployeeId, string Content);
