namespace backend.Models;

public class UserAccount
{
    public int Id { get; set; }

    public string Login { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public int? CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public int? EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    public bool IsActive { get; set; } = true;
}
