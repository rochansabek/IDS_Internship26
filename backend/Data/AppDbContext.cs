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

        public DbSet<AppUser> Users { get; set; }

        public DbSet<Ticket> Tickets { get; set; }

        public DbSet<TicketComment> TicketComments { get; set; }

        public DbSet<TicketActivity> TicketActivities { get; set; }
    }
}