const Club = require('../models/Club');
const Member = require('../models/Member');

const getRecommendedClubs = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all memberships for the current user
    const userMemberships = await Member.find({ userId });
    const joinedClubIds = userMemberships.map(m => m.clubId.toString());

    // Fetch all clubs
    const allClubs = await Club.find();

    // Filter out clubs the user has already joined
    const unjoinedClubs = allClubs.filter(club => !joinedClubIds.includes(club._id.toString()));

    // Sort the unjoined clubs by popularity (number of pending requests for now, or just random if we want a simple algorithm)
    // To make it advanced without expensive aggregation, we'll sort by pendingRequests length (as a proxy for popularity)
    // Or we could aggregate members per club. Let's just do a simple descending sort by pendingRequests length + random factor
    const scoredClubs = unjoinedClubs.map(club => {
      const score = club.pendingRequests.length + (Math.random() * 5); // Add random factor for variety
      return { club, score };
    });

    scoredClubs.sort((a, b) => b.score - a.score);

    // Return top 3
    const topRecommendations = scoredClubs.slice(0, 3).map(sc => sc.club);

    res.json(topRecommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendedClubs };
