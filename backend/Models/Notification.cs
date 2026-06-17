namespace backend.Models;

public class Notification
{
    public int Id { get; set; }

    // Optional user who should receive the notification
    public int? UserId { get; set; }

    // Related ticket
    public int? TicketId { get; set; }

    // Notification text
    public string Message { get; set; } = string.Empty;

    // Read / Unread
    public bool IsRead { get; set; } = false;

    // Archive support
    public bool IsArchived { get; set; } = false;

    // Creation timestamp
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}