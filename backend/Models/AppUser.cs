namespace backend.Models
{
    public class AppUser
    {
        public int Id { get; set; }

        public string FullName { get; set; } = "";

        public string Email { get; set; } = "";

        public string PasswordHash { get; set; } = "";

        public string Role { get; set; } = "Employee";

        public string Company { get; set; } = "IDS";

        public string Location { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Bio { get; set; } = "";

        public string AvatarUrl { get; set; } = "";
    }
}