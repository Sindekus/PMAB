namespace backend.Models;

public class Employee
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<UserAccount> UserAccounts { get; set; } = new List<UserAccount>();

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public ICollection<AppointmentNote> AppointmentNotes { get; set; } = new List<AppointmentNote>();
}
