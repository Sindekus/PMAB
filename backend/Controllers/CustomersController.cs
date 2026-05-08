using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/customers")]
public class CustomersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerSummaryResponse>>> GetAll()
    {
        var customers = await db.Customers
            .AsNoTracking()
            .Where(customer => customer.IsActive)
            .OrderBy(customer => customer.LastName)
            .ThenBy(customer => customer.FirstName)
            .Select(customer => new CustomerSummaryResponse(
                customer.Id,
                customer.FirstName,
                customer.LastName,
                customer.Email,
                customer.PhoneNumber,
                customer.Vehicles.Count(vehicle => vehicle.IsActive)))
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDetailsResponse>> GetById(int id)
    {
        var customer = await db.Customers
            .AsNoTracking()
            .Include(c => c.Vehicles.Where(v => v.IsActive))
            .ThenInclude(v => v.VehicleBrand)
            .Where(c => c.Id == id && c.IsActive)
            .FirstOrDefaultAsync();

        if (customer is null)
        {
            return NotFound(new { message = "Klient nie istnieje." });
        }

        var details = new CustomerDetailsResponse(
            customer.Id,
            customer.FirstName,
            customer.LastName,
            customer.Email,
            customer.PhoneNumber,
            customer.Vehicles
                .OrderBy(v => v.VehicleBrand.Name)
                .ThenBy(v => v.Model)
                .Select(v => new VehicleSummaryResponse(
                    v.Id,
                    v.VehicleBrand.Name,
                    v.Model,
                    v.Year,
                    v.EngineType))
                .ToList());

        return Ok(details);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerSummaryResponse>> Create(CustomerRequest request)
    {
        var validationError = Validate(request);

        if (validationError is not null)
        {
            return validationError;
        }

        var customer = new Customer
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim()
        };

        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = customer.Id },
            new CustomerSummaryResponse(
                customer.Id,
                customer.FirstName,
                customer.LastName,
                customer.Email,
                customer.PhoneNumber,
                0));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CustomerSummaryResponse>> Update(int id, CustomerRequest request)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

        if (customer is null)
        {
            return NotFound(new { message = "Klient nie istnieje." });
        }

        var validationError = Validate(request);

        if (validationError is not null)
        {
            return validationError;
        }

        customer.FirstName = request.FirstName.Trim();
        customer.LastName = request.LastName.Trim();
        customer.Email = request.Email.Trim();
        customer.PhoneNumber = request.PhoneNumber.Trim();

        await db.SaveChangesAsync();

        var vehiclesCount = await db.Vehicles.CountAsync(v => v.CustomerId == id && v.IsActive);

        return Ok(new CustomerSummaryResponse(
            customer.Id,
            customer.FirstName,
            customer.LastName,
            customer.Email,
            customer.PhoneNumber,
            vehiclesCount));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

        if (customer is null)
        {
            return NotFound(new { message = "Klient nie istnieje." });
        }

        var hasAccount = await db.UserAccounts.AnyAsync(a => a.CustomerId == id && a.IsActive);

        if (hasAccount)
        {
            return BadRequest(new { message = "Nie mozna usunac klienta powiazanego z aktywnym kontem." });
        }

        customer.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static ActionResult? Validate(CustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        {
            return new BadRequestObjectResult(new { message = "Imie i nazwisko sa wymagane." });
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            return new BadRequestObjectResult(new { message = "Podaj poprawny adres email." });
        }

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            return new BadRequestObjectResult(new { message = "Numer telefonu jest wymagany." });
        }

        return null;
    }
}

public record CustomerRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber);

public record CustomerSummaryResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    int VehiclesCount);

public record CustomerDetailsResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    IReadOnlyList<VehicleSummaryResponse> Vehicles);

public record VehicleSummaryResponse(
    int Id,
    string BrandName,
    string Model,
    int Year,
    string EngineType);
