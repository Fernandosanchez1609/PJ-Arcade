using pj_backend.Models.Database.Entities.enums;

namespace pj_backend.Models.Database.Entities
{
    public class Friendship
    {
        public int Id { get; set; }

        public int RequesterId { get; set; }
        public User Requester { get; set; }

        public int AddresseeId { get; set; }
        public User Addressee { get; set; }

        public FriendshipStatus Status { get; set; }
    }
}
