using System;

namespace backend.Models
{
    public class TicketComment
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public int UserId { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsInternalNote { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}