using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeResponse>>> GetAll()
    {
        var employees = await db.Employees
            .AsNoTracking()
            .Where(employee => employee.IsActive)
            .OrderBy(employee => employee.LastName)
            .ThenBy(employee => employee.FirstName)
            .Select(employee => new EmployeeResponse(
                employee.Id,
                employee.FirstName,
                employee.LastName,
                employee.Email,
                employee.PhoneNumber))
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeResponse>> GetById(int id)
    {
        var employee = await db.Employees
            .AsNoTracking()
            .Where(e => e.Id == id && e.IsActive)
            .Select(e => new EmployeeResponse(e.Id, e.FirstName, e.LastName, e.Email, e.PhoneNumber))
            .FirstOrDefaultAsync();

        if (employee is null)
        {
            return NotFound(new { message = "Pracownik nie istnieje." });
        }

        return Ok(employee);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeResponse>> Create(EmployeeRequest request)
    {
        var validationError = Validate(request);

        if (validationError is not null)
        {
            return validationError;
        }

        var employee = new Employee
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim()
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = employee.Id },
            new EmployeeResponse(employee.Id, employee.FirstName, employee.LastName, employee.Email, employee.PhoneNumber));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeResponse>> Update(int id, EmployeeRequest request)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

        if (employee is null)
        {
            return NotFound(new { message = "Pracownik nie istnieje." });
        }

        var validationError = Validate(request);

        if (validationError is not null)
        {
            return validationError;
        }

        employee.FirstName = request.FirstName.Trim();
        employee.LastName = request.LastName.Trim();
        employee.Email = request.Email.Trim();
        employee.PhoneNumber = request.PhoneNumber.Trim();

        await db.SaveChangesAsync();

        return Ok(new EmployeeResponse(
            employee.Id,
            employee.FirstName,
            employee.LastName,
            employee.Email,
            employee.PhoneNumber));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

        if (employee is null)
        {
            return NotFound(new { message = "Pracownik nie istnieje." });
        }

        var hasAccount = await db.UserAccounts.AnyAsync(a => a.EmployeeId == id && a.IsActive);

        if (hasAccount)
        {
            return BadRequest(new { message = "Nie mozna usunac pracownika powiazanego z aktywnym kontem." });
        }

        employee.IsActive = false;
        await db.SaveChangesAsync();

        return NoContent();
    }

    private static ActionResult? Validate(EmployeeRequest request)
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

public record EmployeeRequest(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber);

public record EmployeeResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber);
