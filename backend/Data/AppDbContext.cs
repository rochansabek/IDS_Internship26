using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // Users
        public DbSet<AppUser> Users { get; set; }

        // Tickets
        public DbSet<Ticket> Tickets { get; set; }

        // Comments
        public DbSet<TicketComment> TicketComments { get; set; }

        // Activity History
        public DbSet<TicketActivity> TicketActivities { get; set; }

        // File Attachments
        public DbSet<Attachment> Attachments { get; set; }

        // Notifications
        public DbSet<Notification> Notifications { get; set; }
    }
}