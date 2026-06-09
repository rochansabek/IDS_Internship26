using System;

namespace backend.Models
{
    public class TicketActivity
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public int UserId { get; set; }

        public string Action { get; set; } = string.Empty;

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}