using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var account = await db.UserAccounts
            .Include(userAccount => userAccount.Customer)
            .Include(userAccount => userAccount.Employee)
            .FirstOrDefaultAsync(userAccount =>
                userAccount.Login == request.Login &&
                userAccount.Password == request.Password &&
                userAccount.IsActive);

        if (account is null)
        {
            return Unauthorized(new { message = "Nieprawidlowy login lub haslo." });
        }

        var displayName = account.Role == UserRole.Customer
            ? $"{account.Customer?.FirstName} {account.Customer?.LastName}".Trim()
            : $"{account.Employee?.FirstName} {account.Employee?.LastName}".Trim();

        return Ok(new LoginResponse(
            account.Id,
            account.Role == UserRole.Customer ? "customer" : "employee",
            displayName,
            account.CustomerId,
            account.EmployeeId));
    }
}

public record LoginRequest(string Login, string Password);

public record LoginResponse(
    int UserAccountId,
    string Role,
    string DisplayName,
    int? CustomerId,
    int? EmployeeId);
