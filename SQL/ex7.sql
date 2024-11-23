-- View #1 -- 


-- Leaderboard view
CREATE VIEW LeaderboardView AS
SELECT 
    UserID,
    Username,
    Points,
    LifetimePoints,
    Streak,
    PredictionAccuracy
FROM User
ORDER BY PredictionAccuracy DESC, Streak DESC, LifetimePoints DESC;

-- Get top 10 users from the leaderboard
SELECT * 
FROM LeaderboardView
LIMIT 10;

-- Try to insert a user directly into the view
INSERT INTO LeaderboardView (UserID, Username, Points, LifetimePoints, Streak, PredictionAccuracy)
VALUES ('u123456', 'NewUser', 100, 500, 2, 85.5);


-- View #2 --

-- Create a poll performance view
CREATE VIEW PollPerformanceView AS
SELECT 
    PollID,
    Title,
    TotalVotes,
    PercentageVotesA,
    PercentageVotesB,
    CASE 
        WHEN PercentageVotesA > 0.5 THEN 'Option A Favored'
        WHEN PercentageVotesB > 0.5 THEN 'Option B Favored'
        ELSE 'Balanced'
    END AS VotingTrend,
    TotalPredictions,
    PercentagePredictionsA,
    PercentagePredictionsB
FROM Poll
WHERE TotalVotes > 0
ORDER BY TotalVotes DESC, TotalPredictions DESC;

-- Get the top 5 polls based on total votes
SELECT * 
FROM PollPerformanceView
LIMIT 5;

-- Trying to update a specific poll's trend
UPDATE PollPerformanceView 
SET VotingTrend = 'Option A Dominated'
WHERE PollID = 1;

