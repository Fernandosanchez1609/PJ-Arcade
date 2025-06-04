using pj_backend.Models.Database.Entities.enums;
using pj_backend.Models.Database.Entities;
using pj_backend.Models.Database.Repositories;

namespace pj_backend.Services;

public class FriendshipService
{
    private readonly FriendshipRepository _repository;

    public FriendshipService(FriendshipRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> SendFriendRequestAsync(int requesterId, int addresseeId)
    {
        if (requesterId == addresseeId)
            return false;

        var existing = await _repository.GetFriendshipAsync(requesterId, addresseeId);
        if (existing != null)
            return false;

        var friendship = new Friendship
        {
            RequesterId = requesterId,
            AddresseeId = addresseeId,
            Status = FriendshipStatus.Pending
        };

        await _repository.AddAsync(friendship);
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AcceptRequestAsync(int requestId, int currentUserId)
    {
        var friendship = await _repository.GetByIdAsync(requestId);

        if (friendship == null || friendship.Status != FriendshipStatus.Pending)
            return false;

        if (friendship.AddresseeId != currentUserId)
            return false; 

        friendship.Status = FriendshipStatus.Accepted;
        await _repository.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectRequestAsync(int requestId, int currentUserId)
    {
        var friendship = await _repository.GetByIdAsync(requestId);

        if (friendship == null || friendship.Status != FriendshipStatus.Pending)
            return false;

        if (friendship.AddresseeId != currentUserId)
            return false;

        friendship.Status = FriendshipStatus.Rejected;
        await _repository.SaveChangesAsync();
        return true;
    }



    public async Task<List<Friendship>> GetPendingRequestsAsync(int userId)
    {
        return await _repository.GetPendingRequestsAsync(userId);
    }

    public async Task<List<Friendship>> GetFriendsAsync(int userId)
    {
        return await _repository.GetAllAsync(f =>
            f.Status == FriendshipStatus.Accepted &&
            (f.RequesterId == userId || f.AddresseeId == userId),
            include: new[] { "Requester", "Addressee" }
        );
    }

    public async Task<List<Friendship>> GetAllAsync(
    System.Linq.Expressions.Expression<Func<Friendship, bool>> predicate,
    string[]? include = null)
    {
        return await _repository.GetAllAsync(predicate, include);
    }

}
